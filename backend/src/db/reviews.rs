use crate::db::config::schema::{reviews, users};
use crate::db::config::models::{Review, SelectingReview, ReviewsMovieId, InsertingNewReview};
use crate::utils::error_handling::AppError;

use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, PooledConnection};

type PooledPg = PooledConnection<ConnectionManager<PgConnection>>;


pub struct ReviewsDbManager {
  connection:  PooledPg,
}

impl ReviewsDbManager {
  pub fn new(connection: PooledPg) -> ReviewsDbManager {
    ReviewsDbManager {connection}
  }

  pub fn get_reviews(&mut self, reviews_movie_id: ReviewsMovieId)
  -> Result<Box<Vec<SelectingReview>>, AppError>
  {
    let results = reviews::table
      .inner_join(users::table)
      .select((reviews::id,
        reviews::user_id,
        users::username,
        reviews::movie_id,
        reviews::rating,
        reviews::review,
        reviews::liked))
      .filter(reviews::movie_id.eq(&reviews_movie_id.movie_id))
      .load::<SelectingReview>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting reviews")
      });

    match results {
      Ok(results) => return Ok(Box::new(results)),
      Err(err) => return Err(err)
    }
  }

  pub fn post_review(&mut self, new_review: InsertingNewReview)
  -> Result<Review, AppError>
  {
    diesel::insert_into(reviews::table)
      .values(&new_review)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new review")
      })
  }
}