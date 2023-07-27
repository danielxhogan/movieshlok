extern crate redis;
use redis::Commands;

use crate::cache::establish_connection;

pub async fn fetch_int() -> redis::RedisResult<String> {
  let con_res = establish_connection();
  let mut con: redis::Connection;

  match con_res {
    Ok(c) => con = c,
    Err(err) => { return Err(err) }
  };

  let _: () = con.set("suh", "dudenmeister")?;

  con.get("suh")
}