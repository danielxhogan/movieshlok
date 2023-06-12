use crate::db::config::schema::{users, reviews};

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
#[derive(Queryable, Serialize)]
pub struct Review {
    pub id: Uuid,
    pub user_id: Uuid,
    pub movie_id: String,
    #[diesel(sql_type = Nullable<Int4>)]
    pub rating: Option<i32>,
    pub review: String,
    pub liked: Option<bool>
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
    #[diesel(sql_type = Nullable<Int4>)]
    pub rating: Option<i32>,
    pub review: String,
    pub liked: Option<bool>
}

#[derive(Deserialize, Insertable, Debug)]
#[diesel(table_name = reviews)]
pub struct InsertingNewReview {
    pub user_id: Uuid,
    pub movie_id: String,
    pub review: String
}