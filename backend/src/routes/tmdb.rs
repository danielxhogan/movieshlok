use crate::routes::{with_form_body, respond};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::Filter;
use serde::{Serialize, Deserialize};
use std::env;


// MOVIE DETAILS
// **************************************************

// REQUEST PARAMS
#[derive(Deserialize)]
struct MovieDetailsParams {
  movie_id: String
}

// RESPONSE DATA
#[derive(Serialize, Deserialize)]
struct Genre {
  id: Option<i32>,
  name: Option<String>
}

#[derive(Serialize, Deserialize)]
struct ProductionCompany {
  id: Option<i32>,
  logo_path: Option<String>,
  name: Option<String>,
  origin_country: Option<String>
}

#[derive(Serialize, Deserialize)]
struct ProductionCountry {
  iso_3166_1: Option<String>,
  name: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Language {
  english_name: Option<String>,
  iso_639_1: Option<String>,
  name: Option<String>
}

// VIDEOS
#[derive(Serialize, Deserialize)]
struct Video {
  iso_639_1: Option<String>,
  iso_3166_1: Option<String>,
  name: Option<String>,
  key: Option<String>,
  site: Option<String>,
  size: Option<i32>,
  r#type: Option<String>,
  official: Option<bool>,
  published_at: Option<String>,
  id: Option<String>
}

#[derive(Serialize, Deserialize)]
struct Videos {
  id: Option<i32>,
  results: Option<Box<[Video]>>
}
// IMAGES
#[derive(Serialize, Deserialize)]
struct Image {
  aspect_ration: Option<f32>,
  height: Option<i32>,
  iso_639_1: Option<String>,
  file_path: Option<String>,
  vote_average: Option<f32>,
  vote_count: Option<i32>,
  width: Option<i32>
}

#[derive(Serialize, Deserialize)]
struct Images {
  id: Option<i32>,
  backdrops: Option<Box<[Image]>>,
  logos: Option<Box<[Image]>>,
  // posters: Option<Box<[Image]>>
}

// CREDITS
#[derive(Serialize, Deserialize)]
struct CastCrewMember {

  // cast & crew
  adult: Option<bool>,
  gender: Option<i32>,
  id: Option<i32>,
  known_for_department: Option<String>,
  name: Option<String>,
  original_name: Option<String>,
  popularity: Option<f32>,
  profile_path: Option<String>,
  credit_id: Option<String>,

  // cast
  cast_id: Option<i32>,
  character: Option<String>,
  order: Option<i32>,

  // crew
  department: Option<String>,
  job: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Credits {
  id: Option<i32>,
  cast: Option<Box<[CastCrewMember]>>,
  crew: Option<Box<[CastCrewMember]>>
}

// MAIN RESPONSE
#[derive(Serialize, Deserialize)]
struct MovieDetails {
  adult: Option<bool>,
  backdrop_path: Option<String>,
  // belongs_to_collection: Option<String>,
  budget: Option<i32>,
  genres: Option<Box<[Genre]>>,
  homepage: Option<String>,
  id: Option<i32>,
  imdb_id: Option<String>,
  original_language: Option<String>,
  original_title: Option<String>,
  overview: Option<String>,
  popularity: Option<f32>,
  poster_path: Option<String>,
  production_companies: Option<Box<[ProductionCompany]>>,
  production_countries: Option<Box<[ProductionCountry]>>,
  release_date: Option<String>,
  revenue: Option<i32>,
  runtime: Option<i32>,
  spoken_languages: Option<Box<[Language]>>,
  status: Option<String>,
  tagline: Option<String>,
  title: Option<String>,
  video: Option<bool>,
  vote_average: Option<f32>,
  vote_count: Option<i32>,
  videos: Option<Videos>,
  images: Option<Images>,
  credits: Option<Credits>
}

// PERSON DETAILS
// **************************************************
// REQUEST PARAMS
#[derive(Deserialize)]
struct PersonDetailsParams {
  person_id: String
}

#[derive(Serialize, Deserialize)]
struct PersonCredits {
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
  credit_id: Option<String>,

  // cast
  character: Option<String>,
  order: Option<i32>,

  // crew
  department: Option<String>,
  job: Option<String>
}

// MAIN RESPONSE
#[derive(Serialize, Deserialize)]
struct PersonDetails {
  cast: Option<Box<[PersonCredits]>>,
  crew: Option<Box<[PersonCredits]>>
}

// SEARCH
// **************************************************

// REQUEST PARAMS
#[derive(Deserialize)]
struct QueryParams {
  query: String,
  page: String,
  endpoint: String
}

// RESPONSE DATA
#[derive(Serialize, Deserialize)]
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
  genre_ids: Option<Box<[i32]>>,
  popularity: Option<f32>,
  release_date: Option<String>,
  video: Option<bool>,
  vote_average: Option<f32>,
  vote_count: Option<i32>
}

#[derive(Serialize, Deserialize)]
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

// MAIN RESPONSE
#[derive(Serialize, Deserialize)]
struct SearchResults {
  page: Option<i32>,
  results: Option<Box<[SearchResult]>>,
  total_pages: Option<i32>,
  total_results: Option<i32>,
}


// ENDPOINTS
// *******************************
pub fn tmdb_filters()
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  search_filters()
  .or(movie_details_filters())
  .or(person_details_filters())
}

pub fn search_filters()
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("tmdb" / "search")
    .and(warp::post())
    .and(with_form_body::<QueryParams>())
    .and_then(search)
}

async fn search(query_params: QueryParams)
-> Result<impl warp::Reply, warp::Rejection>
{
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

pub fn movie_details_filters()
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("tmdb" / "movie")
    .and(warp::post())
    .and(with_form_body::<MovieDetailsParams>())
    .and_then(movie_details)
}

async fn movie_details(movie_details_params: MovieDetailsParams)
-> Result<impl warp::Reply, warp::Rejection>
{
  let tmdb_base_url = env::var("TMDB_BASE_URL").unwrap();
  let tmdb_api_key = env::var("TMDB_API_KEY").unwrap();

  let movie_details_url = format!("{}/movie/{}?api_key={}&language=en-US&append_to_response=videos,images,credits&include_image_language=en,null",
    &tmdb_base_url,
    &movie_details_params.movie_id,
    &tmdb_api_key);

    let response = reqwest::get(&movie_details_url).await.unwrap()
    .json::<MovieDetails>().await
    .map_err(|err| {
      AppError::new(&err.to_string(), ErrorType::FailedToGetMovieDetails)
    });

  respond(response, warp::http::StatusCode::OK)
}

fn person_details_filters()
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("tmdb" / "person")
    .and(warp::post())
    .and(with_form_body::<PersonDetailsParams>())
    .and_then(person_details)
}

async fn person_details(person_details_params: PersonDetailsParams)
-> Result<impl warp::Reply, warp::Rejection>
{
  let tmdb_base_url = env::var("TMDB_BASE_URL").unwrap();
  let tmdb_api_key = env::var("TMDB_API_KEY").unwrap();

  let person_details_url = format!("{}/person/{}/movie_credits?api_key={}",
    &tmdb_base_url,
    &person_details_params.person_id,
    &tmdb_api_key);
  
  let response = reqwest::get(&person_details_url).await.unwrap()
    .json::<PersonDetails>().await
    .map_err(|err| {
      AppError::new(&err.to_string(), ErrorType::FailedToGetPersonDetails)
    });
  
  respond(response, warp::http::StatusCode::OK)
}