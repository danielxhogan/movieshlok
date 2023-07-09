import styles from "@/styles/MovieDetails/Reviews.module.css";
import Stars from "@/components/Stars";
import Pagination, { UseCases } from "../Pagination";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { Review } from "@/redux/actions/reviews";
import {
  selectReveiws,
  selectNewReview,
  addNewReview,
  resetNewReview
} from "@/redux/reducers/reviews";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import { deleteReview, DeleteReviewRequest } from "@/redux/actions/review";

import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  useToast,
  Tooltip,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  Button,
  ModalFooter,
} from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;


export default function Reviews() {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const reviews = useAppSelector(selectReveiws);
  const newReview = useAppSelector(selectNewReview);
  const movieDetails = useAppSelector(selectMovieDetails);

  const [ deletingReviewId, setDeletingReviewId ] = useState("");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // this is the onmessage functions assigned to the websocket object.
  // It takes a string from the server with all the relevant data for
  // creating a new Review type object, parses the data out of the string,
  // and inserts it into the array of Reviews stored in the redux store by
  // passing it into the addNewReveiw redux action.
  const onNewReview = useCallback((newReview: string) => {
    let id: string | null = null
    let user_id: string | null = null;
    let username: string | null = null;
    let movie_id: string | null = null;
    let rating: number | null = null;
    let review: string | null = null;
    let created_at: number | null = null;
    const newReviewArray = newReview.split(";");

    newReviewArray.forEach(reviewField => {
      const reviewFieldArray = reviewField.split("=");
      const key = reviewFieldArray[0];
      const value = reviewFieldArray[1];

      switch (key) {
        case "id": id = value; break;
        case "user_id": user_id = value; break;
        case "username": username = value; break;
        case "movie_id": movie_id = value; break;
        case "rating": rating = parseInt(value); break;
        case "review": review = value; break;
        case "created_at": created_at = parseInt(value); break;
      }
    });

    if (id && user_id && username && movie_id && rating && review && created_at) {
      const insertingNewReview: Review = {
        id,
        user_id,
        username,
        movie_id,
        rating,
        review,
        created_at
      }

      dispatch<any>(addNewReview({ newReview: insertingNewReview }));
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
    // the unregister-reviews-ws endpoint with the uuid for the websocket connection
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
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");

      toast({
        title: "Youv'e been logged out",
        description: "",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  }, [newReview, credentials.jwt_token, credentials.username, dispatch, router, toast])

  function onClickDeleteReview(review: Review) {
    onOpen();
  }

  function dispatchDeleteReview() {
    if (credentials.jwt_token && movieDetails.data && movieDetails.data.id) {
      const deleteRequest: DeleteReviewRequest = {
        jwt_token: credentials.jwt_token,
        review_id: deletingReviewId,
        movie_id: movieDetails.data.id.toString()
      };

      dispatch<any>(deleteReview(deleteRequest));
    }
  }

  function makeReview(review: Review) {
    const date = new Date(review.created_at * 1000);
    const month = date.getMonth();
    let monthText: string = "";

    switch (month) {
      case 0: monthText = "January"; break;
      case 1: monthText = "February"; break;
      case 2: monthText = "March"; break;
      case 3: monthText = "April"; break;
      case 4: monthText = "May"; break;
      case 5: monthText = "June"; break;
      case 6: monthText = "July"; break;
      case 7: monthText = "August"; break;
      case 8: monthText = "September"; break;
      case 9: monthText = "October"; break;
      case 10: monthText = "November"; break;
      case 11: monthText = "December"; break;
    }

    // return <Link href={`/u/${review.username}/review?id=${review.id}&movieId=${review.movie_id}`} key={review.id}>
      return <div className="block block-btn" key={review.id}>
      
        <div className={styles["review-title"]}>
          <div className={styles["username-rating"]}>
            <Link href={`/u/${review.username}/profile`}>
              <h3 className={styles["username"]}>{review.username}</h3>
            </Link>
            <Stars
              id="reviews"
              initialRating={review.rating}
              setParentRating={() => {}}
              interactive={false}
              size="lg"
            />
          </div>
          
          <div className={styles["review-title-right"]}>
            <i>{ `${monthText} ${date.getDate()}, ${date.getFullYear()}` }</i>
            { credentials.username === review.username &&
              <Tooltip
                label={"delete review"}
                placement="top"
                >
                <i
                className={`${styles["delete-review"]} fa-solid fa-trash fa-lg`}
                onClick={() => onClickDeleteReview(review)}
                />
              </Tooltip>
            }

          </div>
        </div>

        <Link href={`/u/${review.username}/review?id=${review.id}&movieId=${review.movie_id}`} key={review.id}>
          <p>{review.review}</p>
        </Link>
      </div>
    {/* </Link> */}
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
        {/* @ts-ignore */}
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

      
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />

          <ModalContent className={styles["modal"]}>
            <ModalHeader>Delete Review</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <i>Are you sure you want to delete your review for <strong>{movieDetails.data.title}</strong></i>
              <br /><br />
            </ModalBody>

            <ModalFooter>
              <Button
                className={styles["submit-review"]}
                colorScheme="red" variant="outline"
                mr={3}
                onClick={dispatchDeleteReview}
                >
                Delete Review
              </Button>
            </ModalFooter>

          </ModalContent>

      </Modal>
    </>
    }
  </div>
}
