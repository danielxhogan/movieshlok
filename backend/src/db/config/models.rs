use crate::db::config::schema;

use diesel::prelude::*;

use uuid::Uuid;

#[derive(Queryable)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = schema::users)]
pub struct NewUser<'a> {
    pub id: Option<Uuid>,
    pub username: &'a str,
    pub email: &'a str,
    pub password: &'a str,
}