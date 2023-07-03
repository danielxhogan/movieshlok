import styles from "@/styles/u/ReviewDetailsPage.module.css";
import Navbar from "@/components/Navbar"
import ProfileNav from "@/components/ProfileNav";
import Stars from "@/components/Stars";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { getMovieDetails } from "@/redux/actions/tmdb";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import {
  getReviewDetails,
  postComment,
  GetReviewRequest,
  Comment,
  NewComment
} from "@/redux/actions/review";
import {
  selectReviewDetails,
  addNewComment,
  selectNewComment,
  resetNewComment
} from "@/redux/reducers/review";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Textarea, Button, Spinner } from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;


export default function ReviewDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const reviewDetails = useAppSelector(selectReviewDetails);
  const newComment = useAppSelector(selectNewComment);

  const [ commentText, setCommentText ] = useState("");

  useEffect(() => {
    if (typeof router.query.movieId === "string") {
      dispatch(getMovieDetails(router.query.movieId));
    }
    if (typeof router.query.id === "string") {
      const getReviewRequest: GetReviewRequest = {
        review_id: router.query.id,
        page: 1
      };

      dispatch(getReviewDetails(getReviewRequest));

    }
  }, [dispatch, router.query]);

  // this is the onmessage functions assigned to the websocket object.
  // It takes a string from the server with all the relevant data for
  // creating a new Review type object, parses the data out of the string,
  // and inserts it into the array of Reviews stored in the redux store by
  // passing it into the addNewReveiw redux action.
  const onNewComment = useCallback((newComment: string) => {
    console.log("new Comment");
    let id: string | null = null;
    let username: string | null = null;
    let review_id: string | null = null;
    let comment: string | null = null;
    let created_at: number | null = null;
    const newCommentArray = newComment.split(";");

    newCommentArray.forEach(commentField => {
      const commentFieldArray = commentField.split("=");
      const key = commentFieldArray[0];
      const value = commentFieldArray[1];

      switch (key) {
        case "id": id = value; break;
        case "username": username = value; break;
        case "review_id": review_id = value; break;
        case "comment": comment = value; break;
        case "created_at": created_at = parseInt(value); break;
      }
    });

    if (id && username && review_id && comment && created_at) {
      const insertingNewComment: Comment = {
        id,
        username,
        review_id,
        comment,
        created_at
      };

      dispatch(addNewComment(insertingNewComment));
    }
  }, [dispatch]);

  // this useEffect is for handling connection and disconnection process for websockets
  useEffect(() => {
    // this function is called on page mount, it registers users on server,
    // establishes websocket connection and attaches the onmessage handler
    // function when a message is recieved on the ws channel.
    async function wsSetup() {
      const registerWsUrl = `${BACKEND_URL}/register-comments-ws`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      // add params
      const params = new URLSearchParams();

      // add credentials if logged in
      if (credentials.jwt_token) {
        params.append("jwt_token", credentials.jwt_token);
      }

      // add review id as topic
      const topic = router.query.id;
      if (typeof topic === "string") {
        console.log(`topic: ${topic}`);
        params.append("topic", topic);
      } else {
        return;
      }

      // add ws-uuid to check if already connected
      const ws_uuid = localStorage.getItem("ws-uuid");
      if (ws_uuid) {
        params.append("uuid", ws_uuid);
      }

      const request = new Request(registerWsUrl, { headers, body: params, method: "POST"});
      try {
        const response = await fetch(request);
        const data = await response.json();

        if ( !response.ok ) {
          console.log(`ws-uuid: ${ws_uuid}, message: ${data.message}`)
          return;
        }

        const ws = new WebSocket(data.ws_url);
        ws.onopen = () => { console.log(`connected, uuid: ${data.uuid}`); };
        ws.onmessage = (msg) => { onNewComment(msg.data); }

        localStorage.setItem("ws-uuid", data.uuid);

      } catch (err) {
        return;
      }
    }

    wsSetup();

    // this useEffect return function is called when the component unmounts
    // as in, user has navigated away from the page. It sends a request to
    // the unregister-comments-ws endpoint with the uuid for the websocket connection
    // created in the function above when the page first loaded.
    return (() => {
      const ws_uuid = localStorage.getItem("ws-uuid");
      if (ws_uuid) {
        const unregisterWsUrl = `${BACKEND_URL}/unregister-comments-ws`;

        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = new URLSearchParams();
        console.log(`disconnecting, uuid: ${ws_uuid}`);
        params.append("uuid", ws_uuid);

        const request = new Request(unregisterWsUrl, { headers, body: params, method: "POST" }
        );

        fetch(request);
        localStorage.setItem("ws-uuid", "");
      }
    });

  }, [credentials.jwt_token, onNewComment, router.query.id]);

  useEffect(() => {
    if (newComment.status === "fulfilled" &&
        newComment.success === true &&
        newComment.data &&
        credentials.username &&
        credentials.jwt_token
    ) {
      const insertingNewComment: Comment = {
        id: newComment.data.id,
        username: credentials.username,
        review_id: newComment.data.review_id,
        comment: newComment.data.comment,
        created_at: newComment.data.created_at
      }

      dispatch(addNewComment(insertingNewComment));
      setCommentText("");

      const emitCommentUrl = `${BACKEND_URL}/emit-comment`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const params = new URLSearchParams();
      params.append("id", newComment.data.id);
      params.append("jwt_token", credentials.jwt_token);
      params.append("username", credentials.username);
      params.append("topic", newComment.data.review_id);
      params.append("comment", newComment.data.comment);
      params.append("created_at", newComment.data.created_at.toString());

      const request = new Request(emitCommentUrl, { headers, body: params, method: "POST"});
      fetch(request);
      dispatch(resetNewComment());

    } else if (newComment.code === 401) {
      dispatch(resetNewComment());

      dispatch(unsetCredentials());
      document.cookie = "username=";
      document.cookie = "jwt_token=";
    }
  }, [newComment, credentials.username, dispatch, credentials.jwt_token]);

  function makeTitle() {
    let year: string = "";
    let directors: string[] = [];
    let director: string = "";

    if (movieDetails.data.release_date) {
      year = movieDetails.data.release_date.substring(0, 4);
    }

    movieDetails.data.credits?.crew?.forEach(crewMember => {
      if (crewMember.job === "Director") {
        crewMember.name && directors.push(crewMember.name);
      }
    });

    if (directors.length > 0) {
      director = directors[0];
    }
    
    return <div className={styles["title-text"]}>
      <h1>
        <span className={styles["title"]}>
          { movieDetails.data.title },
        </span>
        <span className={styles["year"]}>
          { year }
        </span>
      </h1>
      <h3>
        directed by
        <span className={styles["director"]}> {director}</span>
      </h3>
    </div>
  }

  function makeDate(timestamp: number) {
    if (reviewDetails.data) {
      const date = new Date(timestamp * 1000);
      const month = date.getMonth();
      let monthText: string = "";

      switch (month) {
        case 1: monthText = "January"; break;
        case 2: monthText = "February"; break;
        case 3: monthText = "March"; break;
        case 4: monthText = "April"; break;
        case 5: monthText = "May"; break;
        case 6: monthText = "June"; break;
        case 7: monthText = "July"; break;
        case 8: monthText = "August"; break;
        case 9: monthText = "September"; break;
        case 10: monthText = "October"; break;
        case 11: monthText = "November"; break;
        case 12: monthText = "December"; break;
      }

      return <span>{`${monthText} ${date.getDate()}, ${date.getFullYear()}`}</span>
    }
  }

  function makeComment(comment: Comment) {
    return <div className="block">
      <div className={styles["comment-title"]}>
        <h3 className={styles["username"]}><strong>{comment.username}</strong></h3>
        <div><i>{ makeDate(comment.created_at) }</i></div>
      </div>

      <p>{comment.comment}</p>

    </div>
  }

  function onClickAddComment() {
    if (commentText !== "" &&
        credentials.jwt_token &&
        reviewDetails.data
      ) {
      const newComment: NewComment = {
        jwt_token: credentials.jwt_token,
        review_id: reviewDetails.data?.review.id,
        comment: commentText
      }

      dispatch(postComment(newComment));
    }
  }

  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <ProfileNav />
      { movieDetails.status === "fulfilled" ?
        <div className={styles["review-content"]}>

          <div className={styles["movie-poster-div"]}>
          { movieDetails.data.poster_path &&
            <Image
              src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
              className={styles["movie-poster"]}
              onClick={ () => { router.push(`/details/movie/${movieDetails.data.id}`) }}
              width={300}
              height={500}
              alt="backdrop">
            </Image>
          }
          </div>

          <div className={styles["review-details"]}>
            <div className={styles["title-section"]}>

              <div className={styles["title-movie-poster"]}>
                { movieDetails.data.poster_path &&
                  <Image
                    src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
                    className={styles["movie-poster"]}
                    onClick={ () => { router.push(`/details/movie/${movieDetails.data.id}`) }}
                    width={300}
                    height={500}
                    alt="backdrop">
                  </Image>
                }
              </div>

              <div className={styles["user-title-data"]}>
                <div className={styles["username-section"]}>
                  <h2>{ typeof router.query.username === "string" && router.query.username }</h2>

                  <div className={styles["rating-heart"]}>
                    {reviewDetails.data &&
                      <Stars
                        id="title-section"
                        initialRating={reviewDetails.data.review.rating}
                        setParentRating={()=>{}}
                        interactive={false}
                        size={"xl"}
                      />
                    }
                    <span className={styles["heart"]}>
                      { reviewDetails.data && reviewDetails.data.liked
                      ?
                        <i className={`fa-solid fa-heart fa-2xl`}></i>
                      :
                        <i className={`fa-regular fa-heart fa-2xl`}></i>
                      }
                    </span>
                  </div>
                </div>

                <div className={styles["user-title-movie-poster"]}>
                  { movieDetails.data.poster_path &&
                    <Image
                      src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
                      className={styles["movie-poster"]}
                      onClick={ () => { router.push(`/details/movie/${movieDetails.data.id}`) }}
                      width={300}
                      height={500}
                      alt="backdrop">
                    </Image>
                  }
                </div>

                { makeTitle() }
              </div>

            </div>  {/* end title-section */}

            <div className={`${styles["review-section"]} block`}>
              { reviewDetails.status === "fulfilled" ?
              <>
                { reviewDetails.data &&
                <>
                  <p className={styles["date"]}>Watched on { makeDate(reviewDetails.data.review.created_at) }</p>
                  <p>{ reviewDetails.data.review.review }</p>
                </>
                }
              </>
              :
                <div className="spinner">
                  <Spinner size='xl' />
                </div>
              }
            </div>

            <div className={styles["comments-section"]}>
              <h2 className={styles["comments-title"]}>Comments</h2>
              { reviewDetails.status === "fulfilled" ?
                  reviewDetails.data && reviewDetails.data.comments.length > 0 ?
                  <>{reviewDetails.data.comments.map(comment => makeComment(comment)) }</>
                  :
                  <h2 className={styles["no-comments"]}>Be the first to comment</h2>
                  // <>no Comments</>
                :
                  <div className="spinner">
                    <Spinner size='xl' />
                  </div>
              }
            </div>

            <div className={`${styles["comment-section"]} block`}>
              { credentials.jwt_token ?
              <>
                Leave a comment
                <Textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={5}
                />
                <div className={styles["submit-comment"]}>
                  <Button
                    className={styles["submit-comment-button"]}
                    colorScheme="teal" variant="outline"
                    mr={3}
                    onClick={onClickAddComment}
                    >
                    Add Comment
                  </Button>
                </div>
              </>
              :
              <p>Login to leave a comment</p>
              }
            </div>
          </div>

        </div>
      :
        <div className="spinner">
          <Spinner size='xl' />
        </div>
      }

    </div>
    <Footer />
  </div>
}
