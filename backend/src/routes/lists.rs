use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{InsertingNewList, UserList, InsertingNewListItem};
use crate::db::lists::ListsDbManager;
use crate::routes::{with_form_body, auth_check, respond};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject};
use serde::Deserialize;
use chrono::Utc;
use uuid::Uuid;

#[derive(Deserialize)]
struct IncomingNewRequest {
  jwt_token: String,
  name: String
}

#[derive(Deserialize)]
struct IncomingNewListItem {
  jwt_token: String,
  list_id: Uuid,
  movie_id: String,
  movie_title: String,
  poster_path: String
}

fn with_lists_db_manager(pool: PgPool)
-> impl Filter<Extract = (ListsDbManager,), Error = warp::Rejection> + Clone
{
  warp::any()
    .map(move || pool.clone())
    .and_then(|pool: PgPool| async move { match pool.get() {
      Ok(conn) => Ok(ListsDbManager::new(conn)),
      Err(err) => Err(reject::custom(
        AppError::new(format!("Error getting connection from pool: {}", err.to_string()).as_str(), ErrorType::Internal))
      ),
    }})
}

pub fn lists_filters(pool: PgPool,)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  create_list_filters(pool.clone())
    .or(create_list_item_filters(pool.clone()))
}

fn create_list_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("create-list")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<IncomingNewRequest>())
    .and_then(create_list)
}

async fn create_list(mut lists_db_manager: ListsDbManager, new_list: IncomingNewRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_list.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;
  let created_at = Utc::now().timestamp();

  let new_list = InsertingNewList {
    user_id,
    name: new_list.name,
    watchlist: false,
    created_at
  };

  let response = lists_db_manager.create_list(new_list);
  respond(response, warp::http::StatusCode::CREATED)
}

fn create_list_item_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("create-list-item")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<IncomingNewListItem>())
    .and_then(create_list_item)
}

async fn create_list_item(mut lists_db_manager: ListsDbManager, new_list_item: IncomingNewListItem)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_list_item.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;
  let created_at = Utc::now().timestamp();

  let user_list = UserList {
    user_id,
    list_id: new_list_item.list_id.clone()
  };

  let owner_check = lists_db_manager.check_list_ownership(user_list);

  match owner_check {
    Err(err) => return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED),
    Ok(_) => ()
  }

  let list_item = InsertingNewListItem {
    list_id: new_list_item.list_id,
    movie_id: new_list_item.movie_id,
    movie_title: new_list_item.movie_title,
    poster_path: new_list_item.poster_path,
    created_at
  };

  let response = lists_db_manager.create_list_item(list_item);
  respond(response, warp::http::StatusCode::CREATED)
}

  // pub list_id: Uuid,
  // pub movie_id: String,
  // pub poster_path: String,
  // pub created_at: i64

  // jwt_token: String,
  // list_id: Uuid,
  // movie_id: String,
  // poster_path: String,
  // created_at: i64