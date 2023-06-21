use crate::db::config::schema::{reviews, users, ratings, likes};
use crate::db::config::models::{
  ReviewsMovieId,
  SelectingReview,
  InsertingNewReview,
  Review,
  UserMovie,
  RatingLike,
  InsertingNewRating,
  Rating,
  InsertingNewLike,
  Like
};
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
        reviews::created_at))
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

  pub fn get_rating_like(&mut self, user_movie: UserMovie)
  -> Result<RatingLike, AppError>
  {
    let ratings = ratings::table
      .filter(ratings::user_id.eq(&user_movie.user_id))
      .filter(ratings::movie_id.eq(&user_movie.movie_id))
      .load::<Rating>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting a user's rating")
      });
    
    let ratings = ratings.unwrap();
    let mut rating = 0;

    if ratings.len() > 0 {
      rating = ratings[0].rating;
    }

    let likes = likes::table
      .filter(likes::user_id.eq(&user_movie.user_id))
      .filter(likes::movie_id.eq(&user_movie.movie_id))
      .load::<Like>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting a user's like")
      });
    
    let likes = likes.unwrap();
    let mut liked = false;

    if likes.len() > 0 {
      liked = likes[0].liked;
    }

    let rating_like = RatingLike {
      rating,
      liked
    };

    Ok(rating_like)
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

  pub fn post_rating(&mut self, rating: InsertingNewRating)
  -> Result<Rating, AppError>
  {
    // check if user has previously rated
    let previously_rated = ratings::table
      .filter(ratings::user_id.eq(&rating.user_id))
      .filter(ratings::movie_id.eq(&rating.movie_id))
      .load::<Rating>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking for existing rating")
      });

    // if user has not submitted a rating for this movie yet
    if previously_rated.unwrap().len() == 0 {
      diesel::insert_into(ratings::table)
        .values(&rating)
        .get_result(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while inserting new rating")
        })

    // if user has previously submitted a rating for this movie
    } else {
      diesel::update(ratings::table
        .filter(ratings::user_id.eq(&rating.user_id))
        .filter(ratings::movie_id.eq(&rating.movie_id)))
        .set(ratings::rating.eq(&rating.rating))
        .get_result(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while updating rating")
        })
    }
  }

  pub fn post_like(&mut self, like: InsertingNewLike)
  -> Result<Like, AppError>
  {
    // check if user previously like
    let previously_liked = likes::table
      .filter(likes::user_id.eq(&like.user_id))
      .filter(likes::movie_id.eq(&like.movie_id))
      .load::<Like>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking for existing like")
      });

    // if user has not submitted a like for this movie yet
    if previously_liked.unwrap().len() == 0 {
      diesel::insert_into(likes::table)
        .values(&like)
        .get_result(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while inserting new like")
        })
    
    // if user has previously submitted a like for this movie
    } else {
      diesel::update(likes::table
        .filter(likes::user_id.eq(&like.user_id))
        .filter(likes::movie_id.eq(&like.movie_id)))
        .set(likes::liked.eq(&like.liked))
        .get_result(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while updating like")
        })
    }
  }
}