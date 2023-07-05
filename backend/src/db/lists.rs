use crate::db::PooledPg;
use crate::db::config::schema::{lists, list_items};
use crate::db::config::models::{List,
  InsertingNewList,
  UserList,
  InsertingNewListItem,
  ListItem
};
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::prelude::*;

pub struct ListsDbManager {
  connection:  PooledPg,
}

impl ListsDbManager {
  pub fn new(connection: PooledPg) -> ListsDbManager {
    ListsDbManager {connection}
  }

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
      return Err(AppError::new("item alreay exists in list", ErrorType::DuplicateListItem));
    }

    diesel::insert_into(list_items::table)
      .values(&list_item)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new list item")
      })
  }
}
