// use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};

use dotenvy::dotenv;
use std::env;

pub type PgPool = Pool<ConnectionManager<PgConnection>>;

pub fn establish_connection() -> PgPool {
  dotenv().ok();

  let database_url = env::var("DATABASE_URL").unwrap();

  let manager = ConnectionManager::<PgConnection>::new(database_url);
  Pool::builder()
    .test_on_check_out(true)
    .build(manager)
    .expect("Could not build connection pool")
}