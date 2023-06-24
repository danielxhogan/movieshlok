use crate::db::config::schema::{users, reviews, ratings, likes};

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// AUTH
// ***********************************************
#[derive(Queryable)]
pub struct User {
  pub id: Uuid,
  pub username: String,
  pub email: String,
  pub password: String,
  pub first_name: Option<String>,
  pub last_name: Option<String>,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
  pub username: String,
  pub email: String,
  pub password: String,
}

#[derive(Deserialize)]
pub struct LoginCreds {
  pub username: String,
  pub password: String,
}

// REVIEWS
// ***********************************************
#[derive(Queryable, Serialize, Clone)]
pub struct Review {
  pub id: Uuid,
  pub user_id: Uuid,
  pub movie_id: String,
  pub review: String,
  #[diesel(sql_type = Int4)]
  pub rating: i32,
  #[diesel(sql_type = Int8)]
  pub created_at: i64
}

// sent from client when requesting reviews for a movie
#[derive(Deserialize)]
pub struct GetReviewsRequest {
  pub movie_id: String,
  pub limit: i64,
  pub offset: i64
}

// results from db query for all reviews for a movie
// sent to client in response to get_reviews endpoint
#[derive(Serialize)]
pub struct GetReviewsResponse {
  pub total_results: i64,
  pub reviews: Box<Vec<SelectingReview>>
}

#[derive(Queryable, Serialize)]
pub struct SelectingReview {
  pub id: Uuid,
  pub user_id: Uuid,
  pub username: String,
  pub movie_id: String,
  #[diesel(sql_type = Int4)]
  pub rating: i32,
  pub review: String,
  #[diesel(sql_type = Int8)]
  pub created_at: i64
}

#[derive(Insertable)]
#[diesel(table_name = reviews)]
pub struct InsertingNewReview {
  pub user_id: Uuid,
  pub movie_id: String,
  pub review: String,
  pub rating: i32,
  #[diesel(sql_type = Int8)]
  pub created_at: i64
}


// RATINGS AND LIKES
// ***********************************************
// sent from client when getting a user's rating and like status for a movie
#[derive(Deserialize)]
pub struct UserMovie {
  pub user_id: Uuid,
  pub movie_id: String
}

#[derive(Serialize)]
pub struct RatingLike {
  pub rating: i32,
  pub liked: bool
}

// RATINGS
// ***********************************************
#[derive(Queryable, Serialize)]
pub struct Rating {
  pub id: Uuid,
  pub user_id: Uuid,
  pub movie_id: String,
  #[diesel(sql_type = Int4)]
  pub rating: i32
}

#[derive(Insertable)]
#[diesel(table_name = ratings)]
pub struct InsertingNewRating {
  pub user_id: Uuid,
  pub movie_id: String,
  #[diesel(sql_type = Int4)]
  pub rating: i32
}

// LIKES
// ***********************************************
#[derive(Queryable, Serialize, Clone)]
pub struct Like {
  pub id: Uuid,
  pub user_id: Uuid,
  pub movie_id: String,
  pub liked: bool
}

#[derive(Insertable)]
#[diesel(table_name = likes)]
pub struct InsertingNewLike {
  pub user_id: Uuid,
  pub movie_id: String,
  pub liked: bool
}

// REVIEW AND COMMENTS
// ***********************************************
#[derive(Queryable, Serialize)]
pub struct Comment {
  pub id: Uuid,
  pub use_id: Uuid,
  pub review_id: Uuid,
  pub comment: String,
  #[diesel(sql_type = Int8)]
  pub created_at: i64
}


#[derive(Deserialize)]
pub struct GetReviewRequest {
  pub review_id: Uuid,
  pub limit: i64,
  pub offset: i64
}

#[derive(Serialize)]
pub struct GetReviewResponse {
  pub review: Review,
  pub liked: bool,
  pub comments: Box<Vec<Comment>>
}