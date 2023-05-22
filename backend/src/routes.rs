pub mod auth;

use crate::db::config::db_connect::PgPool;
use crate::db::auth::AuthDbOperator;
use crate::utils::error_handling::{AppError, ErrorType};

use serde::de::DeserializeOwned;
use serde::Serialize;

use warp::{Filter, reject};

fn with_auth_db_operator(pool: PgPool) -> impl Filter<Extract = (AuthDbOperator,), Error = warp::Rejection> + Clone {
  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move {  match pool.get() {
      Ok(conn) => Ok(AuthDbOperator::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}

fn with_json_body<T: DeserializeOwned + Send>(
) -> impl Filter<Extract = (T,), Error = warp::Rejection> + Clone {
    warp::body::content_length_limit(1024 * 16).and(warp::body::json())
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