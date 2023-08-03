use crate::cache::Cache;

use warp::Filter;
use tokio::sync::RwLock;
use std::sync::Arc;
use std::convert::Infallible;

pub fn with_lists_cache(
    lists_cache: ListsCache,
) -> impl Filter<Extract = (ListsCache,), Error = Infallible> + Clone {
    warp::any().map(move || lists_cache.clone())
}

pub type ListsCache = Arc<ListsCacheStruct>;

#[derive(Clone)]
pub struct ListsCacheStruct {
    lists: Arc<RwLock<Cache>>,
    list_items: Arc<RwLock<Cache>>,
}

impl ListsCacheStruct {
    pub fn new() -> ListsCache {
        Arc::new(ListsCacheStruct {
            lists: Cache::new("lists".to_string(), false),
            list_items: Cache::new("list_items".to_string(), true),
        })
    }

    pub async fn store_lists(&self, username: String, lists: String) {
        let _ = self.lists.write().await.store(username, None, lists).await;
    }

    pub async fn retrieve_lists(
        &self,
        username: &String,
    ) -> Result<String, String> {
        self.lists.write().await.retrieve(username, None).await
    }

    pub async fn delete_lists(&self, username: &String) -> Result<(), String> {
        self.lists.write().await.delete(username).await
    }

    pub async fn store_list_items(
        &self,
        list_id: String,
        page: i64,
        list_items: String,
    ) {
        let _ = self
            .list_items
            .write()
            .await
            .store(list_id, Some(page), list_items)
            .await;
    }

    pub async fn retrieve_list_items(
        &self,
        list_id: &String,
        page: &i64,
    ) -> Result<String, String> {
        self.list_items
            .write()
            .await
            .retrieve(list_id, Some(page))
            .await
    }

    pub async fn delete_list_items(
        &self,
        list_id: &String,
    ) -> Result<(), String> {
        self.list_items.write().await.delete(list_id).await
    }
}
