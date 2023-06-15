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

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;


export default function Reviews() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const reviews = useAppSelector(selectReveiws);
  const newReview = useAppSelector(selectNewReview);

  const [ websocket, setWebsocket ] = useState<WebSocket | null>(null);
  const [ uuid, setUuid ] = useState<string | null>(null);


  useEffect(() => {
    async function wsSetup() {
      if (!websocket && !uuid) {
        const registerWsUrl = `${BACKEND_URL}/ws-register`;

        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = new URLSearchParams();
        if (credentials.jwt_token) {
          params.append("jwt_token", credentials.jwt_token);
        }

        const topic = router.query.movieId;
        if (typeof topic === "string") {
          console.log(`topic: ${topic}`);
          params.append("topic", topic);
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
        console.log(data);
        const ws = new WebSocket(data.ws_url);

        ws.onopen = () => { console.log("connected"); };
        ws.onmessage = (msg) => { console.log(`recieved message: ${msg.data}`); }
        setWebsocket(ws);
        setUuid(data.uuid);
      }
    }

    wsSetup();

    return (() => {
      if (websocket && uuid) {
        setWebsocket(null);
        setUuid(null);

        const unregisterWsUrl = `${BACKEND_URL}/ws-unregister`;

        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = new URLSearchParams();

        console.log(`disconnecting: uuid: ${uuid}`);
        params.append("uuid", uuid);

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
      }
    });

  }, [credentials.jwt_token, router.query.movieId, uuid, websocket]);

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
