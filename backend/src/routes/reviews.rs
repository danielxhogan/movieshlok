use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{
  ReviewsMovieId,
  SelectingReview,
  UserMovie,
  InsertingNewReview,
  InsertingNewRating,
  InsertingNewLike
};
use crate::db::reviews::ReviewsDbManager;
use crate::routes::{with_form_body, auth_check, respond, with_clients};
use crate::utils::error_handling::{AppError, ErrorType};
use crate::utils::websockets::{ClientList, Client};

use warp::{Filter, reject, ws::{WebSocket, Message}};
use futures::{FutureExt, StreamExt};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::Utc;
use std::env;

// STRUCTS FOR QUERYING DATABASE
// **************************************************

// results from db query for all reviews for a movie
// sent to client in response to get_reviews endpoint
#[derive(Serialize)]
struct GetReviewsResponse {
  reviews: Box<Vec<SelectingReview>>
}

// sent from client when posting a new review
#[derive(Deserialize, Debug)]
struct IncomingNewReview {
    pub jwt_token: String,
    pub movie_id: String,
    pub review: String,
    pub rating: i32,
    pub liked: bool
}

// sent from client to get a user's rating for a movie
#[derive(Deserialize, Debug)]
struct IncomingUserMovie {
  pub jwt_token: String,
  pub movie_id: String
}

// sent from client when posting a new rating
#[derive(Deserialize, Debug)]
struct IncomingNewRating {
    pub jwt_token: String,
    pub movie_id: String,
    pub rating: i32,
}

// sent from client when posting a new like
#[derive(Deserialize, Debug)]
struct IncomingNewLike {
    pub jwt_token: String,
    pub movie_id: String,
    pub liked: bool
}

// STRUCTS FOR MANAGING WEBSOCKETS
// **************************************************
#[derive(Deserialize, Debug)]
struct WsRegisterRequest {
  jwt_token: Option<String>,
  topic: String,
  uuid: Option<String>
}

#[derive(Serialize, Debug)]
struct WsRegisterResponse {
    ws_url: String,
    uuid: String
}

#[derive(Deserialize, Debug)]
struct WsUnregisterRequest {
  uuid: String
}

#[derive(Deserialize, Debug)]
struct WsConnectionRequest {
  uuid: String
}


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

#[derive(Serialize, Debug)]
struct WsOkResponse {
  message: String
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
  .or(post_review_filters(pool.clone()))
  .or(post_rating_filters(pool.clone()))
  .or(post_like_filters(pool.clone()))
  .or(register_ws_client_filters(ws_client_list.clone()))
  .or(unregister_ws_client_filters(ws_client_list.clone()))
  .or(make_ws_connection_filters(ws_client_list.clone()))
  .or(emit_review_filters(ws_client_list.clone()))
}

// ENDPOINTS FOR SELECTING FROM DATABASE
// ********************************************************
fn get_reviews_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("reviews")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<ReviewsMovieId>())
    .and_then(get_reviews)
}

async fn get_reviews(mut reviews_db_manager: ReviewsDbManager, get_reviews_params: ReviewsMovieId)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = reviews_db_manager
    .get_reviews(get_reviews_params)
    .map(|reviews| { GetReviewsResponse { reviews } });

  respond(response, warp::http::StatusCode::OK)
}

fn get_rating_like_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("rating-like")
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

// ENDPOINTS FOR INSERTING INTO/UPDATING DATABASE
// ********************************************************

fn post_review_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("review")
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
    review: new_review.review,
    rating: new_review.rating,
    created_at
  };

  let new_rating = InsertingNewRating {
    user_id,
    movie_id: new_review.movie_id.clone(),
    rating: new_review.rating
  };

  let new_like = InsertingNewLike {
    user_id,
    movie_id: new_review.movie_id,
    liked: new_review.liked
  };

  let rating_response = reviews_db_manager.post_rating(new_rating);
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
  warp::path!("rating")
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
    rating: new_rating.rating
  };

  let response = reviews_db_manager.post_rating(inserting_new_rating);
  respond(response, warp::http::StatusCode::CREATED)
}

fn post_like_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("like")
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

// before a client establishes a websocket connection, this enpoint is used
// to indicate to the server that the client intends to connect. This is a
// normal post request the client sends a request to with the user's user_id
// if the user is logged in, and the topic they want to subscribe to. This
// function creates a new entry for them in the list of clients. The sender
// property is initially None, but once they make the websocket connection
// the sender property is bound to sender part of the websocket channel
// established with this client.
fn register_ws_client_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("ws-register")
    .and(warp::post())
    .and(with_form_body::<WsRegisterRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(register_ws_client)
}

async fn register_ws_client(req: WsRegisterRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  match req.uuid {
    Some(uuid) => {
      let client = client_list.read().await.get(&uuid).cloned();
      match client {
        Some(_) => {
          let err = AppError::new("websocket client already registed", ErrorType::WSClientAlreadyRegisted);
          return respond(Err(err), warp::http::StatusCode::CONFLICT);
        },
        None => {}
      }
    },
    None => {}
  }

  let mut user_id: Option<Uuid> = None;

  // authentication is not required to register, it is only required to emit
  // messages of new reviews because a user must be logged in to leave a review.
  // However, they can still connect to websocket to recieve new posts in real
  // time if other users leave reviews. In the case the user provides a jwt
  // token but it's determined to be invalid, an error response is sent to the
  // client and the function returns immediately so this issue can be dealt with.

  match req.jwt_token {
    Some(token) => {
      let payload = auth_check(token);

      match payload {
        Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
        Ok(payload) => { user_id = Some(payload.claims.user_id); }
          
      }
    }
    None => {}
  };

  let uuid = Uuid::new_v4().as_simple().to_string();

  // add new client to client_list
  client_list.write().await.insert(
    uuid.clone(),
    Client { user_id, topic: req.topic, sender: None }
  );

  // generate url client will to use to make websocket connection
  let backend_host = env::var("BACKEND_HOST").unwrap();
  let backend_port = env::var("BACKEND_PORT").unwrap();
  let ws_url = format!("ws://{}:{}/ws?uuid={}", backend_host, backend_port, uuid);
  let response = WsRegisterResponse { ws_url, uuid };

  respond(Ok(response), warp::http::StatusCode::OK)
}

fn unregister_ws_client_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("ws-unregister")
    .and(warp::post())
    .and(with_form_body::<WsUnregisterRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(unregister_ws_client)
}

async fn unregister_ws_client(req: WsUnregisterRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  client_list.write().await.remove(&req.uuid);
  respond(Ok(WsOkResponse { message: "ok".to_string() }), warp::http::StatusCode::OK)
}

fn make_ws_connection_filters(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("ws")
    .and(warp::ws())
    .and(warp::query::<WsConnectionRequest>())
    .and(with_clients(client_list.clone()))
    .and_then(make_ws_connection)
}

// checks to make sure the client is already registed. If so, creates a new socket
// passes it into the client connection function.
async fn make_ws_connection(ws: warp::ws::Ws, query_params: WsConnectionRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  let client = client_list.read().await.get(&query_params.uuid).cloned();

  match client {
    Some(c) => Ok(ws.on_upgrade(move |socket| client_connection(socket, query_params.uuid, client_list, c))),
    None => {
      let err = AppError::new("websocket client not registered", ErrorType::WSClientNotRegistered);
      Err(warp::reject::custom(err))
    }
  }
}

// splits the websocket into a sender and reciever, then creates
// a new unbounded channel. The sender part of this stream is stored
// as the sender field the in this clients entry in the client_list
// and is used to send them messages. The reciever part of the channel
// is bound to the sends part of the websocket channel.
async fn client_connection(ws: WebSocket, uuid: String, client_list: ClientList, mut client: Client) {
  let (client_ws_sender, mut client_ws_rcv) = ws.split();
  let (client_sender, client_rcv) = mpsc::unbounded_channel();
  let client_rcv = UnboundedReceiverStream::new(client_rcv);

  tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
      if let Err(e) = result {
          eprintln!("error sending websocket msg: {}", e);
      }
  }));

  client.sender = Some(client_sender);
  client_list.write().await.insert(uuid.clone(), client);

  //  println!("{} connected", uuid);

  while let Some(result) = client_ws_rcv.next().await {
      // let msg = match result {
      let _ = match result {
          Ok(msg) => msg,
          Err(e) => {
              eprintln!("error receiving ws message for uuid: {}): {}", uuid.clone(), e);
              break;
          }
      };
      // client_msg(&uuid, msg, &client_list).await;
  }

  client_list.write().await.remove(&uuid);
  //  println!("{} disconnected", uuid);
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

      respond(Ok(WsOkResponse { message: "ok".to_string() }), warp::http::StatusCode::OK)
    }
  }
}
