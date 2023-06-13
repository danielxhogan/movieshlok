use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{
  ReviewsMovieId,
  SelectingReview,
  InsertingNewReview
};
use crate::db::reviews::ReviewsDbManager;
use crate::routes::{with_form_body, auth_check, respond, with_clients};
use crate::utils::error_handling::{AppError, ErrorType};
use crate::utils::websockets::{ClientList, Client};

use warp::{Filter, reject, ws::WebSocket};
use futures::{FutureExt, StreamExt};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use serde::{Serialize, Deserialize};


// results from db query for all reviews for a movie
// sent to client in response to get_reviews endpoint
#[derive(Serialize)]
pub struct GetReviewsResponse {
  reviews: Box<Vec<SelectingReview>>
}

// sent from client when posting a new review
#[derive(Deserialize, Debug)]
pub struct IncomingNewReview {
    pub jwt_token: String,
    pub movie_id: String,
    pub review: String
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

// groups all review enpoints together
pub fn reviews_filters(pool: PgPool, ws_client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  get_reviews_filters(pool.clone())
  .or(post_review_filters(pool))
  .or(ws_filter(ws_client_list.clone()))
}


// ENDPOINTS FOR QUERYING DATABASE
// ********************************************************
pub fn get_reviews_filters(pool: PgPool)
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

pub fn post_review_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("review")
    .and(warp::post())
    // .and(warp::cookie("jwt_token"))
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<IncomingNewReview>())
    .and_then(post_review)
}

// async fn post_review(jwt_token: String, mut reviews_db_manager: ReviewsDbManager, new_review: IncomingNewReview)
async fn post_review(mut reviews_db_manager: ReviewsDbManager, new_review: IncomingNewReview)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_review.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },

    Ok(payload) => {
      let user_id = payload.claims.user_id;
      let inserting_new_review = InsertingNewReview {
        user_id,
        movie_id: new_review.movie_id,
        review: new_review.review
      };

      let response = reviews_db_manager.post_review(inserting_new_review);
      return respond(response, warp::http::StatusCode::CREATED);
    }
  };
}

// ENPOINTS FOR MANAGING SOCKETS
// ********************************************************
pub fn ws_filter(client_list: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("ws")
    .and(warp::ws())
    .and(warp::path::param())
    .and(with_clients(client_list.clone()))
    .and_then(ws)
}


pub async fn ws(ws: warp::ws::Ws, id: String, clients: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  let client = clients.read().await.get(&id).cloned();

  match client {
    Some(c) => Ok(ws.on_upgrade(move |socket| client_connection(socket, id, clients, c))),
    None => {
      let err = AppError::new("webosocket client not registered", ErrorType::WSClientNotRegistered);
      Err(warp::reject::custom(err))
    }
  }
}

pub async fn client_connection(ws: WebSocket, id: String, clients: ClientList, mut client: Client) {
  let (client_ws_sender, mut client_ws_rcv) = ws.split();
  let (client_sender, client_rcv) = mpsc::unbounded_channel();

  let client_rcv = UnboundedReceiverStream::new(client_rcv);
  tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
      if let Err(e) = result {
          eprintln!("error sending websocket msg: {}", e);
      }
  }));

  client.sender = Some(client_sender);
  clients.write().await.insert(id.clone(), client);

  println!("{} connected", id);

  while let Some(result) = client_ws_rcv.next().await {
      // let msg = match result {
      let _ = match result {
          Ok(msg) => msg,
          Err(e) => {
              eprintln!("error receiving ws message for id: {}): {}", id.clone(), e);
              break;
          }
      };
      // client_msg(&id, msg, &clients).await;
  }

  clients.write().await.remove(&id);
  println!("{} disconnected", id);
}