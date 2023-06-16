# Movieshlok

## Overview
Movieshlok is website that lets users search for movies and view
details about them. It also let's users create accounts, log in,
and, if logged in, leave reviews of movies. The frontend was built
with html, css, typescript, react, next.js, and chakra ui. The
backend api was build with rust, warp, and tokio. It uses diesel
orm to connect to and query a postgres database and sends api
requests to the tmdb api for movie data.

## The website
Originally I planned to dockerize each seperate part of the app.
I wrote a docker compose file and my plan was to upload the
docker images to my dockerhub and you could just run docker
compose up and the docker-compose.yml file would pull the images
and start the containers so there would be no setup. However, I
ran into a bunch of issues the more complex the app became and
because of reasons, the app doesn't want to behave the same when
it's run in a container as it does when running directly on the
my computer. So my solution for you to be able to see the 
website in action is to just host it. I created a droplet on
digital ocean and am running the website on a server with ip 
address 24.199.120.171. If enter it into your browser, you should be
taken to the home page.

The home page is mostly blank at this point but you should see
a nav bar and a search bar. If you enter a movie title into the
search bar and hit enter, you will be taken to the search
results page. From here you can click on a result. As long as it
is a movie result and not a person result, you will be taken to
the movie details page for that movie. If you scroll down, you
should see a section that says you must be logged in to leave
a review. If click the register button in the nav bar, you can
go to the register page and create an account.

Since this is just for testing purposes, I suggest just using
dummy data. There is no input checking on the password other
than that both passwords must match. The email just checks that
it has an @ in it but it doesn't need to be a valid email. Once
you register, you should be taken to the log in page where you
can log in. After you successfully log in, you should be taken
to the same page you were on previously except now there will
be a button that says Leave Review. If you click it, a modal
will pop and you can enter your review. When the review is
submitted, a request is sent to the api to insert a new review
into the database. If the review is created succesfully, the
browser should add the new review to the list of reviews in the
redux store. You will see the new review immediately pop up at
the bottom of the list of reviews.

If any other user is viewing
the movie details page for the same movie, they will also see
the new review pop up in real time. To test this feature, open
a second browser. For this to work it has to be a completely
different browser, not just another tab or window with the same
browser. In the second browser go to the same movie details page
then leave a review in the first browser. The second browser
does not have to be logged in for this to work. You should see
the review from the first browser pop up in the second browser.
To test this further, go to a movie details page for a different
movie in either browser. Then leave another review in the first
browser. You will see that although both browsers are on the
/details/movie endpoint, the second browser won't see the review
because it's intended for a different movie. Clients will only
recieve socket messages for new reviews if the new review is
for the movie they are currently viewing.

## The code
The server process is initiated in the main function in src
directory of the backend folder. This function first establishes
a connection to the database and then creates a new Arc<RwLock<HashMap>> to store the list of clients connected to
the websocket endpoint for reviews. It creates a filter that
allows cors request and then it groups together all the filters
that are exported from each file in the routes folder. Each
filter corresponds to an endpoint. The auth file has enpoints
for registering and logging in. The tmdb file has endpoints for
querying the tmdb api for movie data. This is where the data
displayed on the search and movie details pages comes from. The
reviews file has all the endpoints for reviews. get_reviews
queries the database for all reviews related to a specific movie.
post_reviews is used to create a new review in the database.

### sockets
register_ws_client creates a client struct for a user when they
first go to the movie details page. It keeps track of the movie id
of the movie they are viewing as the topic field in the client
struct and adds the client to the client list. make_ws_connection
is the url passed into the websocket constructor function in the
browser. As long as the connection is successful, the ws object
in the client will have a connection to the ws channel managed
on the server and can receive unsolicited messages on it. When
a user creates a new review, it sends a request to the emit_review
endpoint with the new review and the topic it's for. This function
loops through the client_list and sends the review to any client
whose topic field matches the topic of the new review.