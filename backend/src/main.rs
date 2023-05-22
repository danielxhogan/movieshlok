pub mod routes;
pub mod db;
pub mod utils;

// use db::auth;

#[tokio::main]
async fn main() {
  let pg_pool = db::config::db_connect::establish_connection();


  
  // warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;





  // ROUTES TESTING

  // REGISTER USER



  // LOGIN USER













  // DB TESTING

  // CREATE USER
  // let username = "userwithhashing";
  // let email = "emailwithhashing";
  // let password = "hashedpassword";

  // let new_user = match auth::register_user(connection, username, email, password) {
  //   Ok(user) => user,
  //   Err(msg) => {
  //     println!("{}", msg);
  //     return;
  //   }
  // };

  // println!("{}", new_user.username);


  // LOGIN USER
  // let token = auth::login_user(connection, username, password);
  // match token {
  //   Ok(token) => println!("token is: {}", token),
  //   Err(msg) => println!("{}", msg)
  // }

  // READ USER
  // let user = auth::get_user(connection, username);

  // match user {
  //   Ok(user) => println!("users email is: {}", user[0].email),
  //   Err(msg) => println!("{}", msg)
  // }


  // UPDATE USER
  // DELETE USER
}