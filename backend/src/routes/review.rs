use crate::db::config::db_connect::PgPool;
use crate::db::config::models::GetReviewRequest;
use crate::db::review::ReviewDbManager;
use crate::routes::{with_form_body, respond};
use crate::utils::websockets::{ClientList};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject};


// filter for adding a database connection object to the handler function for an endpoint
fn with_review_db_manager(pool: PgPool)
-> impl Filter<Extract = (ReviewDbManager,), Error = warp::Rejection> + Clone
{
  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move { match pool.get() {
      Ok(conn) => Ok(ReviewDbManager::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}

// pub fn review_filters(pool: PgPool, ws_client_list: ClientList)
pub fn review_filters(pool: PgPool, _: ClientList)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  get_review_filters(pool.clone())
}

fn get_review_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-review")
    .and(warp::post())
    .and(with_review_db_manager(pool))
    .and(with_form_body::<GetReviewRequest>())
    .and_then(get_review)
}

async fn get_review(mut review_db_manager: ReviewDbManager, get_review_request: GetReviewRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  respond(review_db_manager.get_review(get_review_request), warp::http::StatusCode::OK)
}