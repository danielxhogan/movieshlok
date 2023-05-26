use crate::db::config::db_connect::PgPool;
use crate::db::config::models::NewUser;
use crate::routes::{with_json_body, respond};
use crate::db::auth::AuthDbManager;
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject};
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

fn with_auth_db_manager(pool: PgPool) -> impl Filter<Extract = (AuthDbManager,), Error = warp::Rejection> + Clone {

  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move { match pool.get() {
      Ok(conn) => Ok(AuthDbManager::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}

pub fn auth_filters(pool: PgPool,) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
  register_filter(pool)
}

pub fn register_filter(pool: PgPool,) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
  // let cors = warp::cors().allow_any_origin();

  warp::path!("register")
    .and(warp::post())
    .and(with_auth_db_manager(pool))
    .and(with_json_body::<NewUser>())
    .and_then(register_user)
    // .with(warp::cors().allow_any_origin())
}

async fn register_user(mut auth_db_manager: AuthDbManager, new_user: NewUser) -> Result<impl warp::Reply, warp::Rejection> {

  let response = auth_db_manager
    .register_user(new_user)
    .map(|created_user| { RegisterResponse::new(created_user.id) });
    // .with(cors);

  respond(response, warp::http::StatusCode::CREATED)
}