use crate::db::config::schema::users;
use crate::db::config::models::{User, NewUser};
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, PooledConnection};

extern crate bcrypt;
// use bcrypt::{DEFAULT_COST, hash, verify};
use bcrypt::{DEFAULT_COST, hash};

use serde::{Serialize, Deserialize};
// use jsonwebtoken::{encode, Header, EncodingKey};


#[derive(Debug, Serialize, Deserialize)]
struct JwtPayload<'a> {
  username: &'a str,
}

type PooledPg = PooledConnection<ConnectionManager<PgConnection>>;

pub struct AuthDbOperator {
  connection:  PooledPg,
}

impl AuthDbOperator {
  pub fn new(connection: PooledPg) -> AuthDbOperator {
    AuthDbOperator {connection}
  }

  pub fn register_user(&mut self, new_user: NewUser) -> Result<User, AppError> {

    // check if user already exists
    let existing_users = users::table
      .filter(users::username.eq(&new_user.username))
      .load::<User>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking existing users in register")
      });

      // query should return 0 results;
      if existing_users.unwrap().len() == 1 {
        return Err(AppError::new("user already exists", ErrorType::UserAlreadyExists));
      }

      // the hash function returns String but NewUser model wants &str
      let hashed_password = hash(new_user.password, DEFAULT_COST).unwrap();
      let inserting_user = NewUser { username: new_user.username, email: new_user.email, password: hashed_password };

    diesel::insert_into(users::table)
      .values(&inserting_user)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new user")
      })
  }
}