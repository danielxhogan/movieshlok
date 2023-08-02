use crate::cache::Cache;

use warp::Filter;
use tokio::sync::RwLock;
use std::sync::Arc;
use std::convert::Infallible;

pub fn with_reviews_cache(
    reviews_cache: ReviewsCache,
) -> impl Filter<Extract = (ReviewsCache,), Error = Infallible> + Clone {
    warp::any().map(move || reviews_cache.clone())
}

#[derive(Clone)]
pub struct ReviewsCache {
    reviews: Arc<RwLock<Cache>>,
    rating_like: Arc<RwLock<Cache>>,
    review_details: Arc<RwLock<Cache>>,
    ratings: Arc<RwLock<Cache>>,
}

impl ReviewsCache {
    pub fn new() -> ReviewsCache {
        ReviewsCache {
            reviews: Cache::new("reviews".to_string(), true),
            rating_like: Cache::new("rating_like".to_string(), false),
            review_details: Cache::new("review_details".to_string(), false),
            ratings: Cache::new("ratings".to_string(), true),
        }
    }

    pub async fn store_reviews(
        &self,
        movie_id: String,
        page: i64,
        reviews: String,
    ) {
        let _ = self
            .reviews
            .write()
            .await
            .store(movie_id, Some(page), reviews)
            .await;
    }

    pub async fn retrieve_reviews(
        &self,
        movie_id: &String,
        page: &i64,
    ) -> Result<String, String> {
        self.reviews
            .write()
            .await
            .retrieve(movie_id, Some(page))
            .await
    }

    pub async fn delete_reviews(
        &self,
        movie_id: &String,
    ) -> Result<(), String> {
        self.reviews.write().await.delete(movie_id).await
    }

    pub async fn store_rating_like(
        &self,
        user_id: String,
        movie_id: String,
        rating_like: String,
    ) {
        let name = format!("{}:{}", user_id, movie_id);

        let _ = self
            .rating_like
            .write()
            .await
            .store(name, None, rating_like)
            .await;
    }

    pub async fn retrieve_rating_like(
        &self,
        user_id: &String,
        movie_id: &String,
    ) -> Result<String, String> {
        let name = format!("{}:{}", user_id, movie_id);

        self.rating_like.write().await.retrieve(&name, None).await
    }

    pub async fn delete_rating_like(
        &self,
        user_id: &String,
        movie_id: &String,
    ) -> Result<(), String> {
        let name = format!("{}:{}", user_id, movie_id);
        self.rating_like.write().await.delete(&name).await
    }

    pub async fn store_review_details(
        &self,
        review_id: String,
        review_details: String,
    ) {
        let stored = self
            .review_details
            .write()
            .await
            .store(review_id, None, review_details)
            .await;

        match stored {
            Ok(_) => println!("all good"),
            Err(err) => println!("not good: {}", err),
        };
    }

    pub async fn retrieve_review_details(
        &self,
        review_id: String,
    ) -> Result<String, String> {
        self.review_details
            .write()
            .await
            .retrieve(&review_id, None)
            .await
    }

    pub async fn delete_review_details(
        &self,
        review_id: &String,
    ) -> Result<(), String> {
        self.review_details.write().await.delete(review_id).await
    }

    pub async fn store_ratings(
        &self,
        username: String,
        page: i64,
        ratings: String,
    ) {
        let _ = self
            .ratings
            .write()
            .await
            .store(username, Some(page), ratings)
            .await;
    }

    pub async fn retrieve_ratings(
        &self,
        username: &String,
        page: &i64,
    ) -> Result<String, String> {
        self.ratings
            .write()
            .await
            .retrieve(username, Some(page))
            .await
    }

    pub async fn delete_ratings(
        &self,
        username: &String,
    ) -> Result<(), String> {
        self.ratings.write().await.delete(username).await
    }
}
