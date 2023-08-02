import styles from "@/styles/MovieDetails/Ratings.module.css";
import Stars, { Rating } from "@/components/Stars";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import { selectRatingLike, unsetRatingLike } from "@/redux/reducers/reviews";
import {
  selectLists,
  addNewList,
  resetNewList,
  selectNewList,
  selectNewListItem,
  resetNewListItem
} from "@/redux/reducers/lists";

import {
  createList,
  createListItem,
  List,
  NewList,
  NewListItem
} from "@/redux/actions/lists";

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
  ModalFooter,
  useToast
} from "@chakra-ui/react";

const BACKEND_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

const SHOWN = "shown";
const HIDDEN = "hidden";

enum ModalType {
  Review,
  Lists
}

export default function Ratings() {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const ratingLike = useAppSelector(selectRatingLike);
  const lists = useAppSelector(selectLists);
  const newList = useAppSelector(selectNewList);
  const newListItem = useAppSelector(selectNewListItem);

  const [modalType, setModalType] = useState(ModalType.Review);
  const [newListTitle, setNewListTitle] = useState("");
  const [reviewRating, setReviewRating] = useState(Rating.ZERO);
  const [newReviewText, setNewReviewText] = useState("");

  const [rating, setRating] = useState(Rating.ZERO);
  const [liked, setLiked] = useState(false);
  const [likedClass, setLikedClass] = useState(HIDDEN);
  const [unlikedClass, setUnlikedClass] = useState(SHOWN);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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

        toast({
          title: "You need to log in again",
          description: "",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      } else if (ratingLike.data) {
        setRating(ratingLike.data.rating);
        if (ratingLike.data.liked) {
          setLikeTrue();
        }
      }
    }
  }, [ratingLike, dispatch, router, setLikeTrue, toast]);

  function updateRating(newRating: Rating) {
    setRating(newRating);

    if (
      credentials.jwt_token &&
      credentials.username &&
      movieDetails.data.id &&
      movieDetails.data &&
      movieDetails.data.title &&
      movieDetails.data.poster_path
    ) {
      const updateRatingUrl = `${BACKEND_URL}/post-rating`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const params = new URLSearchParams();
      params.append("jwt_token", credentials.jwt_token);
      params.append("username", credentials.username);
      params.append("movie_id", movieDetails.data.id.toString());
      params.append("movie_title", movieDetails.data.title);
      params.append("poster_path", movieDetails.data.poster_path);
      params.append("rating", newRating.toString());

      const request = new Request(updateRatingUrl, {
        headers,
        body: params,
        method: "POST"
      });
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

    const request = new Request(updateRatingUrl, {
      headers,
      body: params,
      method: "POST"
    });
    fetch(request);
  }

  function toggleLike() {
    switch (liked) {
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
      year = movieDetails.data.release_date.substring(0, 4);
    }
    return (
      <>
        {movieDetails.data.title} <span className={styles["year"]}>{year}</span>
      </>
    );
  }

  function makeList(list: List) {
    if (list.watchlist) {
      return;
    }

    return (
      <>
        <div
          className={styles["list"]}
          onClick={() => onClickList(list.id, list.name, false)}
        >
          {list.name}
          <br />
        </div>
      </>
    );
  }

  function makeModal(type: ModalType) {
    switch (type) {
      case ModalType.Review:
        return (
          <>
            {/* @ts-ignore */}
            <ModalContent className={styles["modal"]}>
              <ModalHeader>{makeReviewModalHeader()}</ModalHeader>
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
                  <i
                    className={`${styles[unlikedClass]} fa-regular fa-heart fa-2xl`}
                  ></i>
                  <i
                    className={`${styles[likedClass]} fa-solid fa-heart fa-2xl`}
                  ></i>
                </span>
                <Button
                  className={styles["submit-review"]}
                  colorScheme="teal"
                  variant="outline"
                  mr={3}
                  onClick={onClickCloseReviewModal}
                >
                  Submit Review
                </Button>
              </ModalFooter>
            </ModalContent>
          </>
        );

      case ModalType.Lists:
        return (
          <>
            <ModalContent className={styles["modal"]}>
              <ModalHeader>Lists</ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                {lists.lists && lists.lists.map(list => makeList(list))}
                <br />

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
              </ModalBody>

              <ModalFooter></ModalFooter>
            </ModalContent>
          </>
        );
    }
  }

  // MODAL SUBMIT
  // *******************************

  // NEW REVIEW
  // *******************************
  function onClickCloseReviewModal() {
    onClose();

    if (
      newReviewText !== "" &&
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
        username: credentials.username,
        movieId,
        movie_title: movieDetails.data.title,
        poster_path: movieDetails.data.poster_path,
        review: newReviewText,
        rating: reviewRating,
        liked
      };

      dispatch<any>(postReview(newReview));
    }
  }

  // NEW LIST ITEM
  // *******************************
  function onClickList(
    list_id: string | null,
    list_name: string,
    watchlist: boolean
  ) {
    if (
      credentials.jwt_token &&
      movieDetails.data.id &&
      movieDetails.data.title &&
      movieDetails.data.poster_path
    ) {
      if (!watchlist && list_id) {
        const newListItem: NewListItem = {
          jwt_token: credentials.jwt_token,
          list_id,
          list_name,
          movie_id: movieDetails.data.id.toString(),
          movie_title: movieDetails.data.title,
          poster_path: movieDetails.data.poster_path,
          watchlist: false
        };

        dispatch<any>(createListItem(newListItem));
      } else if (watchlist && lists.lists) {
        let watchlist_id: string | null = null;

        for (let i = 0; i < lists.lists.length; i++) {
          if (lists.lists[i].watchlist === true) {
            watchlist_id = lists.lists[i].id;
            break;
          }
        }

        if (watchlist_id) {
          const newListItem: NewListItem = {
            jwt_token: credentials.jwt_token,
            list_id: watchlist_id,
            list_name,
            movie_id: movieDetails.data.id.toString(),
            movie_title: movieDetails.data.title,
            poster_path: movieDetails.data.poster_path,
            watchlist: false
          };

          dispatch<any>(createListItem(newListItem));
        }
      }
    }
  }

  useEffect(() => {
    if (
      newListItem.status === "fulfilled" &&
      newListItem.success === true &&
      newListItem.list_name
    ) {
      toast({
        title: `${movieDetails.data.title} added to ${newListItem.list_name}`,
        description: "",
        status: "success",
        duration: 5000,
        isClosable: true
      });

      dispatch(resetNewListItem());
    } else if (
      newListItem.status === "fulfilled" &&
      newListItem.success === false &&
      newListItem.code === 409
    ) {
      toast({
        title: newListItem.message,
        description: "",
        status: "error",
        duration: 5000,
        isClosable: true
      });

      dispatch(resetNewListItem());
    } else if (newListItem.status === "fulfilled" && newListItem.code === 401) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetNewListItem());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [newListItem, movieDetails.data.title, toast, dispatch]);

  // NEW LIST
  // *******************************
  function onSubmitNewList(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (credentials.jwt_token) {
      const newList: NewList = {
        jwt_token: credentials.jwt_token,
        name: newListTitle
      };

      dispatch<any>(createList(newList));
    }
  }

  // this useEffect detects when a new list is created
  // and updates the list of lists in the redux store
  useEffect(() => {
    if (
      newList.status === "fulfilled" &&
      newList.success === true &&
      newList.list
    ) {
      setNewListTitle("");
      dispatch(addNewList({ newList: newList.list }));
      dispatch(resetNewList());
    } else if (newList.status === "fulfilled" && newList.code === 401) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetNewList());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [newList, dispatch, toast]);

  // JSX
  // ***********************************************************************************
  return (
    <div className={`${styles["wrapper"]} block`}>
      {credentials.jwt_token ? (
        <>
          <div className={styles["rating-review"]}>
            {ratingLike.data && (
              <span className={styles["stars"]}>
                <Stars
                  id="rating"
                  initialRating={ratingLike.data.rating}
                  setParentRating={updateRating}
                  interactive={true}
                  size="2xl"
                />
              </span>
            )}

            <Button
              colorScheme="teal"
              variant="outline"
              className={styles["review-button"]}
              onClick={onOpenReviewModal}
            >
              Leave Review
            </Button>
          </div>

          <div className={styles["like"]} onClick={toggleLike}>
            <div className={styles["heart"]}>
              <i
                className={`${styles[unlikedClass]} fa-regular fa-heart fa-2xl`}
              ></i>
              <i
                className={`${styles[likedClass]} fa-solid fa-heart fa-2xl`}
              ></i>
            </div>
            <span>Like</span>
          </div>

          <div className={styles["add-to-list"]}>
            <Button
              colorScheme="teal"
              variant="outline"
              className={styles["list-button"]}
              onClick={() => onClickList(null, "watchlist", true)}
            >
              Add to Watchlist
            </Button>

            <Button
              colorScheme="teal"
              variant="outline"
              className={styles["list-button"]}
              onClick={onOpenListsModal}
            >
              Add to other list
            </Button>
          </div>

          <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
            <ModalOverlay />

            {makeModal(modalType)}
          </Modal>
        </>
      ) : (
        <>Login to leave a review</>
      )}
    </div>
  );
}
