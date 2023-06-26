use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{GetReviewRequest, InsertingNewComment};
use crate::db::review::ReviewDbManager;
use crate::routes::{with_form_body, auth_check, respond};
use crate::utils::websockets::{
  with_clients,
  register_ws_client,
  make_ws_connection,
  saul_good_man,
  ClientList,
  WsRegisterRequest,
  WsUnregisterRequest,
  WsConnectionRequest
};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject, ws::Message};
use serde::Deserialize;
use uuid::Uuid;
use chrono::Utc;

// STRUCTS FOR QUERYING DATABASE
// **************************************************

#[derive(Deserialize)]
struct IncomingNewComment {
  jwt_token: String,
  review_id: Uuid,
  comment: String
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
  created_at: String
}


// filter for adding a database connection object to the handler function for an endpoint
fn with_review_db_manager(pool: PgPool)
-> impl Filter<Extract = (ReviewDbManager,), Error = warp::Rejection> + Clone
{
  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move { match pool.get() {
      Ok(conn) => Ok(ReviewDbManager::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}

pub fn review_filters(pool: PgPool, ws_client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  get_review_filters(pool.clone())
    .or(post_comment_filters(pool.clone()))
    .or(register_comments_ws_client_filters(ws_client_list.clone()))
    .or(unregister_comments_ws_client_filters(ws_client_list.clone()))
    .or(make_comments_ws_connection_filters(ws_client_list.clone()))
    .or(emit_comment_filters(ws_client_list.clone()))
}

// ENDPOINTS FOR SELECTING FROM DATABASE
// ********************************************************

fn get_review_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-review")
    .and(warp::post())
    .and(with_review_db_manager(pool))
    .and(with_form_body::<GetReviewRequest>())
    .and_then(get_review)
}

async fn get_review(mut review_db_manager: ReviewDbManager, get_review_request: GetReviewRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  respond(review_db_manager.get_review(get_review_request), warp::http::StatusCode::OK)
}

// ENDPOINTS FOR INSERTING INTO/UPDATING DATABASE
// ********************************************************

fn post_comment_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("post-comment")
    .and(warp::post())
    .and(with_review_db_manager(pool))
    .and(with_form_body::<IncomingNewComment>())
    .and_then(post_comment)
}

async fn post_comment(mut review_db_manager: ReviewDbManager, new_comment: IncomingNewComment)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_comment.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;
  let created_at = Utc::now().timestamp();

  let inseting_new_comment = InsertingNewComment {
    user_id,
    review_id: new_comment.review_id,
    comment: new_comment.comment,
    created_at
  };

  let response = review_db_manager.post_comment(inseting_new_comment);
  respond(response, warp::http::StatusCode::CREATED)
}

// ENPOINTS FOR MANAGING WEBSOCKETS
// ********************************************************

fn register_comments_ws_client_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("register-comments-ws")
    .and(warp::post())
    .and(with_form_body::<WsRegisterRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(register_comments_ws_client)
}

async fn register_comments_ws_client(req: WsRegisterRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = register_ws_client(req, client_list, "comments-ws").await;
  respond(response, warp::http::StatusCode::OK)
}

fn unregister_comments_ws_client_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("unregister-comments-ws")
    .and(warp::post())
    .and(with_form_body::<WsUnregisterRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(unregister_comments_ws_client)
}

async fn unregister_comments_ws_client(req: WsUnregisterRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  client_list.write().await.remove(&req.uuid);
  respond(saul_good_man(), warp::http::StatusCode::OK)
}

fn make_comments_ws_connection_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("comments-ws")
    .and(warp::ws())
    .and(warp::query::<WsConnectionRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(make_comments_ws_connection)
}

async fn make_comments_ws_connection(
  ws: warp::ws::Ws,
  query_params: WsConnectionRequest,
  client_list: ClientList
) -> Result<impl warp::Reply, warp::Rejection>
{
  make_ws_connection(ws, query_params, client_list).await
}

fn emit_comment_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("emit-comment")
    .and(with_form_body::<WsEmitRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(emit_comment)
}

async fn emit_comment(req: WsEmitRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  println!("newComment");
  let payload = auth_check(req.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },

    Ok(payload) => {
      let user_id = payload.claims.user_id;
      let message = format!("id={};username={};review_id={};comment={};created_at={}",
        req.id,
        req.username,
        req.topic,
        req.comment,
        req.created_at
      );

      client_list.read().await.iter()
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