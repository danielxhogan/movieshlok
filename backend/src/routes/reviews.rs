use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{SelectingReview, ReviewsMovieId, IncomingNewReview, InsertingNewReview};
use crate::db::reviews::ReviewsDbManager;
use crate::routes::{with_form_body, auth_check, respond};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject};
use serde::Serialize;


#[derive(Serialize)]
pub struct GetReviewsResponse {
  reviews: Box<Vec<SelectingReview>>
}


fn with_reviews_db_manager(pool: PgPool)
-> impl Filter<Extract = (ReviewsDbManager,), Error = warp::Rejection> + Clone
{
  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move { match pool.get() {
      Ok(conn) => Ok(ReviewsDbManager::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}

pub fn reviews_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  get_reviews_filters(pool.clone())
  .or(post_review_filters(pool))
}


pub fn get_reviews_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("reviews")
    .and(warp::post())
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<ReviewsMovieId>())
    .and_then(get_reviews)
}

async fn get_reviews(mut reviews_db_manager: ReviewsDbManager, get_reviews_params: ReviewsMovieId)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = reviews_db_manager
    .get_reviews(get_reviews_params)
    .map(|reviews| { GetReviewsResponse { reviews } });

  respond(response, warp::http::StatusCode::OK)
}

pub fn post_review_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("review")
    .and(warp::post())
    // .and(warp::cookie("jwt_token"))
    .and(with_reviews_db_manager(pool))
    .and(with_form_body::<IncomingNewReview>())
    .and_then(post_review)
}

// async fn post_review(jwt_token: String, mut reviews_db_manager: ReviewsDbManager, new_review: IncomingNewReview)
async fn post_review(mut reviews_db_manager: ReviewsDbManager, new_review: IncomingNewReview)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_review.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED)},

    Ok(payload) => {
      let user_id = payload.claims.user_id;
      let inserting_new_review = InsertingNewReview {
        user_id,
        movie_id: new_review.movie_id,
        review: new_review.review
      };

      let response = reviews_db_manager.post_review(inserting_new_review);
      return respond(response, warp::http::StatusCode::CREATED);
    }
  };
}