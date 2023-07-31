pub mod lists;
pub mod review;
pub mod reviews;

extern crate redis;
use redis::{AsyncCommands, RedisResult};
// use std::sync::{Arc, RwLock};
use std::sync::Arc;
use tokio::sync::RwLock;

enum CacheMethod {
    REDIS,
    LRU,
}

const CACHE_METHOD: CacheMethod = CacheMethod::REDIS;
// const CACHE_METHOD: CacheMethod = CacheMethod::LRU;

async fn establish_connection() -> RedisResult<redis::aio::Connection> {
    let client_res = redis::Client::open("redis://127.0.0.1");
    let client: redis::Client;

    match client_res {
        Ok(c) => client = c,
        Err(err) => return Err(err),
    };

    client.get_async_connection().await
}

struct Cache {
    key: String,
    set_key: String,
    hash_key: String,
    time_stamp: u64,
    capacity: i32,
}

impl Cache {
    fn new(key: String) -> Arc<RwLock<Cache>> {
        Arc::new(RwLock::new(Cache {
            key: key.clone(),
            set_key: format!("{}_set", &key),
            hash_key: format!("{}_hash", key),
            time_stamp: 14,
            capacity: 5,
        }))
    }

    async fn store(
        &mut self,
        uuid: String,
        page: Option<i64>,
        value: String,
    ) -> Result<(), String> {
        match CACHE_METHOD {
            CacheMethod::REDIS => {
                let con_res = establish_connection().await;
                let mut con: redis::aio::Connection;

                match con_res {
                    Ok(c) => con = c,
                    Err(err) => return Err(err.to_string()),
                };

                let name: String;

                match page {
                    None => name = uuid,
                    Some(p) => {
                        name = format!("{}_{}", uuid, p);

                        let _: redis::RedisResult<i32> =
                            con.rpush(uuid, page).await;
                    }
                };

                self.time_stamp += 1;

                let _: redis::RedisResult<i32> =
                    con.zadd(&self.set_key, &name, self.time_stamp).await;

                let _: redis::RedisResult<i32> =
                    con.hset(&self.hash_key, name, value).await;

                let count: i32 = con
                    .zcard(&self.set_key)
                    .await
                    .expect("to get count of members");

                if count > self.capacity {
                    println!("count is: {}", &count);
                    let least_recent: Vec<String> = con
                        .zpopmin(&self.set_key, 1)
                        .await
                        .expect("to get the least recently used");

                    println!("{}, {}", &least_recent[0], &least_recent[1]);

                    let least_recent_name = &least_recent[0];

                    let _: redis::RedisResult<i32> =
                        con.hdel(&self.hash_key, &least_recent_name).await;

                    // if page != none
                    match page {
                        Some(_) => {
                            let mut least_recent_split =
                                least_recent_name.split("_");

                            let least_recent_uuid = least_recent_split.next()
                                .expect("set member name of popped item has an underscore");
                            let least_recent_page = least_recent_split.next()
                                .expect("set member name of popped item has an underscore");

                            println!(
                                "least_recent_uuid: {}",
                                &least_recent_uuid
                            );
                            println!(
                                "least_recent_page: {}",
                                &least_recent_page
                            );

                            let pages: Vec<String> = con.lrange(least_recent_uuid, 0, -1).await
                                .expect("there is a list with name of least_recent_uuid");

                            println!("pages: {}", &pages[0]);

                            let _: i32 = con.lrem(least_recent_uuid, 1, least_recent_page).await
                                .expect("will be able to remove the page deleted from pages array");
                        }
                        None => (),
                    }
                }

                Ok(())
            }
            CacheMethod::LRU => Ok(()),
        }
    }

    // retrieve value
    async fn retrieve(
        &self,
        uuid: &String,
        page: Option<&i64>,
    ) -> Result<String, String> {
        match CACHE_METHOD {
            CacheMethod::REDIS => {
                let con_res = establish_connection().await;
                let mut con: redis::aio::Connection;

                match con_res {
                    Ok(c) => con = c,
                    Err(err) => return Err(err.to_string()),
                };

                let response: Result<String, String>;

                match page {
                    Some(p) => {
                        response = con
                            .hget(&self.hash_key, format!("{}_{}", uuid, p))
                            .await
                            .map_err(|err| err.to_string());
                    }
                    None => {
                        response = con
                            .hget(&self.hash_key, uuid)
                            .await
                            .map_err(|err| err.to_string());
                    }
                }

                response
            }
            CacheMethod::LRU => Ok("".to_string()),
        }
    }
    // delete value
}
