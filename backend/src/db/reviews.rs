use crate::db::config::schema::reviews;
use crate::db::config::models::{Review, ReviewsMovieId, InsertingNewReview};
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
  -> Result<Box<Vec<Review>>, AppError>
  {
    let results = reviews::table
      .filter(reviews::movie_id.eq(&reviews_movie_id.movie_id))
      .load::<Review>(&mut self.connection)
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