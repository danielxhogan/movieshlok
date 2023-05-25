pub mod routes;
pub mod db;
pub mod utils;

use db::config::db_connect::establish_connection;
use routes::auth::register;
use utils::error_handling::handle_rejection;
use warp::Filter;
// use db::auth;

#[tokio::main]
async fn main() {
  let pg_pool = establish_connection();

  let routes = register(pg_pool)
    .recover(handle_rejection);

  warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}