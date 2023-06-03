CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255)
);

CREATE TYPE star AS ENUM ('0', '1', '2', '3', '4', '5');

CREATE TABLE reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL references users(id),
  movie_id VARCHAR(255) NOT NULL,
  rating star,
  review TEXT NOT NULL,
  liked BOOLEAN
);