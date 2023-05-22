use crate::db::config::schema::users;

use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Queryable, Serialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

#[derive(Debug, Insertable, Deserialize, Clone)]
#[diesel(table_name = users)]
pub struct NewUser {
    // pub id: Option<Uuid>,
    pub username: String,
    pub email: String,
    pub password: String,
}

// #[derive(Insertable, Deserialize)]
// #[diesel(table_name = schema::users)]
// pub struct NewUserRequest<'a> {
//     pub username: &'a str,
//     pub email: &'a str,
//     pub password: &'a str,
// }