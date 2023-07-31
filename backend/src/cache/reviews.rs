use crate::cache::Cache;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct ReviewsCache {
    reviews: Arc<RwLock<Cache>>,
}

impl ReviewsCache {
    pub fn new() -> ReviewsCache {
        ReviewsCache {
            reviews: Cache::new("reviews".to_string()),
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

    pub async fn retrieve_review(
        &self,
        movie_id: &String,
        page: &i64,
    ) -> Result<String, String> {
        self.reviews
            .read()
            .await
            .retrieve(movie_id, Some(page))
            .await
    }

    // retrieve review
    // delete review
}
