pub mod lists;
pub mod review;
pub mod reviews;

extern crate redis;
use redis::RedisResult;


fn establish_connection() -> RedisResult<redis::Connection> {
  let client_res = redis::Client::open("redis://127.0.0.1");
  let client: redis::Client;

  match client_res {
    Ok(c) => client = c,
    Err(err) => return Err(err)
  };

  client.get_connection()
}