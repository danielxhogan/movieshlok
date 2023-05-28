use crate::routes::{with_form_body, respond};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::Filter;
use serde::{Serialize, Deserialize};
use std::env;


#[derive(Deserialize, Debug)]
struct QueryParams {
  query: String,
  page: String,
  endpoint: String
}

#[derive(Serialize, Deserialize, Debug)]
struct KnownFor {
  adult: Option<bool>,
  backdrop_path: Option<String>,
  id: Option<i32>,
  title: Option<String>,
  original_language: Option<String>,
  original_title: Option<String>,
  overview: Option<String>,
  poster_path: Option<String>,
  media_type: Option<String>,
  genre_ides: Option<Box<[i32]>>,
  popularity: Option<f32>,
  release_date: Option<String>,
  video: Option<bool>,
  vote_average: Option<f32>,
  vote_count: Option<i32>
}


#[derive(Serialize, Deserialize, Debug)]
struct SearchResult {
  adult: Option<bool>,
  backdrop_path: Option<String>,
  genre_ids: Option<Box<[i32]>>,
  id: Option<i32>,
  original_language: Option<String>,
  original_title: Option<String>,
  overview: Option<String>,
  popularity: Option<f32>,
  poster_path: Option<String>,
  release_date: Option<String>,
  title: Option<String>,
  video: Option<bool>,
  vote_average: Option<f32>,
  vote_count: Option<i32>,

  gender: Option<i32>,
  known_for_department: Option<String>,
  name: Option<String>,
  original_name: Option<String>,
  profile_path: Option<String>,
  known_for: Option<Box<[KnownFor]>>,

  media_type: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct SearchResults {
  page: Option<i32>,
  results: Option<Box<[SearchResult]>>,
  total_pages: Option<i32>,
  total_results: Option<i32>
}



pub fn tmdb_filters() -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
  search_filter()
}

pub fn search_filter() -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {

  warp::path!("tmdb" / "search")
    .and(warp::post())
    .and(with_form_body::<QueryParams>())
    .and_then(search)
}

async fn search(query_params: QueryParams) -> Result<impl warp::Reply, warp::Rejection> {
  let tmdb_base_url = env::var("TMDB_BASE_URL").unwrap();
  let tmdb_api_key = env::var("TMDB_API_KEY").unwrap();

  let search_url = format!("{}/search/{}?api_key={}&query={}&page={}",
    &tmdb_base_url,
    &query_params.endpoint,
    &tmdb_api_key,
    &query_params.query,
    &query_params.page);

  let response = reqwest::get(&search_url).await.unwrap()
    .json::<SearchResults>().await
    .map_err(|err| {
      AppError::new(&err.to_string(), ErrorType::FailedToSearch)
    });

  respond(response, warp::http::StatusCode::OK)
}
