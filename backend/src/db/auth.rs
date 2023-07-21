use crate::db::config::models::{
    InsertingNewList, List, LoginCreds, NewUser, User,
};
use crate::db::config::schema::{lists, users};
use crate::db::PooledPg;
use crate::utils::error_handling::{AppError, ErrorType};

use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

extern crate bcrypt;
use bcrypt::{hash, verify, DEFAULT_COST};

pub struct AuthDbManager {
    connection: PooledPg,
}

impl AuthDbManager {
    pub fn new(connection: PooledPg) -> AuthDbManager {
        AuthDbManager { connection }
    }

    pub fn register_user(
        &mut self,
        new_user: NewUser,
    ) -> Result<User, AppError> {
        // check if username already exists
        let existing_username = users::table
            .filter(users::username.eq(&new_user.username))
            .load::<User>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while checking existing username in register",
                )
            });

        // query should return 0 results;
        if existing_username.unwrap().len() > 0 {
            return Err(AppError::new(
                "username already exists",
                ErrorType::UsernameAlreadyExists,
            ));
        }

        // check if email already exists
        let existing_email = users::table
            .filter(users::email.eq(&new_user.email))
            .load::<User>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while checking existing email in register",
                )
            });

        // query should return 0 results;
        if existing_email.unwrap().len() > 0 {
            return Err(AppError::new(
                "email already exists",
                ErrorType::EmailAlreadyExists,
            ));
        }

        let hashed_password = hash(new_user.password, DEFAULT_COST).unwrap();

        let inserting_user = NewUser {
            username: new_user.username,
            email: new_user.email,
            password: hashed_password,
        };

        let new_user = diesel::insert_into(users::table)
            .values(&inserting_user)
            .get_result(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while inserting new user")
            });

        let new_user: User = new_user.unwrap();
        let created_at = Utc::now().timestamp();

        let new_list = InsertingNewList {
            user_id: new_user.id.clone(),
            name: new_user.username.clone(),
            watchlist: true,
            created_at,
        };

        let _ = diesel::insert_into(lists::table)
            .values(&new_list)
            .get_result::<List>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(err, "while inserting new watchlist")
            });

        Ok(new_user)
    }

    pub fn login_user(
        &mut self,
        login_creds: &LoginCreds,
    ) -> Result<Uuid, AppError> {
        // check if username exists
        let users_result = users::table
            .filter(users::username.eq(&login_creds.username))
            .load::<User>(&mut self.connection)
            .map_err(|err| {
                AppError::from_diesel_err(
                    err,
                    "while checking existing username in register",
                )
            });

        let users = users_result.unwrap();

        // query should return 1 result;
        if users.len() != 1 {
            return Err(AppError::new(
                "can't find user",
                ErrorType::InvalidUsername,
            ));
        }

        let valid = verify(&login_creds.password, &users[0].password);

        if !valid.unwrap() {
            return Err(AppError::new(
                "can't find user",
                ErrorType::InvalidPassword,
            ));
        }

        let user_id = users[0].id;
        Ok(user_id)
    }
}
