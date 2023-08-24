pub mod requests;
use crate::requests::{test, post_review};

#[tokio::main]
async fn main() {
    println!("benchmarking movieshlok cache");

    // each paginated end will recieve a limit of 50
    let limit = 50;

    let new_review_id = post_review("hi", 23, true).await;
    println!("new_review_id: {}", new_review_id);

    // endpoints to test:
    // - get-reviews
    // - get-rating-like
    // - get-ratings

    // to generate data, send requests to the post-review endpoint.
    // post 100 reviews for 100 different movies.

    // There will be a total of 10,000 reviews
    // there will be 2 pages of reviews for each movie.
    // There will be 200 pages of ratings for the user.
    // record the review_id for each review in a vec.
    // record the review_id of the first review of each movie in a seperate vec.

    // for each of the 100 movies, send 5 requests for each of the 2 pages of reviews.
    // 100 x 5 x 2 = 1,000 total requests.

    // for each of the 100 movies, send 10 requests for the rating-like for the user.
    // 100 x 10 = 1,000 total requests.

    // for each of the 200 pages of ratings, send 5 reqeusts.
    // 200 x 5 = 1,000 total requests.


    // - get-review

    // to generate data, send requests to the post-comment endpoint.
    // post 100 comments for the first review of each of the 100 movies.

    // There will be a total of 100 reviews with comments.
    // send 10 requests to get the review details of the first review for each of the 100 movies.


    // - get-lists
    // - get-list-items
    // - get-watchlist

    // create 100 lists for the user.
    // record the list_id for each lists created in a vec.
    // add all 100 movies to every lists.

    // send 1,000 requests to get all lists for the users.
    // send 10 requests to get list_items for each of the 100 lists.
    // 100 x 10 = 1,000 total requests.
}