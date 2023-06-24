use crate::routes::auth_check;
use crate::utils::error_handling::{AppError, ErrorType};

use warp::{Filter, ws::{Message, WebSocket}};
use futures::{FutureExt, StreamExt};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use std::sync::Arc;
use std::collections::HashMap;
use std::convert::Infallible;
use std::env;

// struct containing relevant data for a websocket(ws) client
#[derive(Debug, Clone)]
pub struct Client {
    pub user_id: Option<Uuid>,
    pub topic: String,
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
}

// sent from client when they want to register a new client for ws connection
#[derive(Deserialize, Debug)]
pub struct WsRegisterRequest {
  jwt_token: Option<String>,
  topic: String,
  uuid: Option<String>
}

// sent to client when successfully registed as ws client
#[derive(Serialize, Debug)]
pub struct WsRegisterResponse {
    ws_url: String,
    uuid: String
}

// sent from client when they want to unregister a ws client and close connection
#[derive(Deserialize, Debug)]
pub struct WsUnregisterRequest {
  pub uuid: String
}

#[derive(Serialize, Debug)]
pub struct WsOkResponse {
  message: String
}

pub fn saul_good_man() -> Result<WsOkResponse, AppError> {
  Ok(WsOkResponse { message: "ok".to_string() })
}

// sent from clent after registering to make the ws connection
#[derive(Deserialize, Debug)]
pub struct WsConnectionRequest {
  uuid: String
}

// type of data structure that will be used for lists of clients
pub type ClientList = Arc<RwLock<HashMap<String, Client>>>;

// function is called in main to create the initial lists that will
// be used to track ws clients for each page that uses ws's
pub fn make_client_list() -> ClientList {
  // hashmap to hold a group of websocket clients
  return Arc::new(RwLock::new(HashMap::new()));
}

// filter for adding a reference to the client hashmap to a handler function for a ws enpoint
pub fn with_clients(client_list: ClientList)
-> impl Filter<Extract = (ClientList,), Error = Infallible> + Clone
{
  warp::any().map(move || client_list.clone())
}

// before a client establishes a websocket connection, a request is made to a register endpoint
// to indicate to the server that the client intends to connect. This is a
// normal post request the client sends a request to with the user's user_id
// if the user is logged in, and the topic they want to subscribe to. This
// function creates a new entry for them in the list of clients. The sender
// property is initially None, but once they make the websocket connection
// the sender property is bound to sender part of the websocket channel
// established with this client.

pub async fn register_ws_client(req: WsRegisterRequest, client_list: ClientList, ws_endpoint: &str)
-> Result<WsRegisterResponse, AppError>
{
  match req.uuid {
    Some(uuid) => {
      let client = client_list.read().await.get(&uuid).cloned();
      match client {
        Some(_) => {
          return Err(AppError::new("websocket client already registed", ErrorType::WSClientAlreadyRegisted))
        },
        None => {}
      }
    },
    None => {}
  }

  let mut user_id: Option<Uuid> = None;

  // authentication is not required to register, it is only required to emit
  // messages of new reviews because a user must be logged in to leave a review.
  // However, they can still connect to websocket to recieve new posts in real
  // time if other users leave reviews. In the case the user provides a jwt
  // token but it's determined to be invalid, an error response is sent to the
  // client and the function returns immediately so this issue can be dealt with.

  match req.jwt_token {
    Some(token) => {
      let payload = auth_check(token);

      match payload {
        Err(err) => { return Err(err) },
        Ok(payload) => { user_id = Some(payload.claims.user_id); }
          
      }
    }
    None => {}
  };

  let uuid = Uuid::new_v4().as_simple().to_string();

  // add new client to client_list
  client_list.write().await.insert(
    uuid.clone(),
    Client { user_id, topic: req.topic, sender: None }
  );

  // generate url client will to use to make websocket connection
  let backend_host = env::var("BACKEND_HOST").unwrap();
  let backend_port = env::var("BACKEND_PORT").unwrap();
  let ws_url = format!("ws://{}:{}/{}?uuid={}", backend_host, backend_port, ws_endpoint, uuid);
  let response = WsRegisterResponse { ws_url, uuid };

  Ok(response)
}

// checks to make sure the client is already registed. If so, creates a new socket
// passes it into the client connection function.
pub async fn make_ws_connection(ws: warp::ws::Ws, query_params: WsConnectionRequest, client_list: ClientList)
-> Result<impl warp::Reply, warp::Rejection>
{
  let client = client_list.read().await.get(&query_params.uuid).cloned();

  match client {
    Some(c) => Ok(ws.on_upgrade(move |socket| client_connection(socket, query_params.uuid, client_list, c))),
    None => {
      let err = AppError::new("websocket client not registered", ErrorType::WSClientNotRegistered);
      Err(warp::reject::custom(err))
    }
  }
}

// splits the websocket into a sender and reciever, then creates
// a new unbounded channel. The sender part of this stream is stored
// as the sender field the in this clients entry in the client_list
// and is used to send them messages. The reciever part of the channel
// is bound to the sends part of the websocket channel.
async fn client_connection(ws: WebSocket, uuid: String, client_list: ClientList, mut client: Client) {
  let (client_ws_sender, mut client_ws_rcv) = ws.split();
  let (client_sender, client_rcv) = mpsc::unbounded_channel();
  let client_rcv = UnboundedReceiverStream::new(client_rcv);

  tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
      if let Err(e) = result {
          eprintln!("error sending websocket msg: {}", e);
      }
  }));

  client.sender = Some(client_sender);
  client_list.write().await.insert(uuid.clone(), client);

  //  println!("{} connected", uuid);

  while let Some(result) = client_ws_rcv.next().await {
      // let msg = match result {
      let _ = match result {
          Ok(msg) => msg,
          Err(e) => {
              eprintln!("error receiving ws message for uuid: {}): {}", uuid.clone(), e);
              break;
          }
      };
      // client_msg(&uuid, msg, &client_list).await;
  }

  client_list.write().await.remove(&uuid);
  //  println!("{} disconnected", uuid);
}