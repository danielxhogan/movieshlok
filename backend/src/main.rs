pub mod routes;
pub mod db;
pub mod utils;

use db::config::db_connect::establish_connection;
use routes::auth::auth_filters;
use utils::error_handling::handle_rejection;

use warp::Filter;

#[tokio::main]
async fn main() {
  let pg_pool = establish_connection();

  let routes = auth_filters(pg_pool)
    .recover(handle_rejection);

  println!("Starting server on port 3030...");

  warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}