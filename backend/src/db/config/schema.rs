// @generated automatically by Diesel CLI.

diesel::table! {
    comments (id) {
        id -> Uuid,
        user_id -> Uuid,
        review_id -> Uuid,
        comment -> Text,
        created_at -> Int8,
    }
}

diesel::table! {
    likes (id) {
        id -> Uuid,
        user_id -> Uuid,
        movie_id -> Varchar,
        liked -> Bool,
    }
}

diesel::table! {
    list_items (id) {
        id -> Uuid,
        list_id -> Uuid,
        movie_id -> Varchar,
        movie_title -> Varchar,
        poster_path -> Varchar,
        created_at -> Int8,
    }
}

diesel::table! {
    lists (id) {
        id -> Uuid,
        user_id -> Uuid,
        name -> Varchar,
        watchlist -> Bool,
        created_at -> Int8,
    }
}

diesel::table! {
    ratings (id) {
        id -> Uuid,
        user_id -> Uuid,
        movie_id -> Varchar,
        movie_title -> Varchar,
        poster_path -> Varchar,
        rating -> Int4,
        last_updated -> Int8,
        reviewed -> Bool,
    }
}

diesel::table! {
    reviews (id) {
        id -> Uuid,
        user_id -> Uuid,
        movie_id -> Varchar,
        movie_title -> Varchar,
        poster_path -> Varchar,
        review -> Text,
        rating -> Int4,
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

diesel::joinable!(comments -> reviews (review_id));
diesel::joinable!(comments -> users (user_id));
diesel::joinable!(likes -> users (user_id));
diesel::joinable!(list_items -> lists (list_id));
diesel::joinable!(lists -> users (user_id));
diesel::joinable!(ratings -> users (user_id));
diesel::joinable!(reviews -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    comments,
    likes,
    list_items,
    lists,
    ratings,
    reviews,
    users,
);
