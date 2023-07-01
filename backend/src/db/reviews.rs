use std::collections::VecDeque;

use crate::db::PooledPg;
use crate::db::config::schema::{reviews, users, ratings, likes};
use crate::db::config::models::{

  // get all reviews for a movie
  GetReviewsRequest,
  SelectingReview,
  GetReviewsResponse,

  // get all ratings for a user
  GetRatingsRequest,
  RatingsReview,
  RatingsRating,
  RatingReview,

  // get rating and like for a user for movie
  UserMovie,
  Rating,
  Like,
  RatingLike,

  // insert new review, rating, or like
  InsertingNewReview,
  Review,
  InsertingNewRating,
  InsertingNewLike,
};
use crate::utils::error_handling::AppError;

use diesel::prelude::*;

pub struct ReviewsDbManager {
  connection:  PooledPg,
}

impl ReviewsDbManager {
  pub fn new(connection: PooledPg) -> ReviewsDbManager {
    ReviewsDbManager {connection}
  }

  pub fn get_reviews(&mut self, get_reviews_request: GetReviewsRequest)
  -> Result<GetReviewsResponse, AppError>
  {
    let count = reviews::table
      .filter(reviews::movie_id.eq(&get_reviews_request.movie_id))
      .count()
      .get_result::<i64>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting count of reviews")
      });

    match count {
      Err(err) => return Err(err),
      Ok(_) => ()
    };

    let count = count.unwrap();

    let results = reviews::table
      .inner_join(users::table)
      .select((reviews::id,
        reviews::user_id,
        users::username,
        reviews::movie_id,
        reviews::rating,
        reviews::review,
        reviews::created_at))
      .order(reviews::created_at.desc())
      .filter(reviews::movie_id.eq(&get_reviews_request.movie_id))
      .offset(get_reviews_request.offset)
      .limit(get_reviews_request.limit)
      .load::<SelectingReview>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting reviews for movie")
      });

    match results {
      Err(err) => return Err(err),

      Ok(results) => {
        let response = GetReviewsResponse {
          total_results: count,
          reviews: Box::new(results)
        };

        Ok(response)
      }
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

  pub fn get_ratings(&mut self, get_ratings_request: GetRatingsRequest)
  -> Result<Box<VecDeque<Option<RatingReview>>>, AppError>
  {
    let mut results = Vec::new();

    let reviews = reviews::table
      .inner_join(users::table.on(
        reviews::user_id.eq(users::id)
      ))
      .inner_join(likes::table.on(
        reviews::movie_id.eq(likes::movie_id)
      ))
      .select((reviews::movie_id,
        reviews::movie_title,
        reviews::poster_path,
        reviews::rating,
        likes::liked,
        reviews::id,
        reviews::created_at))
      .order(reviews::created_at.desc())
      .filter(users::username.eq(&get_ratings_request.username))
      .load::<RatingsReview>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting reviews for user")
      });

    for review in reviews.unwrap().iter() {
      let rating_review = Some(RatingReview {
        movie_id: review.movie_id.clone(),
        movie_title: review.movie_title.clone(),
        poster_path: review.poster_path.clone(),
        rating: review.rating,
        liked: review.liked,
        review_id: Some(review.review_id),
        timestamp: review.timestamp
      });

      results.push(rating_review);
    }

    let ratings = ratings::table
      .inner_join(users::table.on(
        ratings::user_id.eq(users::id)
      ))
      .inner_join(likes::table.on(
        ratings::movie_id.eq(likes::movie_id)
      ))
      .select((ratings::movie_id,
        ratings::movie_title,
        ratings::poster_path,
        ratings::rating,
        likes::liked,
        ratings::last_updated))
      .order(ratings::last_updated.desc())
      .filter(users::username.eq(get_ratings_request.username))
      .filter(ratings::reviewed.eq(false))
      .load::<RatingsRating>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting ratings for user")
      });

    for rating in ratings.unwrap().iter() {
      let rating_review = Some(RatingReview {
        movie_id: rating.movie_id.clone(),
        movie_title: rating.movie_title.clone(),
        poster_path: rating.poster_path.clone(),
        rating: rating.rating,
        liked: rating.liked,
        review_id: None,
        timestamp: rating.timestamp
      });

      results.push(rating_review);
    }

    results.sort_by(|a, b| b.clone().unwrap().timestamp.cmp(&a.clone().unwrap().timestamp));

    let mut results_deque = VecDeque::from(results);
    let mut i = 0;

    while i < get_ratings_request.offset {
      results_deque.pop_front();
      i += 1;
    }

    let size = get_ratings_request.limit as usize;

    results_deque.resize(size, None);

    Ok(Box::new(results_deque))
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

  pub fn post_rating(&mut self, rating: InsertingNewRating, review: bool)
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
    
    // check if users has previously liked this movie
    let previously_liked = likes::table
      .filter(likes::user_id.eq(&rating.user_id))
      .filter(likes::movie_id.eq(&rating.movie_id))
      .load::<Like>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking for existing like in rating post")
      });

    if previously_liked.unwrap().len() == 0 {
      let like = InsertingNewLike {
        movie_id: rating.movie_id.clone(),
        user_id: rating.user_id.clone(),
        liked: false
      };

      let _ = diesel::insert_into(likes::table)
        .values(&like)
        .get_result::<Like>(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while inserting new like in rating post")
        });
    }

    // if user has not submitted a rating for this movie yet
    if previously_rated.unwrap().len() == 0 {
      diesel::insert_into(ratings::table)
        .values(&rating)
        .get_result(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while inserting new rating")
        })

    // if user has previously submitted a rating for this movie and
    // rating is being updated while creating a new review, set reviewed to true
    } else if review {
      diesel::update(ratings::table
        .filter(ratings::user_id.eq(&rating.user_id))
        .filter(ratings::movie_id.eq(&rating.movie_id)))
        .set((ratings::rating.eq(&rating.rating),
          ratings::last_updated.eq(&rating.last_updated),
          ratings::reviewed.eq(true)))
        .get_result(&mut self.connection)
        .map_err(|err| {
          AppError::from_diesel_err(err, "while updating rating")
        })
    
    // if user has previously submitted a rating for this movie and
    // rating is not being updated while creating a new review, leave reviewed alone
    } else {
      diesel::update(ratings::table
        .filter(ratings::user_id.eq(&rating.user_id))
        .filter(ratings::movie_id.eq(&rating.movie_id)))
        .set((ratings::rating.eq(&rating.rating), ratings::last_updated.eq(&rating.last_updated)))
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