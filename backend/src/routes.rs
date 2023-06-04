pub mod auth;
pub mod tmdb;
pub mod reviews;

use crate::utils::error_handling::AppError;

use warp::Filter;
use serde::de::DeserializeOwned;
use serde::Serialize;

fn with_form_body<T: DeserializeOwned + Send>(
) -> impl Filter<Extract = (T,), Error = warp::Rejection> + Clone {
    warp::body::content_length_limit(1024 * 16).and(warp::body::form())
}

fn respond<T: Serialize>(result: Result<T, AppError>, status: warp::http::StatusCode) -> Result<impl warp::Reply, warp::Rejection> {
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