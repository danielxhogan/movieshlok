// @generated automatically by Diesel CLI.

diesel::table! {
    reviews (id) {
        id -> Uuid,
        user_id -> Uuid,
        movie_id -> Varchar,
        rating -> Nullable<Int4>,
        review -> Text,
        liked -> Nullable<Bool>,
        created_at -> Int8,
    }
}

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

diesel::joinable!(reviews -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    reviews,
    users,
);
