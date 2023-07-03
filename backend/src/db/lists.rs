use crate::db::PooledPg;
use crate::db::config::schema::lists;
use crate::db::config::models::{List, NewList};
use crate::utils::error_handling::AppError;

use diesel::prelude::*;

pub struct ListsDbManager {
  connection:  PooledPg,
}

impl ListsDbManager {
  pub fn new(connection: PooledPg) -> ListsDbManager {
    ListsDbManager {connection}
  }

  pub fn create_list(&mut self, new_list: NewList)
  -> Result<List, AppError>
  {
    diesel::insert_into(lists::table)
      .values(&new_list)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new list")
      })
  }
}
