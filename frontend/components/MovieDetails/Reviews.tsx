import styles from "@/styles/MovieDetails/Reviews.module.css";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials } from "@/redux/reducers/auth";
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
  const reviews = useAppSelector(selectReveiws);
  const newReview = useAppSelector(selectNewReview);

  const [ websocket, setWebsocket ] = useState<WebSocket | null>(null);
  const [ uuid, setUuid ] = useState<string | null>(null);


  
  // this useEffect is for handling connection and disconnection process for websockets
  useEffect(() => {
    // this function is called on page mount, it registers users on server,
    // establishes websocket connection and attaches the onmessage handler
    // function when a message is recieved on the ws channel.
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
        } else {
          return;
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
          if (!response.ok) { return; }
          const data = await response.json();

          const ws = new WebSocket(data.ws_url);
          ws.onopen = () => { console.log(`connected, uuid: ${data.uuid}`); };
          ws.onmessage = (msg) => { onNewReview(msg.data); }

          setWebsocket(ws);
          setUuid(data.uuid);
        } catch (err) {
          return;
        }
      }
    }

    wsSetup();

    // this useEffect return function is called when the component unmounts
    // as in, user has navigated away from the page. It sends a request to
    // the ws-unregister endpoint with the uuid for the websocket connection
    // created in the function above when the page first loaded.
    return (() => {
      if (websocket && uuid) {
        setWebsocket(null);
        setUuid(null);

        const unregisterWsUrl = `${BACKEND_URL}/ws-unregister`;

        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = new URLSearchParams();
        console.log(`disconnecting, uuid: ${uuid}`);
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

  // this is the onmessage functions assigned to the websocket object.
  // It takes a string from the server with all the relevant data for
  // creating a new Review type object, parses the data out of the string,
  // and inserts it into the array of Reviews stored in the redux store by
  // passing it into the addNewReveiw redux action.
  function onNewReview(newReview: string) {
    console.log("onNewReview");
    let id: string | null = null
    let user_id: string | null = null;
    let username: string | null = null;
    let movie_id: string | null = null;
    let review: string | null = null;
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

      } else if (reviewFieldArray[0] === "review") {
        review = reviewFieldArray[1];
      }
    });

    if (id && user_id && username && movie_id && review) {
      console.log("creating new Review");
      const insertingNewReview: Review = {
        id,
        user_id,
        username,
        movie_id,
        review
      }

      dispatch(addNewReview({ newReview: insertingNewReview }));
    }

  }

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
        review: newReview.data.review
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
      params.append("review", newReview.data.review);

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
    }
  }, [credentials.jwt_token, credentials.username, dispatch, newReview])


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
