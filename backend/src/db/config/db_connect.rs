// use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};

use dotenvy::dotenv;
use std::env;

pub type PgPool = Pool<ConnectionManager<PgConnection>>;

pub fn establish_connection() -> PgPool {
  dotenv().ok();

  let postgres_user = env::var("POSTGRES_USER").unwrap();
  let postgres_password = env::var("POSTGRES_PASSWORD").unwrap();
  let postgres_host = env::var("POSTGRES_HOST").unwrap();
  let postgres_port = env::var("POSTGRES_PORT").unwrap();
  let postgres_db = env::var("POSTGRES_DB").unwrap();

  let database_url = format!("postgres://{}:{}@{}:{}/{}",
    postgres_user, postgres_password, postgres_host, postgres_port, postgres_db);

  let manager = ConnectionManager::<PgConnection>::new(database_url);
  // Pool::new(manager).expect("Postgres connection pool could not be created")
  Pool::builder()
    .test_on_check_out(true)
    .build(manager)
    .expect("Could not build connection pool")
}