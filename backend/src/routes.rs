pub mod auth;
pub mod tmdb;
pub mod reviews;

use crate::routes::auth::Claims;
use crate::utils::error_handling::{AppError, ErrorType};

use warp::Filter;
use jsonwebtoken::{decode, Validation, DecodingKey, TokenData};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::env;


fn with_form_body<T: DeserializeOwned + Send>()
-> impl Filter<Extract = (T,), Error = warp::Rejection> + Clone
{
    warp::body::content_length_limit(1024 * 16).and(warp::body::form())
}

fn auth_check(jwt_token: String)
-> Result<TokenData<Claims>, AppError>
{
  let jwt_secret = env::var("JWT_SECRET").unwrap();

  decode::<Claims>(&jwt_token, &DecodingKey::from_secret(&jwt_secret.as_ref()), &Validation::default())
    .map_err(|_| {
      return AppError::new("invalid jwt token", ErrorType::InvalidJwtToken);
    })
}

fn respond<T: Serialize>(result: Result<T, AppError>, status: warp::http::StatusCode)
-> Result<impl warp::Reply, warp::Rejection>
{
  match result {
    Ok(response) => {
      Ok(warp::reply::with_status(warp::reply::json(&response), status))
    }
    Err(err) => {
      log::error!("Error while trying to respond: {}", err.to_string());
      Err(warp::reject::custom(err))
    }
  }
}