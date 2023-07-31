use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{
    DeleteCommentRequest, DeleteReviewRequest, GetReviewRequest,
    GetReviewResponse, InsertingNewComment,
};
use crate::db::review::ReviewDbManager;
use crate::cache;
use crate::cache::reviews::{ReviewsCache, with_reviews_cache};
use crate::routes::{auth_check, respond, with_form_body};
use crate::utils::websockets::{
    make_ws_connection, register_ws_client, saul_good_man, with_clients,
    ClientList, WsConnectionRequest, WsRegisterRequest, WsUnregisterRequest,
};
use crate::utils::error_handling::{AppError, ErrorType};

use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;
use warp::{reject, ws::Message, Filter};

// STRUCTS FOR QUERYING DATABASE
// **************************************************

#[derive(Deserialize)]
struct IncomingNewComment {
    jwt_token: String,
    review_id: Uuid,
    comment: String,
}

#[derive(Deserialize)]
struct IncomingDeleteReviewRequest {
    jwt_token: String,
    review_id: Uuid,
    movie_id: String,
}

#[derive(Deserialize)]
struct IncomingDeleteCommentRequest {
    jwt_token: String,
    comment_id: Uuid,
}

// STRUCTS FOR MANAGING WEBSOCKETS
// **************************************************

#[derive(Deserialize)]
struct WsEmitRequest {
    id: String,
    jwt_token: String,
    username: String,
    topic: String,
    comment: String,
    created_at: String,
}

// filter for adding a database connection object to the handler function for an endpoint
fn with_review_db_manager(
    pool: PgPool,
) -> impl Filter<Extract = (ReviewDbManager,), Error = warp::Rejection> + Clone
{
    warp::any()
        .map(move || pool.clone())
        .and_then(|pool: PgPool| async move {
            match pool.get() {
                Ok(conn) => Ok(ReviewDbManager::new(conn)),
                Err(err) => Err(reject::custom(AppError::new(
                    format!(
                        "Error getting connection from pool: {}",
                        err.to_string()
                    )
                    .as_str(),
                    ErrorType::Internal,
                ))),
            }
        })
}

// ENDPOINTS
// ********************************************************
pub fn review_filters(
    pool: PgPool,
    reviews_cache: ReviewsCache,
    ws_client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    get_review_filters(pool.clone(), reviews_cache.clone())
        .or(post_comment_filters(pool.clone(), reviews_cache.clone()))
        .or(delete_review_filters(pool.clone(), reviews_cache.clone()))
        .or(delete_comment_filters(pool.clone(), reviews_cache.clone()))
        .or(register_comments_ws_client_filters(ws_client_list.clone()))
        .or(unregister_comments_ws_client_filters(
            ws_client_list.clone(),
        ))
        .or(make_comments_ws_connection_filters(ws_client_list.clone()))
        .or(emit_comment_filters(ws_client_list.clone()))
}

// ENDPOINTS FOR SELECTING FROM DATABASE
// ********************************************************

fn get_review_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("get-review")
        .and(warp::post())
        .and(with_review_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<GetReviewRequest>())
        .and_then(get_review)
}

async fn get_review(
    mut review_db_manager: ReviewDbManager,
    cache: ReviewsCache,
    get_review_request: GetReviewRequest,
) -> Result<impl warp::Reply, warp::Rejection> {
    let cached_value = cache
        .retrieve_review_details(get_review_request.review_id.to_string())
        .await;

    match cached_value {
        Ok(value) => {
            println!("got the value: {}", value);
            let response: Result<GetReviewResponse, serde_json::Error> =
                serde_json::from_str(&value[..]);

            match response {
                Ok(r) => return respond(Ok(r), warp::http::StatusCode::OK),
                Err(err) => println!("couldn't deserialize the value: {}", err),
            }
        }
        Err(err) => println!("Didn't get the value: {}", err),
    }

    let response = review_db_manager.get_review(&get_review_request);

    match response {
        Ok(response) => {
            let serialized_reviews = serde_json::to_string(&response).unwrap();

            cache
                .store_review_details(
                    get_review_request.review_id.to_string(),
                    serialized_reviews,
                )
                .await;

            respond(Ok(response), warp::http::StatusCode::OK)
        }
        Err(err) => respond(Err(err), warp::http::StatusCode::OK),
    }
}

// ENDPOINTS FOR INSERTING INTO/UPDATING/DELETING DATABASE
// ********************************************************

fn post_comment_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("post-comment")
        .and(warp::post())
        .and(with_review_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingNewComment>())
        .and_then(post_comment)
}

async fn post_comment(
    mut review_db_manager: ReviewDbManager,
    cache: ReviewsCache,
    new_comment: IncomingNewComment,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(new_comment.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let _ = cache
        .delete_review_details(&new_comment.review_id.to_string())
        .await;

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;
    let created_at = Utc::now().timestamp();

    let inseting_new_comment = InsertingNewComment {
        user_id,
        review_id: new_comment.review_id,
        comment: new_comment.comment,
        created_at,
    };

    let response = review_db_manager.post_comment(inseting_new_comment);
    respond(response, warp::http::StatusCode::CREATED)
}

// DELETE REVIEW
// ********************************************************
fn delete_review_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("delete-review")
        .and(warp::delete())
        .and(with_review_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingDeleteReviewRequest>())
        .and_then(delete_review)
}

async fn delete_review(
    mut review_db_manager: ReviewDbManager,
    cache: ReviewsCache,
    delete_request: IncomingDeleteReviewRequest,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(delete_request.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let _ = cache.delete_reviews(&delete_request.movie_id).await;

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;

    let delete_review_request = DeleteReviewRequest {
        user_id,
        review_id: delete_request.review_id,
        movie_id: delete_request.movie_id,
    };

    let response = review_db_manager.delete_review(delete_review_request);
    respond(response, warp::http::StatusCode::OK)
}

// DELETE COMMENT
// ********************************************************
fn delete_comment_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("delete-comment")
        .and(warp::delete())
        .and(with_review_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingDeleteCommentRequest>())
        .and_then(delete_comment)
}

async fn delete_comment(
    mut review_db_manager: ReviewDbManager,
    cache: ReviewsCache,
    delete_request: IncomingDeleteCommentRequest,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(delete_request.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;

    let delete_comment_request = DeleteCommentRequest {
        user_id,
        comment_id: delete_request.comment_id,
    };

    let response = review_db_manager.delete_comment(delete_comment_request);

    match response {
        Ok(r) => {
            let _ = cache.delete_review_details(&r.review_id.to_string()).await;
            respond(Ok(r), warp::http::StatusCode::OK)
        }
        Err(err) => respond(Err(err), warp::http::StatusCode::OK),
    }
}

// ENPOINTS FOR MANAGING WEBSOCKETS
// ********************************************************

fn register_comments_ws_client_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("register-comments-ws")
        .and(warp::post())
        .and(with_form_body::<WsRegisterRequest>())
        .and(with_clients(client_list))
        .and_then(register_comments_ws_client)
}

async fn register_comments_ws_client(
    req: WsRegisterRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    let response = register_ws_client(req, client_list, "comments-ws").await;
    respond(response, warp::http::StatusCode::OK)
}

fn unregister_comments_ws_client_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("unregister-comments-ws")
        .and(warp::post())
        .and(with_form_body::<WsUnregisterRequest>())
        .and(with_clients(client_list))
        .and_then(unregister_comments_ws_client)
}

async fn unregister_comments_ws_client(
    req: WsUnregisterRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    client_list.write().await.remove(&req.uuid);
    respond(saul_good_man(), warp::http::StatusCode::OK)
}

fn make_comments_ws_connection_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("comments-ws")
        .and(warp::ws())
        .and(warp::query::<WsConnectionRequest>())
        .and(with_clients(client_list))
        .and_then(make_comments_ws_connection)
}

async fn make_comments_ws_connection(
    ws: warp::ws::Ws,
    query_params: WsConnectionRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    make_ws_connection(ws, query_params, client_list).await
}

fn emit_comment_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("emit-comment")
        .and(with_form_body::<WsEmitRequest>())
        .and(with_clients(client_list))
        .and_then(emit_comment)
}

async fn emit_comment(
    req: WsEmitRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(req.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }

        Ok(payload) => {
            let user_id = payload.claims.user_id;
            let message = format!(
                "id={};username={};review_id={};comment={};created_at={}",
                req.id, req.username, req.topic, req.comment, req.created_at
            );

            client_list
                .read()
                .await
                .iter()
                .filter(|(_, client)| {
                    client.user_id != Some(user_id) && client.topic == req.topic
                })
                .for_each(|(_, client)| {
                    if let Some(sender) = &client.sender {
                        let _ = sender.send(Ok(Message::text(&message)));
                    }
                });

            respond(saul_good_man(), warp::http::StatusCode::OK)
        }
    }
}
