use config::*;
use uuid::Uuid;
use serde_derive::Deserialize;
use std::fs::File;
use std::io::prelude::*;

#[derive(Deserialize)]
pub struct Review {
    pub id: Uuid,
}

#[derive(Deserialize)]
pub struct List {
    pub id: Uuid,
}

pub async fn create_review(movie_id: &str, rating: i32, liked: bool) -> Uuid {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("username", USERNAME.clone()),
        ("movie_id", movie_id.clone()),
        ("movie_title", movie_id.clone()),
        ("poster_path", movie_id),
        ("review", LOREM_IPSUM.clone()),
        ("rating", &rating.to_string()),
        ("liked", &liked.to_string()),
    ];

    let client = reqwest::Client::new();
    let res = client
        .post(format!("{API_BASE_URL}/post-review"))
        .form(&params)
        .send()
        .await
        .unwrap()
        .json::<Review>()
        .await
        .unwrap();

    res.id
}

pub async fn create_comment(review_id: &Uuid) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("review_id", &review_id.to_string()),
        ("comment", LOREM_IPSUM.clone()),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/post-comment"))
        .form(&params)
        .send()
        .await;
}

pub async fn create_list(name: &str) -> Uuid {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("username", USERNAME.clone()),
        ("name", name),
    ];

    let client = reqwest::Client::new();
    let res = client
        .post(format!("{API_BASE_URL}/create-list"))
        .form(&params)
        .send()
        .await
        .unwrap()
        .json::<List>()
        .await
        .unwrap();

    res.id
}

pub async fn create_list_item(list_id: &Uuid, movie_id: &str) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("list_id", &list_id.to_string()),
        ("movie_id", movie_id),
        ("movie_title", movie_id),
        ("poster_path", movie_id),
        ("watchlist", "false"),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/create-list-item"))
        .form(&params)
        .send()
        .await;
}

pub async fn create_watchlist_item(movie_id: &str) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("movie_id", movie_id),
        ("movie_title", movie_id),
        ("poster_path", movie_id),
        ("watchlist", "true"),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/create-list-item"))
        .form(&params)
        .send()
        .await;
}

#[tokio::main]
async fn main() {
    // GENERATE TESTING DATA
    // ****************************************************************

    // the first review created that will have comments added to it
    let mut review_id = Uuid::new_v4();

    // the first list created that will have list_items added to it
    let mut list_id = Uuid::new_v4();

    // review_id and list_id will be stored in a file to be read by query_data.rs
    let mut ids = File::create(format!("{IDS_PATH}")).unwrap();

    // the movie with MOVIE_ID will have 100 reviews.
    // the first review for this movie with review_id will have 100 comments.

    // MAKE REVIEWS
    for i in 0..100 {
        let res = create_review(MOVIE_ID, (i % 10) as i32, true).await;

        if i == 0 {
            review_id = res;
            let _ = write!(ids, "review_id={}\n", review_id);
        }
    }

    // MAKE COMMENTS
    for _ in 0..100 {
        create_comment(&review_id).await;
    }

    // there will be 100 lists for the user.
    // the user's watchlist and the first list generated in the loop below
    // will have 100 list_items added to them.

    // MAKE LISTS
    // make 99 lists in addition to users watchlist

    for i in 0..99 {
        let res = create_list(&i.to_string()).await;

        if i == 0 {
            list_id = res;
            let _ = write!(ids, "list_id={}\n", list_id);
        }
    }

    // MAKE LIST ITEMS
    for i in 0..100 {
        create_list_item(&list_id, &i.to_string()).await;
    }

    for i in 0..100 {
        create_watchlist_item(&i.to_string()).await;
    }
}
