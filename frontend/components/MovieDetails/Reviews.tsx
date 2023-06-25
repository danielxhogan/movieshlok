import styles from "@/styles/MovieDetails/Reviews.module.css";
import Stars from "@/components/Stars";
import Pagination, { UseCases } from "../Pagination";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { Review } from "@/redux/actions/reviews";
import {
  selectReveiws,
  selectNewReview,
  addNewReview,
  resetNewReview
} from "@/redux/reducers/reviews";

import { useRouter } from "next/router";
import { useEffect, useCallback } from "react";
import { Spinner } from "@chakra-ui/react";

import getConfig from "next/config";
import Link from "next/link";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;


export default function Reviews() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const reviews = useAppSelector(selectReveiws);
  const newReview = useAppSelector(selectNewReview);

  // this is the onmessage functions assigned to the websocket object.
  // It takes a string from the server with all the relevant data for
  // creating a new Review type object, parses the data out of the string,
  // and inserts it into the array of Reviews stored in the redux store by
  // passing it into the addNewReveiw redux action.
  const onNewReview = useCallback((newReview: string) => {
    console.log("onNewReview");
    let id: string | null = null
    let user_id: string | null = null;
    let username: string | null = null;
    let movie_id: string | null = null;
    let rating: number | null = null;
    let review: string | null = null;
    let created_at: number = 0;
    const newReviewArray = newReview.split(";");

    newReviewArray.forEach(reviewField => {
      const reviewFieldArray = reviewField.split("=");

      if (reviewFieldArray[0] === "id") {
        id = reviewFieldArray[1];

      } else if (reviewFieldArray[0] === "user_id") {
        user_id = reviewFieldArray[1];

      } else if (reviewFieldArray[0] === "username") {
        username = reviewFieldArray[1];

      } else if (reviewFieldArray[0] === "movie_id") {
        movie_id = reviewFieldArray[1];

      } else if (reviewFieldArray[0] === "rating") {
        rating = parseInt(reviewFieldArray[1]);

      } else if (reviewFieldArray[0] === "review") {
        review = reviewFieldArray[1];

      } else if (reviewFieldArray[0] === "created_at") {
        created_at = parseInt(reviewFieldArray[1]);
      }
    });

    if (id && user_id && username && movie_id && rating && review) {
      console.log("creating new Review");
      const insertingNewReview: Review = {
        id,
        user_id,
        username,
        movie_id,
        rating,
        review,
        created_at
      }

      dispatch(addNewReview({ newReview: insertingNewReview }));
    }

  }, [dispatch]);

  // this useEffect is for handling connection and disconnection process for websockets
  useEffect(() => {
    // this function is called on page mount, it registers users on server,
    // establishes websocket connection and attaches the onmessage handler
    // function when a message is recieved on the ws channel.
    async function wsSetup() {
      const registerWsUrl = `${BACKEND_URL}/register-reviews-ws`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      // add params
      const params = new URLSearchParams();

      // add credentials if logged in
      if (credentials.jwt_token) {
        params.append("jwt_token", credentials.jwt_token);
      }

      // add movieId as topic
      const topic = router.query.movieId;
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

      const request = new Request(registerWsUrl,
        {
          headers,
          credentials: "include",
          mode: "cors",
          body: params,
          method: "POST"
        }
      );

      try {
        const response = await fetch(request);
        const data = await response.json();

        if (!response.ok) {
          console.log(`ws-uuid: ${ws_uuid}, message: ${data.message}`)
          return;
        }

        const ws = new WebSocket(data.ws_url);
        ws.onopen = () => { console.log(`connected, uuid: ${data.uuid}`); };
        ws.onmessage = (msg) => { onNewReview(msg.data); }

        localStorage.setItem("ws-uuid", data.uuid);

      } catch (err) {
        return;
      }
    }

    wsSetup();

    // this useEffect return function is called when the component unmounts
    // as in, user has navigated away from the page. It sends a request to
    // the ws-unregister endpoint with the uuid for the websocket connection
    // created in the function above when the page first loaded.
    return (() => {
      const ws_uuid = localStorage.getItem("ws-uuid");
      if (ws_uuid) {
        const unregisterWsUrl = `${BACKEND_URL}/unregister-reviews-ws`;

        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = new URLSearchParams();
        console.log(`disconnecting, uuid: ${ws_uuid}`);
        params.append("uuid", ws_uuid);

        const request = new Request(unregisterWsUrl,
          {
            headers,
            credentials: "include",
            mode: "cors",
            body: params,
            method: "POST"
          }
        );

        fetch(request);
        localStorage.setItem("ws-uuid", "");
      }
    });
  }, [credentials.jwt_token, router.query.movieId, dispatch, onNewReview]);

  // this useEffect detects any changes in newReview. When a new reveiw
  // is detected, it creates a new Review type object and iserts it into
  // the array of reviews. It then sends all the data to the emit-review
  // endpoint so the server can send the new review to any other client
  // on the same movie details page.
  useEffect(() => {
    if (newReview.status === "fulfilled" &&
        newReview.success === true &&
        newReview.data &&
        credentials.jwt_token &&
        credentials.username
    ) {
      const insertingNewReview: Review = {
        id: newReview.data.id,
        user_id: newReview.data.user_id,
        username: credentials.username,
        movie_id: newReview.data.movie_id,
        rating: newReview.data.rating,
        review: newReview.data.review,
        created_at: newReview.data.created_at
      };

      dispatch(addNewReview({ newReview: insertingNewReview }));

      const emitReviewUrl = `${BACKEND_URL}/emit-review`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const params = new URLSearchParams();
      params.append("id", newReview.data.id);
      params.append("jwt_token", credentials.jwt_token);
      params.append("username", credentials.username);
      params.append("topic", newReview.data.movie_id);
      params.append("rating", newReview.data.rating.toString());
      params.append("review", newReview.data.review);
      params.append("created_at", newReview.data.created_at.toString());

      const request = new Request(emitReviewUrl,
        {
          headers,
          credentials: "include",
          mode: "cors",
          body: params,
          method: "POST"
        }
      );

      fetch(request);
      dispatch(resetNewReview());

    } else if (newReview.code === 401) {
      dispatch(resetNewReview());

      dispatch(unsetCredentials());
      document.cookie = "username=";
      document.cookie = "jwt_token=";
      // router.push("/auth/login");
    }
  }, [newReview, credentials.jwt_token, credentials.username, dispatch, router])

  function makeReview(review: Review) {
    const date = new Date(review.created_at * 1000);
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

    return <Link href={`/u/${review.username}/review?id=${review.id}&movieId=${review.movie_id}`} key={review.id}>
      <div className="block block-btn">
      
        <div className={styles["review-title"]}>
          <div className={styles["username-rating"]}>
            <h3 className={styles["username"]}>{review.username}</h3>
            <Stars
              id="reviews"
              initialRating={review.rating}
              setParentRating={() => {}}
              interactive={false}
              size="lg"
            />

          </div>
        <div>{ `${monthText} ${date.getDate()}, ${date.getFullYear()}` }</div>
        </div>

        <p>{review.review}</p>
      </div>
    </Link>
  }

  function sortAndMakeReviews(reviews: Review[]) {
    if (reviews.length === 0) {
        return <h2 className={styles["no-reviews"]}>Be the first to review</h2>

    } else {
      reviews.sort((review1: Review, review2: Review) => {
        if (review1.created_at < review2.created_at) { return  1; }
        if (review1.created_at > review2.created_at) { return -1; }
        return 0;
      });

      return reviews.map(review => makeReview(review));
    }
  }

  return <div className={styles["wrapper"]}>
    <h2 className={styles["section-title"]}>Reviews</h2>

    { reviews.status === "loading"
    ?
      <div className="spinner">
        <Spinner size='xl' />
      </div>
    :
    <>
      { reviews.data.reviews && sortAndMakeReviews([...reviews.data.reviews])}

      { reviews.total_pages !== null &&
        reviews.total_pages > 1 &&
        typeof router.query.movieId === "string" &&

        <Pagination
          useCase={UseCases.REVIEWS}
          currentPage={reviews.page}
          totalPages={reviews.total_pages}
          movieId={router.query.movieId}
        />
      }
    </>
    }
  </div>
}
