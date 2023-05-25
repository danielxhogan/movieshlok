use crate::db::config::db_connect::PgPool;
use crate::db::config::models::NewUser;
use crate::routes::{with_auth_db_operator, with_json_body, respond};
use crate::db::auth::AuthDbOperator;

use warp::Filter;
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize, Clone)]
pub struct RegisterResponse {
  pub id: Uuid,
}

impl RegisterResponse {
  pub fn new(id: Uuid) -> RegisterResponse {
    RegisterResponse { id }
  }
}

pub fn register(pool: PgPool,) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {

  warp::path!("register")
    .and(warp::post())
    .and(with_auth_db_operator(pool))
    .and(with_json_body::<NewUser>())
    .and_then(register_user)
}

async fn register_user(mut auth_db_operator: AuthDbOperator, new_user: NewUser) -> Result<impl warp::Reply, warp::Rejection> {
  let response = auth_db_operator
    .register_user(new_user)
    .map(|created_user| {
      RegisterResponse::new(created_user.id)
  });

  respond(response, warp::http::StatusCode::CREATED)
}