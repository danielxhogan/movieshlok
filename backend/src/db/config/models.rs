use crate::db::config::schema::{
    comments, likes, list_items, lists, ratings, reviews, users,
};

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
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

// LISTS
// ***********************************************
#[derive(Queryable, Serialize)]
pub struct List {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub watchlist: bool,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

// sent from client when requesting all lists for a user
#[derive(Deserialize)]
pub struct GetListsRequest {
    pub username: String,
}

#[derive(Insertable)]
#[diesel(table_name = lists)]
pub struct InsertingNewList {
    pub user_id: Uuid,
    pub name: String,
    pub watchlist: bool,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

#[derive(Queryable, Serialize)]
pub struct ListItem {
    pub id: Uuid,
    pub list_id: Uuid,
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    pub created_at: i64,
}

// sent from client when requesting all list_items for a list
#[derive(Deserialize)]
pub struct GetListItemsRequest {
    pub list_id: Uuid,
    pub offset: i64,
    pub limit: i64,
}

// results from db query for all list_items for a list
// sent to client in response to get-list-items endpoint
#[derive(Serialize)]
pub struct GetListItemsResponse {
    pub total_results: i64,
    pub list_items: Box<Vec<ListItem>>,
}

// sent from client when requesting all list_items for the watchlist of a user
#[derive(Deserialize)]
pub struct GetWatchlistRequest {
    pub username: String,
    pub offset: i64,
    pub limit: i64,
}

// when a list is appended checks that the list being appended
// belongs to the user appending
pub struct UserList {
    pub user_id: Uuid,
    pub list_id: Uuid,
}

#[derive(Insertable)]
#[diesel(table_name = list_items)]
pub struct InsertingNewListItem {
    pub list_id: Uuid,
    pub movie_title: String,
    pub movie_id: String,
    pub poster_path: String,
    pub created_at: i64,
}

pub struct DeleteListRequest {
    pub user_id: Uuid,
    pub list_id: Uuid,
}

pub struct DeleteListItemRequest {
    pub user_id: Uuid,
    pub list_item_id: Uuid,
}

// REVIEWS
// ***********************************************
#[derive(Queryable, Serialize, Deserialize, Clone)]
pub struct Review {
    pub id: Uuid,
    pub user_id: Uuid,
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    pub review: String,
    #[diesel(sql_type = Int4)]
    pub rating: i32,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

// sent from client when requesting reviews for a movie
#[derive(Deserialize)]
pub struct GetReviewsRequest {
    pub movie_id: String,
    pub limit: i64,
    pub offset: i64,
}

// results from db query for all reviews for a movie
// sent to client in response to get_reviews endpoint
#[derive(Serialize, Deserialize)]
pub struct GetReviewsResponse {
    pub total_results: i64,
    pub reviews: Box<Vec<SelectingReview>>,
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct SelectingReview {
    pub id: Uuid,
    pub user_id: Uuid,
    pub username: String,
    pub movie_id: String,
    #[diesel(sql_type = Int4)]
    pub rating: i32,
    pub review: String,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

#[derive(Insertable)]
#[diesel(table_name = reviews)]
pub struct InsertingNewReview {
    pub user_id: Uuid,
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    pub review: String,
    pub rating: i32,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

pub struct DeleteReviewRequest {
    pub user_id: Uuid,
    pub review_id: Uuid,
    pub movie_id: String,
}

// RATINGS AND LIKES
// ***********************************************
// sent from client when getting a user's rating and like status for a movie
#[derive(Deserialize)]
pub struct UserMovie {
    pub user_id: Uuid,
    pub movie_id: String,
}

#[derive(Serialize)]
pub struct RatingLike {
    pub rating: i32,
    pub liked: bool,
}

// RATINGS
// ***********************************************
#[derive(Queryable, Serialize)]
pub struct Rating {
    pub id: Uuid,
    pub user_id: Uuid,
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    #[diesel(sql_type = Int4)]
    pub rating: i32,
    #[diesel(sql_type = Int8)]
    pub last_updated: i64,
    pub reviewed: bool,
}

#[derive(Deserialize)]
pub struct GetRatingsRequest {
    pub username: String,
    pub limit: i64,
    pub offset: i64,
}

#[derive(Serialize)]
pub struct GetRatingsResponse {
    pub total_pages: u64,
    pub ratings: Box<VecDeque<Option<RatingReview>>>,
}

#[derive(Queryable)]
pub struct RatingsReview {
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    pub rating: i32,
    pub liked: bool,
    pub review_id: Uuid,
    pub timestamp: i64,
}

#[derive(Queryable)]
pub struct RatingsRating {
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    pub rating: i32,
    pub liked: bool,
    pub rating_id: Uuid,
    pub timestamp: i64,
}

#[derive(Serialize, Clone)]
pub struct RatingReview {
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    pub rating: i32,
    pub liked: bool,
    pub rating_id: Option<Uuid>,
    pub review_id: Option<Uuid>,
    pub timestamp: i64,
}

#[derive(Insertable)]
#[diesel(table_name = ratings)]
pub struct InsertingNewRating {
    pub user_id: Uuid,
    pub movie_id: String,
    pub movie_title: String,
    pub poster_path: String,
    #[diesel(sql_type = Int4)]
    pub rating: i32,
    #[diesel(sql_type = Int8)]
    pub last_updated: i64,
    pub reviewed: bool,
}

pub struct DeleteRatingRequest {
    pub user_id: Uuid,
    pub rating_id: Uuid,
}

// LIKES
// ***********************************************
#[derive(Queryable, Serialize, Clone)]
pub struct Like {
    pub id: Uuid,
    pub user_id: Uuid,
    pub movie_id: String,
    pub liked: bool,
}

#[derive(Insertable)]
#[diesel(table_name = likes)]
pub struct InsertingNewLike {
    pub user_id: Uuid,
    pub movie_id: String,
    pub liked: bool,
}

// REVIEW AND COMMENTS
// ***********************************************
#[derive(Queryable, Serialize)]
pub struct Comment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub review_id: Uuid,
    pub comment: String,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

#[derive(Deserialize)]
pub struct GetReviewRequest {
    pub review_id: Uuid,
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct SelectingComment {
    pub id: Uuid,
    pub username: String,
    pub review_id: Uuid,
    pub comment: String,
    #[diesel(sql_type = Int8)]
    pub created_at: i64,
}

#[derive(Serialize, Deserialize)]
pub struct GetReviewResponse {
    pub review: Review,
    pub liked: bool,
    pub comments: Box<Vec<SelectingComment>>,
}

#[derive(Insertable)]
#[diesel(table_name = comments)]
pub struct InsertingNewComment {
    pub user_id: Uuid,
    pub review_id: Uuid,
    pub comment: String,
    pub created_at: i64,
}

pub struct DeleteCommentRequest {
    pub user_id: Uuid,
    pub comment_id: Uuid,
}
