const API_BASE_URL: &str = "http://localhost:3030";
const JWT_TOKEN: &str = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiM2ZmMjU5NTEtODAwNS00MWFhLThjMWMtNDk1Y2JhYzQ4NzA4IiwiZXhwIjoxNjkzMDAzOTk3fQ.gS3kYG8D4gDENt0JTqBK_l5UpPDLWzJq029CDdK1EFs";
const USERNAME: &str = "danielxhogan";

pub async fn get_reviews(movie_id: &str, limit: &str, offset: &str) {
    let params = [("movie_id", movie_id), ("limit", limit), ("offset", offset)];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-reviews"))
        .form(&params)
        .send()
        .await;
}

pub async fn get_rating_like(movie_id: &str) {
    let params = [("jwt_token", JWT_TOKEN.clone()), ("movie_id", movie_id)];

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
    let params = [
        ("username", USERNAME.clone()),
        ("limit", limit),
        ("offset", offset),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-ratings"))
        .form(&params)
        .send()
        .await
        .unwrap();
}

pub async fn get_lists() {
    let params = [("username", USERNAME.clone())];

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
    let params = [
        ("username", USERNAME.clone()),
        ("offset", offset),
        ("limit", limit),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/get-watchlist"))
        .form(&params)
        .send()
        .await
        .unwrap();
}
