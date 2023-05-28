pub mod routes;
pub mod db;
pub mod utils;

use db::config::db_connect::establish_connection;
use routes::auth::auth_filters;
use routes::tmdb::tmdb_filters;
use utils::error_handling::handle_rejection;

use warp::{Filter, http::Method};

use dotenvy::dotenv;

#[tokio::main]
async fn main() {
  dotenv().ok();
  let pg_pool = establish_connection();

  let cors = warp::cors()
    .allow_methods(&[Method::GET, Method::POST, Method::PUT, Method::DELETE])
    .allow_any_origin();

  let routes = auth_filters(pg_pool)
    .or(tmdb_filters())
    .recover(handle_rejection)
    .with(cors);

  println!("Starting server on port 3030...");

  warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}