use crate::db::config::schema::{users, reviews, ratings, likes};

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// AUTH
// ***********************************************
#[derive(Queryable, Serialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

#[derive(Debug, Insertable, Deserialize, Clone)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct LoginCreds {
    pub username: String,
    pub password: String,
}

// REVIEWS
// ***********************************************
#[derive(Queryable, Serialize, Deserialize)]
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

#[derive(Debug, Deserialize, Clone)]
pub struct ReviewsMovieId {
    pub movie_id: String
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

#[derive(Deserialize, Insertable, Debug)]
#[diesel(table_name = reviews)]
pub struct InsertingNewReview {
    pub user_id: Uuid,
    pub movie_id: String,
    pub review: String,
    pub rating: i32,
    #[diesel(sql_type = Int8)]
    pub created_at: i64
}

// RATINGS
// ***********************************************
#[derive(Queryable, Serialize, Deserialize)]
struct Rating {
    pub id: Uuid,
    pub user_id: Uuid,
    pub movie_id: String,
    #[diesel(sql_type = Int4)]
    pub rating: i32
}

#[derive(Deserialize, Insertable, Debug)]
#[diesel(table_name = ratings)]
struct NewRating {
    pub user_id: Uuid,
    pub movie_id: String,
    #[diesel(sql_type = Int4)]
    pub rating: i32
}

// LIKES
// ***********************************************
#[derive(Queryable, Serialize, Deserialize)]
struct Like {
    pub id: Uuid,
    pub user_id: Uuid,
    pub movie_id: String,
    pub liked: bool
}

#[derive(Deserialize, Insertable, Debug)]
#[diesel(table_name = likes)]
struct NewLike {
    pub user_id: Uuid,
    pub movie_id: String,
    pub liked: bool
}