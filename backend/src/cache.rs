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
    time_stamp: u64,
    capacity: i32,
}

impl Cache {
    fn new(key: String) -> Arc<RwLock<Cache>> {
        Arc::new(RwLock::new(Cache {
            key,
            time_stamp: 5,
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

                let set_key = format!("{}_set", &self.key);
                let hash_key = format!("{}_hash", &self.key);

                self.time_stamp += 1;

                let _: redis::RedisResult<i32> =
                    con.zadd(&set_key, &name, self.time_stamp).await;

                let _: redis::RedisResult<i32> =
                    con.hset(&hash_key, name, value).await;

                let count: i32 =
                    con.zcard(&set_key).await.expect("to get count of members");

                if count > self.capacity {
                    println!("count is: {}", &count);
                    let least_recent: Vec<String> = con
                        .zpopmin(set_key, 1)
                        .await
                        .expect("to get the least recently used");

                    println!("{}, {}", &least_recent[0], &least_recent[1]);

                    // if page != none
                    // split least_recent[0] on _
                    // get the page number
                    // lrem key=uuid, count=1, element=page number

                    let _: redis::RedisResult<i32> =
                        con.hdel(hash_key, &least_recent[0]).await;
                }

                Ok(())
            }
            CacheMethod::LRU => Ok(()),
        }
    }

    // retrieve value
    // delete value
}
