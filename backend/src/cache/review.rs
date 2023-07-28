use crate::cache::establish_connection;
use crate::db::config::models::{GetReviewRequest, GetReviewResponse};

extern crate redis;
use redis::{Commands, cmd};

pub async fn get_review(
    get_review_reqeust: &GetReviewRequest,
) -> Result<GetReviewResponse, String> {
    let con_res = establish_connection();
    let mut con: redis::Connection;

    match con_res {
        Ok(c) => con = c,
        Err(err) => return Err(err.to_string()),
    };

    // let serialized_result: redis::RedisResult<String> = cmd("HGET")
    //     .arg("review")
    //     .arg(format!("{}", get_review_reqeust.review_id))
    //     .query(&mut con);

    let serialized_result: redis::RedisResult<String> =
        con.hget("review", format!("{}", get_review_reqeust.review_id));

    match serialized_result {
        Ok(serialized_review) => {
            serde_json::from_str(&serialized_review[..])
                .map_err(|err| err.to_string())
        }
        Err(err) => Err(err.to_string()),
    }
}

pub async fn set_review(
    get_review_response: &GetReviewResponse,
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
            let _: redis::RedisResult<i32> = con.hset(
                "review",
                format!("{}", get_review_response.review.id),
                serialized_review,
            );

            // cmd("HSET")
            //     .arg("review")
            //     .arg(format!("{}", get_review_response.review.id))
            //     .arg(serialized_review)
            //     .execute(&mut con);

            Ok(())
        }
        Err(err) => Err(err.to_string()),
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
