use crate::db::config::db_connect::PgPool;
use crate::db::config::models::NewUser;
use crate::db::auth::AuthDbOperator;
use crate::routes::{with_auth_db_operator, with_json_body, respond};

use warp::Filter;

pub fn register(pool: PgPool,) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {

  warp::path!("register")
    .and(warp::post())
    .and(with_auth_db_operator(pool))
    .and(with_json_body::<NewUser>())
    .and_then(register_user)
}

fn register_user(auth_db_operator: AuthDbOperator, user: NewUser) -> Result<impl warp::Reply, warp::Rejection> {
  let response = auth_db_operator.register_user(user);
  respond(response, warp::http::StatusCode::CREATED)
}