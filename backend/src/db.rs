pub mod auth;
pub mod config;
pub mod lists;
pub mod review;
pub mod reviews;

use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, PooledConnection};
pub type PooledPg = PooledConnection<ConnectionManager<PgConnection>>;
