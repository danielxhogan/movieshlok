use crate::cache::establish_connection;
use crate::db::config::models::{GetReviewRequest, GetReviewResponse};

extern crate redis;
use redis::Commands;
// use serde_json::Result;

// pub async fn get_review(
//     get_review_requst: GetReviewRequest,
// ) -> redis::RedisResult<GetReviewResponse> {
//   let con_res = establish_connection();
//   let mut con: redis::Connection;

//     match con_res {
//         Ok(c) => con = c,
//         Err(err) => return Err(err),
//     };
// }

pub async fn set_review(
    get_review_response: GetReviewResponse,
) -> Result<(), String> {
    let con_res = establish_connection();
    let mut con: redis::Connection;

    match con_res {
        Ok(c) => con = c,
        Err(err) => return Err(err.to_string()),
    };

    let serialized_result = serde_json::to_string(&get_review_response);

    match serialized_result {
        Ok(serialized_review) => {
            let result: redis::RedisResult<_> = con.hset(format!("{}", get_review_response.review.id), "data", serialized_review);

            match result {
                Ok(_) => Ok(()),
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
}

pub async fn fetch_int() -> redis::RedisResult<String> {
    let con_res = establish_connection();
    let mut con: redis::Connection;

    match con_res {
        Ok(c) => con = c,
        Err(err) => return Err(err),
    };

    let _: () = con.set("suh", "dudenmeister bro")?;

    con.get("suh")
}
