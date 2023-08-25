use config::*;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::time::{Instant, Duration};

pub async fn get_reviews(limit: &str, offset: &str) {
    let params = [("movie_id", MOVIE_ID), ("limit", limit), ("offset", offset)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-reviews"))
        .form(&params)
        .send()
        .await;
}

pub async fn get_rating_like() {
    let params = [("jwt_token", JWT_TOKEN.clone()), ("movie_id", MOVIE_ID)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-rating-like"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

pub async fn get_review(review_id: &str) {
    let params = [("review_id", review_id)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-review"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

pub async fn get_ratings(limit: &str, offset: &str) {
    let params = [("username", USERNAME), ("limit", limit), ("offset", offset)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-ratings"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

pub async fn get_lists() {
    let params = [("username", USERNAME)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-lists"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

pub async fn get_list_items(list_id: &str, offset: &str, limit: &str) {
    let params = [("list_id", list_id), ("offset", offset), ("limit", limit)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-list-items"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

pub async fn get_watchlist_items(offset: &str, limit: &str) {
    let params = [("username", USERNAME), ("offset", offset), ("limit", limit)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-watchlist"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

#[tokio::main]
async fn main() {
    // QUERY TEST DATA
    // ****************************************************************
    // Limit will be 50.
    // When getting all reveiws for movie with movie_id, there will be 2 pages of reviews.
    // the user will have 101 ratings for movies with ids 1-100, and movie_id.
    // the first 2 pages will be queried.

    let ids = File::open(format!("{IDS_PATH}")).unwrap();
    let mut buffer = BufReader::new(ids).lines();

    let mut review_id = "".to_string();
    let mut list_id = "".to_string();

    while let Some(line) = buffer.next() {
        let line = line.unwrap();
        let mut parts = line.split("=");
        let name = parts.next().unwrap();
        let id = parts.next().unwrap();

        match name {
             "review_id" => {
                review_id = id.to_string();
            },
            "list_id" => {
                list_id = id.to_string();
            },
            _ => ()
        }
    }

    println!("review_id: {}", review_id);
    println!("list_id: {}", list_id);

    let limit = "100";

    // INITIAL REQUESTS
    // ****************************************************************
    // when testing cache speed, inital requests will query from database and store to cache.
    // all subsequent requests will retrieve from cache.

    // get_reviews(limit, "0").await;
    // get_rating_like().await;
    // get_review(&review_id).await;
    // get_ratings(limit, "0").await;
    // get_lists().await;
    // get_list_items(&list_id, "0", limit).await;
    // get_watchlist_items("0", limit).await;

    // TIMED REQUESTS
    // ****************************************************************
    let now = Instant::now();
    let mut elapsed_time: Duration = Duration::new(0, 0);

    // for _ in 0..100 {
    //     get_reviews(limit, "0").await;
    // }

    // elapsed_time = now.elapsed();
    // println!("Running get_reviews 100 times took {} miliseconds.", elapsed_time.as_millis());

    // for _ in 0..100 {
    //     get_rating_like().await;
    // }

    // elapsed_time = now.elapsed() - elapsed_time;
    // println!("Running get_rating_like 100 times took {} miliseconds.", elapsed_time.as_millis());

    // for _ in 0..100 {
    //     get_review(&review_id).await;
    // }

    // elapsed_time = now.elapsed() - elapsed_time;
    // println!("Running get_review 100 times took {} miliseconds.", elapsed_time.as_millis());

    // for _ in 0..100 {
    //     get_ratings(limit, "0").await;
    // }

    // elapsed_time = now.elapsed() - elapsed_time;
    // println!("Running get_ratings 100 times took {} miliseconds.", elapsed_time.as_millis());

    // for _ in 0..100 {
    //     get_lists().await;
    // }

    // elapsed_time = now.elapsed() - elapsed_time;
    // println!("Running get_lists 100 times took {} miliseconds.", elapsed_time.as_millis());

    // for _ in 0..100 {
    //     get_list_items(&list_id, "0", limit).await;
    // }

    // elapsed_time = now.elapsed() - elapsed_time;
    // println!("Running get_list_items 100 times took {} miliseconds.", elapsed_time.as_millis());

    for _ in 0..100 {
        get_watchlist_items("0", limit).await;
    }

    elapsed_time = now.elapsed() - elapsed_time;
    println!("Running get_list_watchlist_items 100 times took {} miliseconds.", elapsed_time.as_millis());
}
