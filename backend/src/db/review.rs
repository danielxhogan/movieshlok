use crate::db::PooledPg;
use crate::db::config::schema::{reviews, comments, likes};
use crate::db::config::models::{Review, Comment, Like, GetReviewRequest, GetReviewResponse};
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::prelude::*;

pub struct ReviewDbManager {
  connection:  PooledPg,
}

impl ReviewDbManager {
  pub fn new(connection: PooledPg) -> ReviewDbManager {
    ReviewDbManager {connection}
  }

  pub fn get_review(&mut self, get_review_request: GetReviewRequest)
  -> Result<GetReviewResponse, AppError>
  {
    let reviews = reviews::table
      .filter(reviews::id.eq(&get_review_request.review_id))
      .load::<Review>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting review")
      });

    let reviews = reviews.unwrap();
    let review: Review;

    if reviews.len() == 0 {
      return Err(AppError::new("review not found", ErrorType::ReviewNotFound));
    } else {
      review = reviews[0].clone();
    }

    let comments = comments::table
      .order(comments::created_at.asc())
      .filter(comments::review_id.eq(get_review_request.review_id))
      .offset(get_review_request.offset)
      .limit(get_review_request.limit)
      .load::<Comment>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting comments")
      });

    let comments = comments.unwrap();

    let likes = likes::table
      .filter(likes::user_id.eq(&review.user_id))
      .filter(likes::movie_id.eq(&review.movie_id))
      .load::<Like>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting comments")
      });
    
    let likes = likes.unwrap();
    let like: Like;

    if likes.len() == 0 {
      return Err(AppError::new("review not found", ErrorType::ReviewNotFound));
    } else {
      like = likes[0].clone();
    }

    let response = GetReviewResponse {
      review,
      liked: like.liked,
      comments: Box::new(comments)
    };

    Ok(response)
  }
}