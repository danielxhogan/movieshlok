pub mod create_data;

#[tokio::main]
async fn main() {
    println!("benchmarking movieshlok cache");
    
    // GENERATE TESTING DATA
    // ****************************************************************
    // the movie with movie_id will have 100 reviews.
    // the first review for this movie with review_id will have 100 comments.
    // the user will have 101 ratings for movies with ids 1-100, and movie_id.

    // use crate::create_data::{create_review, create_comment};
    // let movie_id = "577922";
    // let review_id = "3316eb10-c7d5-46b6-803b-88355e01c3b6";

    // MAKE REVIEWS
    // for i in 0..100 {
    //     create_review(movie_id, (i % 10) as i32, true).await;
    //     create_review(&(i + 1).to_string(), (i % 10) as i32, true).await;
    // }

    // MAKE COMMENTS
    // for _ in 0..100 {
    //     create_comment(review_id).await;
    // }

    // QUERY TEST DATA
    // ****************************************************************
    // Limit will be 50.
    // When getting all reveiws for movie with movie_id, there will be 2 pages of reviews.
    // the user will have 101 ratings for movies with ids 1-100, and movie_id.
    // the first 2 pages will be queried.

    let limit = 50;

    // endpoints to test:
    // - get-reviews
    // - get-rating-like
    // - get-ratings


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