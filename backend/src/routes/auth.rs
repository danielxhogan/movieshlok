use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{NewUser, LoginCreds};
use crate::routes::{with_form_body, respond};
use crate::db::auth::AuthDbManager;
use crate::utils::error_handling::{AppError, ErrorType};

use jsonwebtoken::{encode, Header, EncodingKey};
use warp::{Filter, reject};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::env;

#[derive(Debug, Serialize, Clone)]
pub struct RegisterResponse {
  pub id: Uuid,
}

impl RegisterResponse {
  pub fn new(id: Uuid) -> RegisterResponse {
    RegisterResponse { id }
  }
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    username: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct LoginResponse {
  pub jwt_token: String,
  pub username: String
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
  register_filter(pool.clone())
  .or(login_filter(pool))
}

pub fn register_filter(pool: PgPool,) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {

  warp::path!("register")
    .and(warp::post())
    .and(with_auth_db_manager(pool))
    .and(with_form_body::<NewUser>())
    .and_then(register_user)
}

async fn register_user(mut auth_db_manager: AuthDbManager, new_user: NewUser) -> Result<impl warp::Reply, warp::Rejection> {

  let response = auth_db_manager
    .register_user(new_user)
    .map(|created_user| { RegisterResponse::new(created_user.id) });

  respond(response, warp::http::StatusCode::CREATED)
}


pub fn login_filter(pool: PgPool,) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {

  warp::path!("login")
    .and(warp::post())
    .and(with_auth_db_manager(pool))
    .and(with_form_body::<LoginCreds>())
    .and_then(login_user)
}

async fn login_user(mut auth_db_manager: AuthDbManager, login_creds: LoginCreds) -> Result<impl warp::Reply, warp::Rejection> {

  let response = auth_db_manager
    .login_user(&login_creds)
    .map(|()| {
      let claims = Claims { username: login_creds.username.clone() };
      let jwt_secret = env::var("JWT_SECRET").unwrap();
      let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(&jwt_secret.as_ref())).unwrap();

      LoginResponse { jwt_token: token, username: login_creds.username }
    });

  respond(response, warp::http::StatusCode::OK)
}