use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{
  GetReviewsRequest,
  UserMovie,
  GetRatingsRequest,
  InsertingNewReview,
  InsertingNewRating,
  InsertingNewLike
};
use crate::db::reviews::ReviewsDbManager;
use crate::routes::{with_form_body, auth_check, respond};
use crate::utils::error_handling::{AppError, ErrorType};
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

use warp::{Filter, reject, ws::Message};
use serde::Deserialize;
use chrono::Utc;

// STRUCTS FOR QUERYING DATABASE
// **************************************************

// sent from client when posting a new review
#[derive(Deserialize)]
struct IncomingNewReview {
  jwt_token: String,
  movie_id: String,
  movie_title: String,
  poster_path: String,
  review: String,
  rating: i32,
  liked: bool
}

// sent from client to get a user's rating for a movie
#[derive(Deserialize)]
struct IncomingUserMovie {
  jwt_token: String,
  movie_id: String
}

// sent from client when posting a new rating
#[derive(Deserialize)]
struct IncomingNewRating {
  jwt_token: String,
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
  liked: bool
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
  created_at: String
}


// filter for adding a database connection object to the handler function for an endpoint
fn with_reviews_db_manager(pool: PgPool)
-> impl Filter<Extract = (ReviewsDbManager,), Error = warp::Rejection> + Clone
{
  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move { match pool.get() {
      Ok(conn) => Ok(ReviewsDbManager::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}


// groups all review enpoints together, imported in main
pub fn reviews_filters(pool: PgPool, ws_client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  get_reviews_filters(pool.clone())
    .or(get_rating_like_filters(pool.clone()))
    .or(get_ratings_filters(pool.clone()))
    .or(post_review_filters(pool.clone()))
    .or(post_rating_filters(pool.clone()))
    .or(post_like_filters(pool.clone()))
    .or(register_reviews_ws_client_filters(ws_client_list.clone()))
    .or(unregister_reviews_ws_client_filters(ws_client_list.clone()))
    .or(make_reviews_ws_connection_filters(ws_client_list.clone()))
    .or(emit_review_filters(ws_client_list.clone()))
}

// ENDPOINTS FOR SELECTING FROM DATABASE
// ********************************************************
fn get_reviews_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-reviews")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<GetReviewsRequest>())
    .and_then(get_reviews)
}

async fn get_reviews(mut reviews_db_manager: ReviewsDbManager, get_reviews_request: GetReviewsRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = reviews_db_manager
    .get_reviews(get_reviews_request);

  respond(response, warp::http::StatusCode::OK)
}

fn get_rating_like_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-rating-like")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<IncomingUserMovie>())
    .and_then(get_rating_like)
}

async fn get_rating_like(mut reviews_db_manager: ReviewsDbManager, user_movie: IncomingUserMovie)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(user_movie.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;

  let user_movie = UserMovie {
    user_id,
    movie_id: user_movie.movie_id
  };

  let response = reviews_db_manager.get_rating_like(user_movie);
  respond(response, warp::http::StatusCode::OK)
}

fn get_ratings_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-ratings")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<GetRatingsRequest>())
    .and_then(get_ratings)
}

async fn get_ratings(mut reviews_db_manager: ReviewsDbManager, get_ratings_request: GetRatingsRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = reviews_db_manager.get_ratings(get_ratings_request);
  respond(response, warp::http::StatusCode::OK)
}

// ENDPOINTS FOR INSERTING INTO/UPDATING DATABASE
// ********************************************************

fn post_review_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("post-review")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<IncomingNewReview>())
    .and_then(post_review)
}


async fn post_review(mut reviews_db_manager: ReviewsDbManager, new_review: IncomingNewReview)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_review.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;
  let created_at = Utc::now().timestamp();

  let inserting_new_review = InsertingNewReview {
    user_id,
    movie_id: new_review.movie_id.clone(),
    movie_title: new_review.movie_title.clone(),
    poster_path: new_review.poster_path.clone(),
    review: new_review.review,
    rating: new_review.rating,
    created_at
  };

  let new_rating = InsertingNewRating {
    user_id,
    movie_id: new_review.movie_id.clone(),
    movie_title: new_review.movie_title.clone(),
    poster_path: new_review.poster_path.clone(),
    rating: new_review.rating,
    last_updated: created_at,
    reviewed: true
  };

  let new_like = InsertingNewLike {
    user_id,
    movie_id: new_review.movie_id,
    liked: new_review.liked
  };

  let rating_response = reviews_db_manager.post_rating(new_rating, true);
  match rating_response {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::BAD_REQUEST) },
    Ok(_) => ()
  }

  let like_response = reviews_db_manager.post_like(new_like);
  match like_response {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::BAD_REQUEST) },
    Ok(_) => ()
  }

  let review_response = reviews_db_manager.post_review(inserting_new_review);
  match review_response {
    Err(err) => respond(Err(err), warp::http::StatusCode::BAD_REQUEST),
    Ok(response) => respond(Ok(response), warp::http::StatusCode::CREATED)
  }
}

fn post_rating_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("post-rating")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<IncomingNewRating>())
    .and_then(post_rating)
}

async fn post_rating(mut reviews_db_manager: ReviewsDbManager, new_rating: IncomingNewRating)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_rating.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;

  let inserting_new_rating = InsertingNewRating {
    user_id,
    movie_id: new_rating.movie_id,
    movie_title: new_rating.movie_title.clone(),
    poster_path: new_rating.poster_path.clone(),
    rating: new_rating.rating,
    last_updated: Utc::now().timestamp(),
    reviewed: false
  };

  let response = reviews_db_manager.post_rating(inserting_new_rating, false);
  respond(response, warp::http::StatusCode::CREATED)
}

fn post_like_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("post-like")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<IncomingNewLike>())
    .and_then(post_like)
}

async fn post_like(mut reviews_db_manager: ReviewsDbManager, new_like: IncomingNewLike)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_like.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;

  let inserting_new_like = InsertingNewLike {
    user_id,
    movie_id: new_like.movie_id,
    liked: new_like.liked
  };

  let response = reviews_db_manager.post_like(inserting_new_like);
  respond(response, warp::http::StatusCode::CREATED)
}

// ENPOINTS FOR MANAGING WEBSOCKETS
// ********************************************************

fn register_reviews_ws_client_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("register-reviews-ws")
    .and(warp::post())
    .and(with_form_body::<WsRegisterRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(register_reviews_ws_client)
}

async fn register_reviews_ws_client(req: WsRegisterRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = register_ws_client(req, client_list, "reviews-ws").await;
  respond(response, warp::http::StatusCode::OK)
}

fn unregister_reviews_ws_client_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("unregister-reviews-ws")
    .and(warp::post())
    .and(with_form_body::<WsUnregisterRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(unregister_reviews_ws_client)
}

async fn unregister_reviews_ws_client(req: WsUnregisterRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  client_list.write().await.remove(&req.uuid);
  respond(saul_good_man(), warp::http::StatusCode::OK)
}

fn make_reviews_ws_connection_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("reviews-ws")
    .and(warp::ws())
    .and(warp::query::<WsConnectionRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(make_reviews_ws_connection)
}

// checks to make sure the client is already registed. If so, creates a new socket
// passes it into the client connection function.
async fn make_reviews_ws_connection(
  ws: warp::ws::Ws,
  query_params: WsConnectionRequest,
  client_list: ClientList
) -> Result<impl warp::Reply, warp::Rejection>
{
  make_ws_connection(ws, query_params, client_list).await
}

fn emit_review_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("emit-review")
    .and(with_form_body::<WsEmitRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(emit_review)
}

// the client sends a request to this endpoint whenever a new review
// is successfully created in the database. It loops through the list
// clients in the reviews client_list and sends the new reviw to any
// client subscribed to the same topic as the new review, meaning
// that client is currently viewing the movieDetails page for movie
// that the new review is for.
async fn emit_review(req: WsEmitRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(req.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },

    Ok(payload) => {
      let user_id = payload.claims.user_id;
      let message = format!("id={};user_id={};username={};movie_id={};rating={};review={};created_at={}",
        req.id,
        user_id,
        req.username,
        req.topic,
        req.rating,
        req.review,
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
