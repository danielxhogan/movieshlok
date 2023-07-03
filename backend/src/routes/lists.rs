use crate::db::config::db_connect::PgPool;
use crate::db::config::models::{NewList};
use crate::db::lists::ListsDbManager;
use crate::routes::{with_form_body, auth_check, respond};
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, reject};
use serde::Deserialize;
use chrono::Utc;

#[derive(Deserialize)]
struct NewListRequest {
  jwt_token: String,
  name: String
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
}

pub fn create_list_filters(pool: PgPool,)
-> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
{
  warp::path!("create-list")
    .and(warp::post())
    .and(with_lists_db_manager(pool))
    .and(with_form_body::<NewListRequest>())
    .and_then(create_list)
}

async fn create_list(mut lists_db_manager: ListsDbManager, new_list_request: NewListRequest)
-> Result<impl warp::Reply, warp::Rejection>
{
  let payload = auth_check(new_list_request.jwt_token);

  match payload {
    Err(err) => { return respond(Err(err), warp::http::StatusCode::UNAUTHORIZED) },
    Ok(_) => ()
  }

  let payload = payload.unwrap();
  let user_id = payload.claims.user_id;
  let created_at = Utc::now().timestamp();

  let new_list = NewList {
    user_id,
    name: new_list_request.name,
    watchlist: false,
    created_at
  };

  let response = lists_db_manager.create_list(new_list);
  respond(response, warp::http::StatusCode::CREATED)
}