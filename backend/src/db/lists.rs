use crate::db::PooledPg;
use crate::db::config::schema::{lists, list_items, users};
use crate::db::config::models::{List,
  GetListsRequest,
  InsertingNewList,
  UserList,
  InsertingNewListItem,
  ListItem
};
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::prelude::*;
use uuid::Uuid;

pub struct ListsDbManager {
  connection:  PooledPg,
}

impl ListsDbManager {
  pub fn new(connection: PooledPg) -> ListsDbManager {
    ListsDbManager {connection}
  }

// QUERIES FOR SELECTING LIST AND LIST_ITEM DATA
// *************************************************************************************

// GET ALL LISTS FOR A USER
// *************************
pub fn get_lists(&mut self, lists_request: GetListsRequest)
-> Result<Box<Vec<List>>, AppError>
{
  let users_lists = lists::table
    .inner_join(users::table.on(
      lists::user_id.eq(users::id)
    ))
    .select((lists::id,
      lists::user_id,
      lists::name,
      lists::watchlist,
      lists::created_at))
    .filter(users::username.eq(lists_request.username))
    .load::<List>(&mut self.connection)
    .map_err(|err| {
      AppError::from_diesel_err(err, "while gettings lists for a users")
    });

  Ok(Box::new(users_lists.unwrap()))
}

// QUERIES FOR CREATING LIST AND LIST_ITEM DATA
// *************************************************************************************

  // CREATE NEW LIST FOR A USER
  // ***************************
  pub fn create_list(&mut self, new_list: InsertingNewList)
  -> Result<List, AppError>
  {
    diesel::insert_into(lists::table)
      .values(&new_list)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new list")
      })
  }

  // ADD A MOVIE TO A LIST
  // ***************************
  pub fn create_list_item(&mut self, list_item: InsertingNewListItem)
  -> Result<ListItem, AppError>
  {
    let existing_list_item = list_items::table
      .filter(list_items::list_id.eq(&list_item.list_id))
      .filter(list_items::movie_id.eq(&list_item.movie_id))
      .load::<ListItem>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking existing list item")
      });
    
    if existing_list_item.unwrap().len() > 0 {
      return Err(AppError::new("item already exists in list", ErrorType::DuplicateListItem));
    }

    diesel::insert_into(list_items::table)
      .values(&list_item)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new list item")
      })
  }

  pub fn check_list_ownership(&mut self, user_list: UserList)
  -> Result<String, AppError>
  {
    let owner_check = lists::table
      .filter(lists::user_id.eq(user_list.user_id))
      .filter(lists::id.eq(user_list.list_id))
      .load::<List>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking user list match")
      });
    
    if owner_check.unwrap().len() != 1 {
      return Err(AppError::new("user doesn't own this list", ErrorType::InvalidListOwnership));
    } else {
      return Ok("ok".to_string())
    }
  }

  pub fn get_watchlst(&mut self, user_id: &Uuid)
  -> Result<Uuid, AppError>
  {
    let watchlist = lists::table
      .inner_join(users::table.on(
        lists::user_id.eq(users::id)
      ))
      .select(lists::id)
      .filter(lists::watchlist.eq(true))
      .filter(users::id.eq(user_id))
      .load::<Uuid>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while getting user's watchlist")
      });
    
    let watchlist = watchlist.unwrap();

    if watchlist.len() != 1 {
      return Err(AppError::new("can't find watchlist", ErrorType::WatchlistNotFound));
    } else {
      return Ok(watchlist[0]);
    }
  }
}
