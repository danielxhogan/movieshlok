docker run \
--name movieshlok-backend \
--network=host \
-e DATABASE_URL=postgres://postgres:movieshlok@localhost:5432/movieshlok \
-dp 3030:3030 \
danielxhogan/movieshlok-backend
