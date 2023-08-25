// pub mod create_data;
// pub mod query_data;

#[tokio::main]
async fn main() {
    // println!("benchmarking movieshlok cache");

    // let movie_id = "577922";

    // GENERATE TESTING DATA
    // ****************************************************************
    // the movie with movie_id will have 100 reviews.
    // the first review for this movie with review_id will have 100 comments.
    // the user will have 101 ratings for movies with ids 1-100, and movie_id.

    // use crate::create_data::{
    //     create_review, create_comment, create_list, create_list_item, create_watchlist_item,
    // };

    // MAKE REVIEWS
    // for i in 0..100 {
    //     create_review(movie_id, (i % 10) as i32, true).await;
    //  }

    // id of the first review created from the loop above
    // let review_id = "f673d218-fe1c-450a-bb19-9ce30b5c9981";

    // MAKE COMMENTS
    // for _ in 0..100 {
    //     create_comment(review_id).await;
    // }

    // there will be 100 lists for the user.
    // the user's watchlist and the first list generated in the loop below
    // will have 100 list_items added to them.

    // MAKE LISTS
    // for i in 0..99 {
    //     create_list(&i.to_string()).await;
    // }

    // id of the first list created from the loop above
    // let list_id = "5932f66f-7ab0-432a-9227-4a16e135db73";

    // MAKE LIST ITEMS
    // for i in 0..100 {
    //     create_list_item(list_id, &i.to_string()).await;
    // }

    // for i in 0..100 {
    //     create_watchlist_item(&i.to_string()).await;
    // }

    // QUERY TEST DATA
    // ****************************************************************
    // Limit will be 50.
    // When getting all reveiws for movie with movie_id, there will be 2 pages of reviews.
    // the user will have 101 ratings for movies with ids 1-100, and movie_id.
    // the first 2 pages will be queried.

    // use crate::query_data::{
    //     get_reviews, get_rating_like, get_review, get_ratings, get_lists, get_list_items, get_watchlist_items,
    // };
    // let limit = "100";

    // INITIAL REQUESTS
    // ****************************************************************
    // when testing cache speed, inital requests will query from database and store to cache.
    // all subsequent requests will retrieve from cache.

    // get_reviews(movie_id, limit, "0").await;
    // get_rating_like(movie_id).await;
    // get_review(review_id).await;
    // get_ratings(limit, "0").await;
    // get_lists().await;
    // get_list_items(list_id, "0", limit).await;
    // get_watchlist_items("0", limit).await;

    // TIMED REQUESTS
    // ****************************************************************
    // for _ in 0..100 {
    //     get_reviews(movie_id, limit, "0").await;
    // }

    // for _ in 0..100 {
    //     get_rating_like(movie_id).await;
    // }

    // for _ in 0..100 {
    // get_review(review_id).await;
    // }

    // for _ in 0..100 {
    //     get_ratings(limit, "0").await;
    // }

    // for _ in 0..100 {
    //     get_lists().await;
    // }

    // for _ in 0..100 {
    //     get_list_items(list_id, "0", limit).await;
    // }

    // for _ in 0..100 {
    //     get_watchlist_items("0", limit).await;
    // }
}
