use crate::db::config::models::{
    DeleteListItemRequest, DeleteListRequest, GetListItemsRequest,
    GetListItemsResponse, GetListsRequest, InsertingNewList,
    InsertingNewListItem, List, ListItem, UserList,
};
use crate::db::config::schema::{list_items, lists, users};
use crate::db::PooledPg;
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::prelude::*;
use uuid::Uuid;

pub struct ListsDbManager {
    connection: PooledPg,
}

impl ListsDbManager {
    pub fn new(connection: PooledPg) -> ListsDbManager {
        ListsDbManager { connection }
    }

    // QUERIES FOR SELECTING LIST AND LIST_ITEM DATA
    // *************************************************************************************

    // GET ALL LISTS FOR A USER
    // *************************
    pub fn get_lists(
        &mut self,
        lists_request: GetListsRequest,
    ) -> Result<Box<Vec<List>>, AppError> {
        let users_lists = lists::table
            .inner_join(users::table.on(lists::user_id.eq(users::id)))
            .select((
                lists::id,
                lists::user_id,
                lists::name,
                lists::watchlist,
                lists::created_at,
            ))
            .filter(users::username.eq(lists_request.username))
            .order(lists::created_at.desc())
            .load::<List>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while gettings lists for a users",
                )
            });

        Ok(Box::new(users_lists.unwrap()))
    }

    // GET ALL LIST ITEMS FOR A LIST
    // ******************************
    pub fn get_list_items(
        &mut self,
        list_items_request: GetListItemsRequest,
    ) -> Result<GetListItemsResponse, AppError> {
        let count = list_items::table
            .filter(list_items::list_id.eq(&list_items_request.list_id))
            .count()
            .get_result::<i64>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while getting count of list_items",
                )
            });

        match count {
            Err(err) => return Err(err),
            Ok(_) => (),
        };

        let count = count.unwrap();

        let results = list_items::table
            .filter(list_items::list_id.eq(list_items_request.list_id))
            .offset(list_items_request.offset)
            .limit(list_items_request.limit)
            .order(list_items::created_at.desc())
            .load::<ListItem>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while gettings list_items for a list",
                )
            });

        match results {
            Err(err) => return Err(err),

            Ok(results) => {
                let response = GetListItemsResponse {
                    total_results: count,
                    list_items: Box::new(results),
                };

                Ok(response)
            }
        }
    }

    // GET WATCHLIST ID FOR A USER
    // ******************************
    pub fn get_watchlist_id(
        &mut self,
        username: String,
    ) -> Result<Uuid, AppError> {
        let watchlist = lists::table
            .inner_join(users::table.on(lists::user_id.eq(users::id)))
            .select(lists::id)
            .filter(lists::watchlist.eq(true))
            .filter(users::username.eq(username))
            .load::<Uuid>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while getting user's watchlist")
            });

        let watchlist = watchlist.unwrap();

        if watchlist.len() != 1 {
            return Err(AppError::new(
                "can't find watchlist",
                ErrorType::WatchlistNotFound,
            ));
        } else {
            return Ok(watchlist[0]);
        }
    }

    // QUERIES FOR CREATING LIST AND LIST_ITEM DATA
    // *************************************************************************************

    // CREATE NEW LIST FOR A USER
    // ***************************
    pub fn create_list(
        &mut self,
        new_list: InsertingNewList,
    ) -> Result<List, AppError> {
        diesel::insert_into(lists::table)
            .values(&new_list)
            .get_result(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while inserting new list")
            })
    }

    // ADD A MOVIE TO A LIST
    // ***************************
    pub fn create_list_item(
        &mut self,
        list_item: InsertingNewListItem,
    ) -> Result<ListItem, AppError> {
        let existing_list_item = list_items::table
            .filter(list_items::list_id.eq(&list_item.list_id))
            .filter(list_items::movie_id.eq(&list_item.movie_id))
            .load::<ListItem>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while checking existing list item",
                )
            });

        if existing_list_item.unwrap().len() > 0 {
            return Err(AppError::new(
                "item already exists in list",
                ErrorType::DuplicateListItem,
            ));
        }

        diesel::insert_into(list_items::table)
            .values(&list_item)
            .get_result(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while inserting new list item")
            })
    }

    pub fn check_list_ownership(
        &mut self,
        user_list: UserList,
    ) -> Result<String, AppError> {
        let owner_check = lists::table
            .filter(lists::user_id.eq(user_list.user_id))
            .filter(lists::id.eq(user_list.list_id))
            .load::<List>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while checking user list match")
            });

        if owner_check.unwrap().len() != 1 {
            return Err(AppError::new(
                "user doesn't own this list",
                ErrorType::InvalidListOwnership,
            ));
        } else {
            return Ok("ok".to_string());
        }
    }

    pub fn get_watchlist_by_user_id(
        &mut self,
        user_id: &Uuid,
    ) -> Result<Uuid, AppError> {
        let watchlist = lists::table
            .inner_join(users::table.on(lists::user_id.eq(users::id)))
            .select(lists::id)
            .filter(lists::watchlist.eq(true))
            .filter(users::id.eq(user_id))
            .load::<Uuid>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while getting user's watchlist")
            });

        let watchlist = watchlist.unwrap();

        if watchlist.len() != 1 {
            return Err(AppError::new(
                "can't find watchlist",
                ErrorType::WatchlistNotFound,
            ));
        } else {
            return Ok(watchlist[0]);
        }
    }

    // DELETE LIST
    // ************
    pub fn delete_list(
        &mut self,
        delete_request: DeleteListRequest,
    ) -> Result<List, AppError> {
        // check that list belongs to user
        let verify = lists::table
            .filter(lists::user_id.eq(delete_request.user_id))
            .filter(lists::id.eq(delete_request.list_id))
            .count()
            .get_result::<i64>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while checking review ownership",
                )
            });

        if verify.unwrap() != 1 {
            return Err(AppError::new(
                "user doesn't own item",
                ErrorType::UserDoesntOwnItem,
            ));
        }

        // delete all list items for the list
        let _ = diesel::delete(list_items::table)
            .filter(list_items::list_id.eq(delete_request.list_id))
            .execute(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while deleting list items for a list",
                )
            });

        diesel::delete(lists::table)
            .filter(lists::id.eq(delete_request.list_id))
            .get_result(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while deleting list")
            })
    }

    // DELETE LIST ITEM
    // *****************
    pub fn delete_list_item(
        &mut self,
        delete_request: DeleteListItemRequest,
    ) -> Result<ListItem, AppError> {
        let verify = list_items::table
            .inner_join(lists::table.on(list_items::list_id.eq(lists::id)))
            .filter(lists::user_id.eq(delete_request.user_id))
            .filter(list_items::id.eq(delete_request.list_item_id))
            .count()
            .get_result::<i64>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while checking list item ownership",
                )
            });

        if verify.unwrap() != 1 {
            return Err(AppError::new(
                "user doesn't own item",
                ErrorType::UserDoesntOwnItem,
            ));
        }

        diesel::delete(list_items::table)
            .filter(list_items::id.eq(delete_request.list_item_id))
            .get_result(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while deleting comment")
            })
    }
}
