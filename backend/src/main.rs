use movieshlok::db::auth;

fn main() {
    let connection = &mut movieshlok::db::config::db_connect::establish_connection();

    // CREATE USER
    let username = "suh";
    // let email = "suh";
    // let password = "dude asah";

    // let new_user = auth::register_user(connection, username, email, password);
    // println!("{}", new_user.username);


    // READ USER
    let user = auth::get_user(connection, username);
    println!("users email is: {}", user[0].email);


    // UPDATE USER
    // DELETE USER
}