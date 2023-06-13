use warp::ws::Message;
use tokio::sync::{mpsc, RwLock};

use std::sync::Arc;
use std::collections::HashMap;

// struct containing relevant data for a websocket(ws) client
#[derive(Debug, Clone)]
pub struct Client {
    pub user_id: usize,
    pub topics: String,
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
}

// type of data structure that will be used for lists of clients
pub type ClientList = Arc<RwLock<HashMap<String, Client>>>;

// function is called in main to create the initial lists that will
// be used to track ws clients for each page that uses ws's
pub fn make_client_list() -> ClientList {
  // hashmap to hold a group of websocket clients
  return Arc::new(RwLock::new(HashMap::new()));
}