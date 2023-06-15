import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

import styles from "@/styles/MovieDetails/Reviews.module.css";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import { Review } from "@/redux/actions/reviews";
import {
  selectReveiws,
  selectNewReview,
  addNewReview
} from "@/redux/reducers/reviews";

import { useEffect } from "react";


export default function Reviews() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const reviews = useAppSelector(selectReveiws);
  const newReview = useAppSelector(selectNewReview);


  useEffect(() => {
    async function wsSetup() {
      const registerWsUrl = `${BACKEND_URL}/ws-register`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const params = new URLSearchParams();
      if (credentials.jwt_token) {
        params.append("jwt_token", credentials.jwt_token);
      }
      if (movieDetails.data.id) {
        params.append("topic", movieDetails.data.id.toString());
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

      const response = await fetch(request);
      if (!response.ok) { return; }

      const data = await response.json();
      console.log(data.ws_url);
      const ws = new WebSocket(data.ws_url);

      ws.onopen = () => { console.log("connected"); };
    }
    wsSetup();

  }, [credentials.jwt_token, movieDetails.data.id]);

  useEffect(() => {
    if (newReview.status === "fulfilled" &&
        newReview.success === true &&
        newReview.data &&
        credentials.username
    ) {
      const insertingNewReview: Review = {
        id: newReview.data.id,
        user_id: newReview.data.user_id,
        username: credentials.username,
        movie_id: newReview.data.movie_id,
        review: newReview.data.review
      };

      dispatch(addNewReview({ newReview: insertingNewReview }));
    }
  }, [credentials.username, dispatch, newReview])

  function makeReview(review: Review) {
    return <div key={review.id} className="block">
      <h3 className={styles["username"]}>{review.username}</h3>
      <p>{review.review}</p>
    </div>
  }

  return <div className={styles["wrapper"]}>
    <h2 className={styles["section-title"]}>Reviews</h2>
    { reviews.data.reviews && reviews.data.reviews.map(makeReview)}
  </div>
}


