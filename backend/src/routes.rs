pub mod auth;
pub mod lists;
pub mod review;
pub mod reviews;
pub mod tmdb;

use crate::routes::auth::Claims;
use crate::utils::error_handling::{AppError, ErrorType};

use jsonwebtoken::{decode, DecodingKey, TokenData, Validation};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::env;
use warp::Filter;

// filter for extracting form data from a request and passing into handler function
fn with_form_body<T: DeserializeOwned + Send>(
) -> impl Filter<Extract = (T,), Error = warp::Rejection> + Clone {
    warp::body::content_length_limit(1024 * 16).and(warp::body::form())
}

pub fn auth_check(jwt_token: String) -> Result<TokenData<Claims>, AppError> {
    let jwt_secret = env::var("JWT_SECRET").unwrap();

    decode::<Claims>(
        &jwt_token,
        &DecodingKey::from_secret(&jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| {
        return AppError::new("invalid jwt token", ErrorType::InvalidJwtToken);
    })
}

fn respond<T: Serialize>(
    result: Result<T, AppError>,
    status: warp::http::StatusCode,
) -> Result<impl warp::Reply, warp::Rejection> {
    match result {
        Ok(response) => Ok(warp::reply::with_status(
            warp::reply::json(&response),
            status,
        )),
        Err(err) => {
            log::error!("Error while trying to respond: {}", err.to_string());
            Err(warp::reject::custom(err))
        }
    }
}
