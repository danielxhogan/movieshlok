use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{
  GetListsRequest,
  GetListItemsRequest,
  GetWatchlistRequest,
  InsertingNewList,
  UserList,
  InsertingNewListItem
};
use crate::db::lists::ListsDbManager;
use crate::routes::{with_form_body, auth_check, respond};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject};
use serde::Deserialize;
use chrono::Utc;
use uuid::Uuid;

// TYPES
// *******************************

#[derive(Deserialize)]
struct IncomingNewList {
  jwt_token: String,
  name: String
}

#[derive(Deserialize)]
struct IncomingNewListItem {
  jwt_token: String,
  list_id: Option<Uuid>,
  movie_id: String,
  movie_title: String,
  poster_path: String,
  watchlist: bool
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

// ENDPOINTS
// *******************************
pub fn lists_filters(pool: PgPool,)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  get_lists_filters(pool.clone())
    .or(get_list_items_filters(pool.clone()))
    .or(get_watchlist_filters(pool.clone()))
    .or(create_list_filters(pool.clone()))
    .or(create_list_item_filters(pool.clone()))
}

// ENDPOINTS FOR SELECTING LIST AND LIST_ITEM DATA
// *************************************************************************************

// GET ALL LISTS FOR A USER
// *************************
fn get_lists_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-lists")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<GetListsRequest>())
    .and_then(get_lists)
}

async fn get_lists(mut lists_db_manager: ListsDbManager, lists_request: GetListsRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  respond(lists_db_manager.get_lists(lists_request), warp::http::StatusCode::OK)
}

// GET ALL LIST ITEMS FOR A LIST
// ******************************
fn get_list_items_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-list-items")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<GetListItemsRequest>())
    .and_then(get_list_items)
}

async fn get_list_items(mut lists_db_manager: ListsDbManager, list_items_request: GetListItemsRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  let response = lists_db_manager.get_list_items(list_items_request);
  respond(response, warp::http::StatusCode::OK)
}

// GET WATCHLIST FOR A USER
// ******************************
fn get_watchlist_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("get-watchlist")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<GetWatchlistRequest>())
    .and_then(get_watchlist)
}

async fn get_watchlist(mut lists_db_manager: ListsDbManager, watchlist_request: GetWatchlistRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  let watchlist_id = lists_db_manager.get_watchlist_id(watchlist_request.username);

  match watchlist_id {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::NOT_FOUND) },
    Ok(_) => ()
  }

  let watchlist_id = watchlist_id.unwrap();

  let list_items_request = GetListItemsRequest {
    list_id: watchlist_id,
    offset: watchlist_request.offset,
    limit: watchlist_request.limit
  };

  let response = lists_db_manager.get_list_items(list_items_request);
  respond(response, warp::http::StatusCode::OK)
}

// ENDPOINTS FOR CREATING LIST AND LIST_ITEM DATA
// *************************************************************************************

// CREATE NEW LIST FOR A USER
// ***************************
fn create_list_filters(pool: PgPool)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("create-list")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<IncomingNewList>())
    .and_then(create_list)
}

async fn create_list(mut lists_db_manager: ListsDbManager, new_list: IncomingNewList)
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

// ADD A MOVIE TO A LIST
// ***************************
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
  let list_item: InsertingNewListItem;

  if new_list_item.watchlist {
    let watchlist = lists_db_manager.get_watchlist_by_user_id(&user_id);

    match watchlist {
      Ok(watchlist_id) => {
        list_item = InsertingNewListItem {
          list_id: watchlist_id,
          movie_id: new_list_item.movie_id,
          movie_title: new_list_item.movie_title,
          poster_path: new_list_item.poster_path,
          created_at
        };
      },
      Err(err) => { return respond(Err(err), warp::http::StatusCode::NOT_FOUND) },
    }

  } else {
    match new_list_item.list_id {
      Some(list_id) => {
        let user_list = UserList {
          user_id,
          list_id
        };

        let owner_check = lists_db_manager.check_list_ownership(user_list);

        match owner_check {
          Err(err) => return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED),
          Ok(_) => ()
        }

        list_item = InsertingNewListItem {
          list_id,
          movie_id: new_list_item.movie_id,
          movie_title: new_list_item.movie_title,
          poster_path: new_list_item.poster_path,
          created_at
        };
      },

      None => { return respond(
        Err(AppError::new("No list id provided", ErrorType::NoListIdProvided)),
        warp::http::StatusCode::BAD_REQUEST
      )}
    }
  }

  let response = lists_db_manager.create_list_item(list_item);
  respond(response, warp::http::StatusCode::CREATED)
}