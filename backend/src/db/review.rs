use crate::db::PooledPg;
use crate::db::config::schema::{reviews, comments};
use crate::db::config::models::{Review, Comment, GetReviewRequest, GetReviewResponse};
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::prelude::*;
use uuid::Uuid;

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
    let review_uuid = Uuid::parse_str(&get_review_request.review_id).unwrap();

    let reviews = reviews::table
      .filter(reviews::id.eq(&review_uuid))
      .load::<Review>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting review")
      });

    let reviews = reviews.unwrap();

    if reviews.len() == 0 {
      return Err(AppError::new("review not found", ErrorType::ReviewNotFound));
    }


    let comments = comments::table
      .filter(comments::review_id.eq(review_uuid))
      .load::<Comment>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting comments")
      });

    let comments = comments.unwrap();

    let response = GetReviewResponse {
      review: reviews[0].clone(),
      comments: Box::new(comments)
    };

    Ok(response)
  }
}