use crate::db::config::schema::users;
use crate::db::config::models::{User, NewUser};
use crate::utils::error_handling::{AppError, ErrorType};

use diesel::pg::PgConnection;
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
  connection: PooledPg,
}

impl AuthDbOperator {
  pub fn new(connection: PooledPg) -> AuthDbOperator {
    AuthDbOperator {connection}
  }

  pub fn register_user(&self, user: NewUser) -> Result<User, AppError> {
    // check if user already exists
    let existing_users = users::table
      .filter(users::username.eq(user.username))
      .load::<User>(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while checking existing users in register")
      });

      // query should return 0 results;
      if existing_users.unwrap().len() == 1 {
        return Err(AppError::new("user already exists", ErrorType::UserAlreadyExists));
      }

      // the hash function returns String but NewUser model wants &str
      let hashed_password = hash(user.password, DEFAULT_COST).unwrap();
      let new_user = NewUser { username: user.username, email: user.email, password: hashed_password };

    diesel::insert_into(users::table)
      .values(&user)
      .get_result(&mut self.connection)
      .map_err(|err| {
        AppError::from_diesel_err(err, "while inserting new user")
      })
  }
}


// pub async fn register_user<'a>(conn: PgConnection, user: models::NewUserRequest<'a>) -> Result<usize, &'a str> {
//   // let mut conn = conn_arc.lock().await;

//   // check if user already exists
//   let existing_users = users::table
//     .filter(users::username.eq(user.username))
//     .load::<models::User>(&mut conn)
//     .expect("error checking existing user");


//   // query should return 0 results;
//   if existing_users.len() == 1 {
//     return Err("User already exists");
//   } else if existing_users.len() > 1 {
//     return Err("multiple users found");
//   }

//   // the hash function returns String but NewUser model wants &str
//   let hashed_password: &str = &hash(user.password, DEFAULT_COST).unwrap()[..];
//   let new_user = models::NewUser { id: None, username: user.username, email: user.email, password: hashed_password };

//   match diesel::insert_into(users::table)
//     .values(&new_user)
//     .execute(&mut conn) {
//     Ok(size) => return Ok(size),
//     Err(_) => return Err("error creating user")
//     }
// }


// pub async fn login_user<'a>(conn_arc: ArcPgConnection, username: &'a str, password: &str) -> Result<String, &'a str> {
//   let &mut conn = conn_arc.lock().await;
//   let jwt_secret = env::var("JWT_SECRET").unwrap();

//   let users = users::table
//     .filter(users::username.eq(username))
//     .load::<models::User>(conn)
//     .expect("error checking existing user");

//   if users.len() == 0 {
//     return Err("invalid username or password");
//   } else if users.len() > 1 {
//     return Err("multiple users found");
//   }

//   let user = &users[0];
//   let valid_password = verify(&password, &user.password).unwrap();

//   if !valid_password {
//     return Err("invalid username or password");
//   }

//   let jwt_payload = JwtPayload { username };
//   let jwt_token = encode(&Header::default(), &jwt_payload, &EncodingKey::from_secret(jwt_secret.as_ref())).unwrap();
//   Ok(jwt_token)
// }




// pub fn get_user<'a>(conn: &mut PgConnection, username: &'a str) -> Result<Vec<models::User>, &'a str> {
//   let user = users::table
//     .filter(users::username.eq(username))
//     // .limit(1)
//     .load::<models::User>(conn)
//     .expect("Error getting user");

//   if user.len() == 0 {
//     return Err("No user found");

//   } else if user.len() > 1 {
//     return Err("multiple users found");

//   } else {
//     return Ok(user);
//   }
// }