// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Uuid,
        username -> Varchar,
        email -> Varchar,
        password -> Varchar,
        first_name -> Nullable<Varchar>,
        last_name -> Nullable<Varchar>,
    }
}
