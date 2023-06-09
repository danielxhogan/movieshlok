CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255)
);

CREATE TABLE reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL references users(id),
  movie_id VARCHAR(255) NOT NULL,
  movie_title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255) NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL references users(id),
  review_id uuid NOT NULL references reviews(id),
  comment TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE ratings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL references users(id),
  movie_id VARCHAR(255) NOT NULL,
  movie_title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL,
  last_updated BIGINT NOT NULL,
  reviewed BOOLEAN NOT NULL
);

CREATE TABLE likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL references users(id),
  movie_id VARCHAR(255) NOT NULL,
  liked BOOLEAN NOT NULL
);

CREATE TABLE lists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL references users(id),
  name VARCHAR(255) NOT NULL,
  watchlist BOOLEAN NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE list_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id uuid NOT NULL references lists(id),
  movie_id VARCHAR(255) NOT NULL,
  movie_title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL
);