use crate::db::PooledPg;
use crate::db::config::schema::{reviews, comments, ratings, likes, users};
use crate::db::config::models::{Review,
  SelectingComment,
  Comment,
  Like,
  GetReviewRequest,
  GetReviewResponse,
  InsertingNewComment,
  DeleteReviewRequest
};
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

    let count = comments::table
      .filter(comments::review_id.eq(&get_review_request.review_id))
      .count()
      .get_result::<i64>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting count of comments")
      });

    match count {
      Err(err) => return Err(err),
      Ok(_) => ()
    };

    let count = count.unwrap();

    let comments = comments::table
      .inner_join(users::table)
      .select((comments::id,
        users::username,
        comments::review_id,
        comments::comment,
        comments::created_at))
      .order(comments::created_at.asc())
      .filter(comments::review_id.eq(get_review_request.review_id))
      .offset(get_review_request.offset)
      .limit(get_review_request.limit)
      .load::<SelectingComment>(&mut self.connection)
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
      total_results: count,
      comments: Box::new(comments)
    };

    Ok(response)
  }

  pub fn post_comment(&mut self, new_comment: InsertingNewComment)
  -> Result<Comment, AppError>
  {
    diesel::insert_into(comments::table)
      .values(&new_comment)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new comment")
      })
  }

  // DELETE REVIEW
  // **************
  pub fn delete_review(&mut self, delete_request: DeleteReviewRequest)
  -> Result<Review, AppError>
  {
    // check that review belongs to user
    let verify = reviews::table
      .filter(reviews::user_id.eq(delete_request.user_id))
      .filter(reviews::id.eq(delete_request.review_id))
      .load::<Review>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking review ownership")
      });
    
    if verify.unwrap().len() != 1 {
      return Err(AppError::new("user doesn't own review", ErrorType::UserDoesntOwnReview));
    }

    // delete all comment for the review
    let _ = diesel::delete(comments::table)
      .filter(comments::review_id.eq(delete_request.review_id))
      .execute(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while deleting comments for review")
      });
    
    // check if the user has any other reviews for the same movie
    let count = reviews::table
      .filter(reviews::user_id.eq(delete_request.user_id))
      .filter(reviews::movie_id.eq(&delete_request.movie_id))
      .count()
      .get_result::<i64>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting count of reviews")
      });

    // if this is the only review, delete their rating
    if count.unwrap() == 1 {
      let _ = diesel::delete(ratings::table)
        .filter(ratings::user_id.eq(delete_request.user_id))
        .filter(ratings::movie_id.eq(delete_request.movie_id))
        .execute(&mut self.connection);
    }

    diesel::delete(reviews::table)
      .filter(reviews::id.eq(delete_request.review_id))
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while deleting review")
      })
  }
}