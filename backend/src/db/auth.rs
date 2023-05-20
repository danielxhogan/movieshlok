use crate::db::config::schema::users;
use crate::db::config::models;

use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn register_user(conn: &mut PgConnection, username:  &str, email:  &str, password:  &str) -> models::User {
  let new_user = models::NewUser { id: None, username, email, password };

  diesel::insert_into(users::table)
      .values(&new_user)
      .get_result(conn)
      .expect("Error registering new user")
}

pub fn get_user(conn: &mut PgConnection, username: &str) -> Vec<models::User> {
  users::table
      .filter(users::username.eq(username))
      .limit(1)
      .load::<models::User>(conn)
      .expect("Error getting user")
}