use crate::cache::Cache;

use warp::Filter;
use tokio::sync::RwLock;
use std::sync::Arc;
use std::convert::Infallible;

pub fn with_tmdb_cache(
    tmdb_cache: TmdbCache,
) -> impl Filter<Extract = (TmdbCache,), Error = Infallible> + Clone {
    warp::any().map(move || tmdb_cache.clone())
}

pub type TmdbCache = Box<TmdbCacheStruct>;

#[derive(Clone)]
pub struct TmdbCacheStruct {
    search_results: Arc<RwLock<Cache>>,
    movie_details: Arc<RwLock<Cache>>,
    person_details: Arc<RwLock<Cache>>,
}

impl TmdbCacheStruct {
    pub fn new() -> TmdbCache {
        Box::new(TmdbCacheStruct {
            search_results: Cache::new("search_results".to_string(), true),
            movie_details: Cache::new("movie_details".to_string(), false),
            person_details: Cache::new("person_details".to_string(), false),
        })
    }

    pub async fn store_search_results(
        &self,
        query: String,
        page: String,
        filter: String,
        results: String,
    ) {
        let query_proper = query.replace(" ", "-");
        let name = format!("{}:{}", query_proper, filter);

        let page_no = page
            .parse::<i64>()
            .expect("page string must parse to an int.");

        let _ = self
            .search_results
            .write()
            .await
            .store(name, Some(page_no), results)
            .await;
    }

    pub async fn retrieve_search_results(
        &self,
        query: &String,
        page: &String,
        filter: &String,
    ) -> Result<String, String> {
        let query_proper = query.replace(" ", "-");
        let name = format!("{}:{}", query_proper, filter);

        let page_no = page
            .parse::<i64>()
            .expect("page string must parse to an int.");

        self.search_results
            .write()
            .await
            .retrieve(&name, Some(&page_no))
            .await
    }

    pub async fn delete_search_results(
        &self,
        query: &String,
        filter: &String,
    ) -> Result<(), String> {
        let name = format!("{}_{}", query, filter);

        self.search_results.write().await.delete(&name).await
    }

    pub async fn store_movie_details(&self, movie_id: String, results: String) {
        let movie_id_proper = movie_id.replace(" ", "-");

        let _ = self
            .movie_details
            .write()
            .await
            .store(movie_id_proper, None, results)
            .await;
    }

    pub async fn retrieve_movie_details(
        &self,
        movie_id: &String,
    ) -> Result<String, String> {
        let movie_id_proper = movie_id.replace(" ", "-");

        self.movie_details
            .write()
            .await
            .retrieve(&movie_id_proper, None)
            .await
    }

    pub async fn delete_movie_details(
        &self,
        movie_id: &String,
    ) -> Result<(), String> {
        let movie_id_proper = movie_id.replace(" ", "-");

        self.movie_details
            .write()
            .await
            .delete(&movie_id_proper)
            .await
    }

    pub async fn store_person_details(
        &self,
        person_id: String,
        results: String,
    ) {
        let person_id_proper = person_id.replace(" ", "-");

        let _ = self
            .person_details
            .write()
            .await
            .store(person_id_proper, None, results)
            .await;
    }

    pub async fn retrieve_person_details(
        &self,
        person_id: &String,
    ) -> Result<String, String> {
        let person_id_proper = person_id.replace(" ", "-");

        self.person_details
            .write()
            .await
            .retrieve(&person_id_proper, None)
            .await
    }

    pub async fn delete_person_details(
        &self,
        person_id: &String,
    ) -> Result<(), String> {
        let person_id_proper = person_id.replace(" ", "-");

        self.person_details
            .write()
            .await
            .delete(&person_id_proper)
            .await
    }
}
