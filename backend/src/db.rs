pub mod config;
pub mod auth;
pub mod lists;
pub mod reviews;
pub mod review;

use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, PooledConnection};
pub type PooledPg = PooledConnection<ConnectionManager<PgConnection>>;