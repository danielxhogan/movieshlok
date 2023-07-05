import styles from "@/styles/MovieDetails/Ratings.module.css";
import Stars, { Rating } from "@/components/Stars";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import { selectRatingLike, unsetRatingLike } from "@/redux/reducers/reviews";
import { selectLists, addNewList, resetNewList, selectNewList } from "@/redux/reducers/lists";
import { createList, NewList } from "@/redux/actions/lists";
import { postReview, NewReview } from "@/redux/actions/reviews";

import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  FormControl,
  FormLabel,
  ModalCloseButton,
  Textarea,
  Input,
  ModalFooter
} from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

const SHOWN = "shown";
const HIDDEN = "hidden";

enum ModalType {
  Review,
  Lists
};

export default function Ratings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const ratingLike = useAppSelector(selectRatingLike);
  const lists = useAppSelector(selectLists);
  const newList = useAppSelector(selectNewList);

  const [ modalType, setModalType ] = useState(ModalType.Review);
  const [ listsState, setListsState ] = useState(lists.lists);
  const [ newListTitle, setNewListTitle ] = useState("");
  const [ reviewRating, setReviewRating] = useState(Rating.ZERO);
  const [ newReviewText, setNewReviewText ] = useState("");

  const [ rating, setRating ] = useState(Rating.ZERO);
  const [ liked, setLiked ] = useState(false);
  const [ likedClass, setLikedClass ] = useState(HIDDEN);
  const [ unlikedClass, setUnlikedClass ] = useState(SHOWN);


  const { isOpen, onOpen, onClose } = useDisclosure();

  const setLikeTrue = useCallback(() => {
        setLikedClass(SHOWN);
        setUnlikedClass(HIDDEN);
        setLiked(true);
  }, []);

  useEffect(() => {
    if (ratingLike.status === "fulfilled") {
      if (ratingLike.code === 401) {
        dispatch(unsetRatingLike());

        dispatch(unsetCredentials());
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("username");

      } else if (ratingLike.data) {
        setRating(ratingLike.data.rating);
        if (ratingLike.data.liked) {
          setLikeTrue();
        }
      }
    }
  }, [dispatch, ratingLike, router, setLikeTrue]);


  function updateRating(newRating: Rating) {
    setRating(newRating);

    if (credentials.jwt_token &&
        movieDetails.data.id &&
        movieDetails.data &&
        movieDetails.data.title &&
        movieDetails.data.poster_path
    ) {
      const updateRatingUrl = `${BACKEND_URL}/post-rating`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const params = new URLSearchParams();
      params.append("jwt_token",credentials.jwt_token);
      params.append("movie_id", movieDetails.data.id.toString());
      params.append("movie_title", movieDetails.data.title);
      params.append("poster_path", movieDetails.data.poster_path);
      params.append("rating", newRating.toString());

      const request = new Request(updateRatingUrl, { headers, body: params, method: "POST" });
      fetch(request);
    }
  }

  function updateLike(likeStatus: boolean) {
    let token: string;
    let movieId: string;

    if (credentials.jwt_token) {
      token = credentials.jwt_token;
    } else {
      return;
    }

    if (movieDetails.data.id) {
      movieId = movieDetails.data.id.toString();
    } else {
      return;
    }

    const updateRatingUrl = `${BACKEND_URL}/post-like`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", token);
    params.append("movie_id", movieId);
    params.append("liked", likeStatus.toString());

    const request = new Request(updateRatingUrl, { headers, body: params, method: "POST" });
    fetch(request);
  }

  function toggleLike() {
    switch(liked) {
      case true:
        setLiked(false);
        setLikedClass(HIDDEN);
        setUnlikedClass(SHOWN);
        updateLike(false);
        break;
      case false:
        setLiked(true);
        setLikedClass(SHOWN);
        setUnlikedClass(HIDDEN);
        updateLike(true);
        break;
    }
  }

  // MODAL OPEN
  // *******************************
  function onOpenReviewModal() {
    setModalType(ModalType.Review);
    onOpen();
    setReviewRating(rating);
  }

  function onOpenListsModal() {
    setModalType(ModalType.Lists);
    onOpen();
  }

  // MODAL RENDER
  // *******************************
  function makeReviewModalHeader() {
    let year;
    if (movieDetails.data.release_date) {
      year = movieDetails.data.release_date.substring(0,4);
    }
    return <>
      {movieDetails.data.title} <span className={styles["year"]}>{year}</span>
    </>
  }

  function makeModal(type: ModalType) {
    switch (type) {
      case ModalType.Review:
        return <>
          <ModalContent className={styles["modal"]}>
            <ModalHeader>{ makeReviewModalHeader() }</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <FormControl>
                <FormLabel className={styles["rating-label"]}>
                  <i>What did you think?</i>
                  <Stars
                    id="review"
                    initialRating={rating}
                    setParentRating={setReviewRating}
                    interactive={true}
                    size="2xl"
                  />
                </FormLabel>
                <Textarea
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  rows={10}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
            <span className={styles["heart"]} onClick={toggleLike}>
              <i className={`${styles[unlikedClass]} fa-regular fa-heart fa-2xl`}></i>
              <i className={`${styles[likedClass]} fa-solid fa-heart fa-2xl`}></i>
            </span>
              <Button
                className={styles["submit-review"]}
                colorScheme="teal" variant="outline"
                mr={3}
                onClick={onClickCloseReviewModal}
                >
                Submit Review
              </Button>
            </ModalFooter>

          </ModalContent>
        </>

      case ModalType.Lists:
        return <>
          <ModalContent className={styles["modal"]}>
            <ModalHeader>Lists</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <form onSubmit={onSubmitNewList}>
                <FormControl>
                  <FormLabel>
                  <i className="fa-solid fa-plus"></i>
                    <i> Add list</i>
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Choose a name for your new list"
                    value={newListTitle}
                    onChange={e => setNewListTitle(e.target.value)}
                    variant="filled"
                  />
                </FormControl>
              </form>

              { listsState && listsState.map(list => {
                return <>
                  { list.name }
                </>
              })}

              {/* { lists.lists && lists.lists.map(list => {
                return <>
                  { list.name }
                </>
              })} */}

            </ModalBody>

            <ModalFooter>
            </ModalFooter>

          </ModalContent>
        </>
    }
  }

  // MODAL SUBMIT
  // *******************************
  function onClickCloseReviewModal() {
    onClose();

    if (newReviewText !== "" &&
        movieDetails.data &&
        movieDetails.data.id &&
        movieDetails.data.title &&
        movieDetails.data.poster_path &&
        credentials.jwt_token &&
        credentials.username
      ) {
      const movieId = movieDetails.data.id.toString();
      const newReview: NewReview = {
        jwt_token: credentials.jwt_token,
        movieId,
        movie_title: movieDetails.data.title,
        poster_path: movieDetails.data.poster_path,
        review: newReviewText,
        rating: reviewRating,
        liked
      };

      dispatch(postReview(newReview));
    }
  }

  function onSubmitNewList(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (credentials.jwt_token) {
      const newList: NewList = {
        jwt_token: credentials.jwt_token,
        name: newListTitle
      }

      dispatch(createList(newList));
    }
  }

  // this useEffect detects when a new list is created
  // and updates the list of lists in the redux store
  useEffect(() => {
    if (newList.status === "fulfilled" &&
        newList.success === true &&
        newList.list
    ) {
      setNewListTitle("");
      if (listsState) {
        setListsState([...listsState, newList.list])
      }
      dispatch(resetNewList());
    }
  }, [newList, listsState, dispatch]);

  return <div className={`${styles["wrapper"]} block`}>
    { credentials.jwt_token ? <>
      <div className={styles["rating-review"]}>
        { ratingLike.data
        ?
          <span className={styles["stars"]}>
            <Stars
              id="rating"
              initialRating={ratingLike.data.rating}
              setParentRating={updateRating}
              interactive={true}
              size="2xl"
            />

          </span>
        :
          <span>
            <Stars
              id="rating"
              initialRating={Rating.ZERO}
              setParentRating={updateRating}
              interactive={true}
              size="2xl"
            />
          </span>
        }

        <Button
          colorScheme="teal" variant="outline"
          className={styles["review-button"]}
          onClick={onOpenReviewModal}>
          Leave Review
        </Button>
      </div>

      <div className={styles["like"]} onClick={toggleLike}>
        <div className={styles["heart"]}>
          <i className={`${styles[unlikedClass]} fa-regular fa-heart fa-2xl`}></i>
          <i className={`${styles[likedClass]} fa-solid fa-heart fa-2xl`}></i>
        </div>
        <span>Like</span>
      </div>

      <div className={styles["add-to-list"]}>
        <Button
          colorScheme="teal" variant="outline"
          className={styles["list-button"]}
          >
          Add to Watchlist
        </Button>

        <Button
          colorScheme="teal" variant="outline"
          className={styles["list-button"]}
          onClick={onOpenListsModal}
          >
          Add to other list
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />

        { makeModal(modalType) }

      </Modal>
    </> 
    :
    <>
      Login to leave a review
    </>
    }
  </div>
}
