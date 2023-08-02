use crate::db::config::db_connect::PgPool;
use crate::db::reviews::ReviewsDbManager;
use crate::db::config::models::{
    DeleteRatingRequest, GetRatingsRequest, GetRatingsResponse,
    GetReviewsRequest, GetReviewsResponse, InsertingNewLike,
    InsertingNewRating, InsertingNewReview, UserMovie, RatingLike,
};

use crate::cache::reviews::{ReviewsCache, with_reviews_cache};
use crate::routes::{auth_check, respond, with_form_body};

use crate::utils::error_handling::{AppError, ErrorType};
use crate::utils::websockets::{
    make_ws_connection, register_ws_client, saul_good_man, with_clients,
    ClientList, WsConnectionRequest, WsRegisterRequest, WsUnregisterRequest,
};

use warp::{reject, ws::Message, Filter};
use serde::Deserialize;
use uuid::Uuid;
use chrono::Utc;

// STRUCTS FOR QUERYING DATABASE
// **************************************************

// sent from client when posting a new review
#[derive(Deserialize)]
struct IncomingNewReview {
    jwt_token: String,
    username: String,
    movie_id: String,
    movie_title: String,
    poster_path: String,
    review: String,
    rating: i32,
    liked: bool,
}

// sent from client to get a user's rating for a movie
#[derive(Deserialize)]
struct IncomingUserMovie {
    jwt_token: String,
    movie_id: String,
}

// sent from client when posting a new rating
#[derive(Deserialize)]
struct IncomingNewRating {
    jwt_token: String,
    username: String,
    movie_id: String,
    movie_title: String,
    poster_path: String,
    rating: i32,
}

// sent from client when posting a new like
#[derive(Deserialize)]
struct IncomingNewLike {
    jwt_token: String,
    movie_id: String,
    liked: bool,
}

#[derive(Deserialize)]
struct IncomingDeleteRatingRequest {
    jwt_token: String,
    rating_id: Uuid,
    movie_id: String,
}

// STRUCTS FOR MANAGING WEBSOCKETS
// **************************************************

#[derive(Deserialize)]
struct WsEmitRequest {
    id: String,
    jwt_token: String,
    username: String,
    topic: String,
    rating: i32,
    review: String,
    created_at: String,
}

// filter for adding a database connection object to the handler function for an endpoint
fn with_reviews_db_manager(
    pool: PgPool,
) -> impl Filter<Extract = (ReviewsDbManager,), Error = warp::Rejection> + Clone
{
    warp::any()
        .map(move || pool.clone())
        .and_then(|pool: PgPool| async move {
            match pool.get() {
                Ok(conn) => Ok(ReviewsDbManager::new(conn)),
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
// **************************************************
pub fn reviews_filters(
    pool: PgPool,
    reviews_cache: ReviewsCache,
    ws_client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    get_reviews_filters(pool.clone(), reviews_cache.clone())
        .or(get_rating_like_filters(pool.clone(), reviews_cache.clone()))
        .or(get_ratings_filters(pool.clone(), reviews_cache.clone()))
        .or(post_review_filters(pool.clone(), reviews_cache.clone()))
        .or(post_rating_filters(pool.clone(), reviews_cache.clone()))
        .or(post_like_filters(pool.clone(), reviews_cache.clone()))
        .or(delete_rating_filters(pool.clone(), reviews_cache.clone()))
        .or(register_reviews_ws_client_filters(ws_client_list.clone()))
        .or(unregister_reviews_ws_client_filters(ws_client_list.clone()))
        .or(make_reviews_ws_connection_filters(ws_client_list.clone()))
        .or(emit_review_filters(ws_client_list.clone()))
}

// ENDPOINTS FOR SELECTING FROM DATABASE
// *************************************************************************************************

// GET ALL REVIEWS FOR A MOVIE
// **************************************************
fn get_reviews_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("get-reviews")
        .and(warp::post())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<GetReviewsRequest>())
        .and_then(get_reviews)
}

async fn get_reviews(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    get_reviews_request: GetReviewsRequest,
) -> Result<impl warp::Reply, warp::Rejection> {
    let cached_value = cache
        .retrieve_reviews(
            &get_reviews_request.movie_id,
            &get_reviews_request.offset,
        )
        .await;

    match cached_value {
        Ok(value) => {
            // println!("got the value: {}", value);
            let response: Result<GetReviewsResponse, serde_json::Error> =
                serde_json::from_str(&value[..]);

            match response {
                Ok(r) => return respond(Ok(r), warp::http::StatusCode::OK),
                Err(err) => println!("couldn't deserialize the value: {}", err),
            }
        }
        // Err(err) => println!("Didn't get the value: {}", err),
        Err(_) => (),
    }

    let response = reviews_db_manager.get_reviews(&get_reviews_request);

    match response {
        Ok(response) => {
            let serialized_reviews = serde_json::to_string(&response).unwrap();

            cache
                .store_reviews(
                    get_reviews_request.movie_id,
                    get_reviews_request.offset,
                    serialized_reviews,
                )
                .await;

            respond(Ok(response), warp::http::StatusCode::OK)
        }
        Err(err) => respond(Err(err), warp::http::StatusCode::OK),
    }
}

// GET RATING AND LIKE FOR A MOVIE
// **************************************************
fn get_rating_like_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("get-rating-like")
        .and(warp::post())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingUserMovie>())
        .and_then(get_rating_like)
}

async fn get_rating_like(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    user_movie: IncomingUserMovie,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(user_movie.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;

    let cached_value = cache
        .retrieve_rating_like(&user_id.to_string(), &user_movie.movie_id)
        .await;

    match cached_value {
        Ok(value) => {
            // println!("got the value: {}", value);
            let response: Result<RatingLike, serde_json::Error> =
                serde_json::from_str(&value[..]);

            match response {
                Ok(r) => return respond(Ok(r), warp::http::StatusCode::OK),
                Err(err) => println!("couldn't deserialize the value: {}", err),
            }
        }
        // Err(err) => println!("Didn't get the value: {}", err),
        Err(_) => (),
    }

    let user_movie = UserMovie {
        user_id,
        movie_id: user_movie.movie_id,
    };

    let response = reviews_db_manager.get_rating_like(&user_movie);

    match response {
        Ok(response) => {
            let serialized_reviews = serde_json::to_string(&response).unwrap();

            cache
                .store_rating_like(
                    user_id.to_string(),
                    user_movie.movie_id,
                    serialized_reviews,
                )
                .await;

            respond(Ok(response), warp::http::StatusCode::OK)
        }
        Err(err) => respond(Err(err), warp::http::StatusCode::OK),
    }
}

// GET ALL RATINGS FOR A USER
// **************************************************
fn get_ratings_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("get-ratings")
        .and(warp::post())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<GetRatingsRequest>())
        .and_then(get_ratings)
}

async fn get_ratings(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    get_ratings_request: GetRatingsRequest,
) -> Result<impl warp::Reply, warp::Rejection> {
    let cached_value = cache
        .retrieve_ratings(
            &get_ratings_request.username,
            &get_ratings_request.offset,
        )
        .await;

    match cached_value {
        Ok(value) => {
            // println!("got the value: {}", value);
            let response: Result<GetRatingsResponse, serde_json::Error> =
                serde_json::from_str(&value[..]);

            match response {
                Ok(r) => return respond(Ok(r), warp::http::StatusCode::OK),
                Err(err) => println!("couldn't deserialize the value: {}", err),
            }
        }
        // Err(err) => println!("Didn't get the value: {}", err),
        Err(_) => (),
    }

    let response = reviews_db_manager.get_ratings(&get_ratings_request);

    match response {
        Ok(response) => {
            let serialized_reviews = serde_json::to_string(&response).unwrap();

            cache
                .store_ratings(
                    get_ratings_request.username,
                    get_ratings_request.offset,
                    serialized_reviews,
                )
                .await;

            respond(Ok(response), warp::http::StatusCode::OK)
        }
        Err(err) => respond(Err(err), warp::http::StatusCode::OK),
    }
}

// ENDPOINTS FOR INSERTING INTO/UPDATING/DELETING DATABASE
// *************************************************************************************************

// CREATE A NEW REVIEW IN THE DATABASE
// **************************************************
fn post_review_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("post-review")
        .and(warp::post())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingNewReview>())
        .and_then(post_review)
}

async fn post_review(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    new_review: IncomingNewReview,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(new_review.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;
    let created_at = Utc::now().timestamp();

    let _ = cache.delete_ratings(&new_review.username).await;
    let _ = cache.delete_reviews(&new_review.movie_id).await;
    let _ = cache
        .delete_rating_like(&user_id.to_string(), &new_review.movie_id)
        .await;

    let inserting_new_review = InsertingNewReview {
        user_id,
        movie_id: new_review.movie_id.clone(),
        movie_title: new_review.movie_title.clone(),
        poster_path: new_review.poster_path.clone(),
        review: new_review.review,
        rating: new_review.rating,
        created_at,
    };

    // if db function creates a new rating record,
    // reviewed is initialized to true
    let new_rating = InsertingNewRating {
        user_id,
        movie_id: new_review.movie_id.clone(),
        movie_title: new_review.movie_title.clone(),
        poster_path: new_review.poster_path.clone(),
        rating: new_review.rating,
        last_updated: created_at,
        reviewed: true,
    };

    let new_like = InsertingNewLike {
        user_id,
        movie_id: new_review.movie_id,
        liked: new_review.liked,
    };

    // if a rating already exists for this movie for this user
    // db function will update the rating record to make sure reviewed = true
    let rating_response = reviews_db_manager.post_rating(new_rating, true);
    match rating_response {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::BAD_REQUEST)
        }
        Ok(_) => (),
    }

    let like_response = reviews_db_manager.post_like(new_like);
    match like_response {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::BAD_REQUEST)
        }
        Ok(_) => (),
    }

    let review_response = reviews_db_manager.post_review(inserting_new_review);
    match review_response {
        Err(err) => respond(Err(err), warp::http::StatusCode::BAD_REQUEST),
        Ok(response) => respond(Ok(response), warp::http::StatusCode::CREATED),
    }
}

// CREATE/UPDATE RATING FOR A USER
// **************************************************
fn post_rating_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("post-rating")
        .and(warp::post())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingNewRating>())
        .and_then(post_rating)
}

async fn post_rating(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    new_rating: IncomingNewRating,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(new_rating.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;

    let _ = cache.delete_ratings(&new_rating.username).await;
    let _ = cache
        .delete_rating_like(&user_id.to_string(), &new_rating.movie_id)
        .await;

    let inserting_new_rating = InsertingNewRating {
        user_id,
        movie_id: new_rating.movie_id,
        movie_title: new_rating.movie_title.clone(),
        poster_path: new_rating.poster_path.clone(),
        rating: new_rating.rating,
        last_updated: Utc::now().timestamp(),
        reviewed: false,
    };

    let response = reviews_db_manager.post_rating(inserting_new_rating, false);
    respond(response, warp::http::StatusCode::CREATED)
}

// CREATE/UPDATE LIKE FOR A USER
// **************************************************
fn post_like_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("post-like")
        .and(warp::post())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingNewLike>())
        .and_then(post_like)
}

async fn post_like(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    new_like: IncomingNewLike,
) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = auth_check(new_like.jwt_token);

    match payload {
        Err(err) => {
            return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)
        }
        Ok(_) => (),
    }

    let payload = payload.unwrap();
    let user_id = payload.claims.user_id;

    let _ = cache
        .delete_rating_like(&user_id.to_string(), &new_like.movie_id)
        .await;

    let inserting_new_like = InsertingNewLike {
        user_id,
        movie_id: new_like.movie_id,
        liked: new_like.liked,
    };

    let response = reviews_db_manager.post_like(inserting_new_like);
    respond(response, warp::http::StatusCode::CREATED)
}

// DELETE RATING
// **************************************************
fn delete_rating_filters(
    pool: PgPool,
    cache: ReviewsCache,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("delete-rating")
        .and(warp::delete())
        .and(with_reviews_db_manager(pool))
        .and(with_reviews_cache(cache))
        .and(with_form_body::<IncomingDeleteRatingRequest>())
        .and_then(delete_rating)
}

async fn delete_rating(
    mut reviews_db_manager: ReviewsDbManager,
    cache: ReviewsCache,
    delete_request: IncomingDeleteRatingRequest,
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

    let _ = cache
        .delete_rating_like(&user_id.to_string(), &delete_request.movie_id)
        .await;

    let delete_rating_request = DeleteRatingRequest {
        user_id,
        rating_id: delete_request.rating_id,
    };

    let response = reviews_db_manager.delete_rating(delete_rating_request);
    respond(response, warp::http::StatusCode::OK)
}

// ENPOINTS FOR MANAGING WEBSOCKETS
// *************************************************************************************************

fn register_reviews_ws_client_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("register-reviews-ws")
        .and(warp::post())
        .and(with_form_body::<WsRegisterRequest>())
        .and(with_clients(client_list))
        .and_then(register_reviews_ws_client)
}

async fn register_reviews_ws_client(
    req: WsRegisterRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    let response = register_ws_client(req, client_list, "reviews-ws").await;
    respond(response, warp::http::StatusCode::OK)
}

fn unregister_reviews_ws_client_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("unregister-reviews-ws")
        .and(warp::post())
        .and(with_form_body::<WsUnregisterRequest>())
        .and(with_clients(client_list))
        .and_then(unregister_reviews_ws_client)
}

async fn unregister_reviews_ws_client(
    req: WsUnregisterRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    client_list.write().await.remove(&req.uuid);
    respond(saul_good_man(), warp::http::StatusCode::OK)
}

fn make_reviews_ws_connection_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("reviews-ws")
        .and(warp::ws())
        .and(warp::query::<WsConnectionRequest>())
        .and(with_clients(client_list))
        .and_then(make_reviews_ws_connection)
}

// checks to make sure the client is already registed. If so, creates a new socket
// passes it into the client connection function.
async fn make_reviews_ws_connection(
    ws: warp::ws::Ws,
    query_params: WsConnectionRequest,
    client_list: ClientList,
) -> Result<impl warp::Reply, warp::Rejection> {
    make_ws_connection(ws, query_params, client_list).await
}

fn emit_review_filters(
    client_list: ClientList,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
    warp::path!("emit-review")
        .and(with_form_body::<WsEmitRequest>())
        .and(with_clients(client_list))
        .and_then(emit_review)
}

// the client sends a request to this endpoint whenever a new review
// is successfully created in the database. It loops through the list
// clients in the reviews client_list and sends the new reviw to any
// client subscribed to the same topic as the new review, meaning
// that client is currently viewing the movieDetails page for movie
// that the new review is for.
async fn emit_review(
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
                "id={};user_id={};username={};movie_id={};rating={};review={};created_at={}",
                req.id, user_id, req.username, req.topic, req.rating, req.review, req.created_at
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
