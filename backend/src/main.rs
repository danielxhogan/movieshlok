pub mod routes;
pub mod db;
pub mod utils;

use db::config::db_connect::establish_connection;
use routes::auth::auth_filters;
use routes::lists::lists_filters;
use routes::reviews::reviews_filters;
use routes::review::review_filters;
use routes::tmdb::tmdb_filters;
use utils::error_handling::handle_rejection;
use utils::websockets::make_client_list;

use warp::{Filter, http::Method};
use dotenvy::dotenv;

#[tokio::main]
async fn main() {
  dotenv().ok();
  let pg_pool = establish_connection();

  let reviews_ws_client_list = make_client_list();
  let comments_ws_client_list = make_client_list();

  let cors = warp::cors()
    .allow_methods(&[Method::GET, Method::POST, Method::PUT, Method::DELETE])
    .allow_any_origin();

  let routes = auth_filters(pg_pool.clone())
    .or(lists_filters(pg_pool.clone()))
    .or(reviews_filters(pg_pool.clone(), reviews_ws_client_list))
    .or(review_filters(pg_pool, comments_ws_client_list))
    .or(tmdb_filters())
    .recover(handle_rejection)
    .map(|reply| { warp::reply::with_header(reply, "Access-Control-Allow-Credentials", "true")})
    .with(cors);

  println!("Starting server on port 3030...");
  warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
}