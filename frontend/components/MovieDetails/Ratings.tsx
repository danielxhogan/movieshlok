import styles from "@/styles/MovieDetails/Ratings.module.css";
import Stars, { Rating } from "@/components/Stars";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import { postReview, NewReview } from "@/redux/actions/reviews";

import { useState } from "react";

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
  ModalFooter
} from "@chakra-ui/react";

const SHOWN = "shown";
const HIDDEN = "hidden";

export default function Ratings() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);

  const [ rating, setRating ] = useState(Rating.ZERO);
  const [ reviewRating, setReviewRating] = useState(Rating.ZERO);
  const [ newReviewText, setNewReviewText ] = useState("");

  const [ liked, setLiked ] = useState(false);
  const [ likedClass, setLikedClass ] = useState(HIDDEN);
  const [ unlikedClass, setUnlikedClass ] = useState(SHOWN);

  const { isOpen, onOpen, onClose } = useDisclosure();

  function makeModalHeader() {
    let year;
    if (movieDetails.data.release_date) {
      year = movieDetails.data.release_date.substring(0,4);
    }
    return <>
      {movieDetails.data.title} <span className={styles["year"]}>{year}</span>
    </>
  }

  function onClickCloseReviewModal() {
    onClose();

    if (newReviewText !== "" &&
        movieDetails.data &&
        movieDetails.data.id &&
        credentials.jwt_token &&
        credentials.username
      ) {
      const movieId = movieDetails.data.id.toString();
      const newReview: NewReview = {
        jwt_token: credentials.jwt_token,
        movieId,
        review: newReviewText,
        rating: reviewRating,
        liked
      };

      dispatch(postReview(newReview));
    }
  }

  function updateRating(newRating: Rating) {
    setRating(newRating);

  }

  function updateLike(likeStatus: boolean) {

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

  function onOpenModal() {
    onOpen();
    setReviewRating(rating);
  }

  return <div className={`${styles["wrapper"]} block`}>
    { credentials.jwt_token ? <>
      <div className={styles["rating-review"]}>
        <Stars
          id="rating"
          initialRating={rating}
          setParentRating={updateRating}
        />

        <Button
          colorScheme="teal" variant="outline"
          className={styles["trailer-button"]}
          onClick={onOpenModal}>
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
          className={styles["trailer-button"]}
          >
          Add to Watchlist
        </Button>

        <Button
          colorScheme="teal" variant="outline"
          className={styles["trailer-button"]}
          >
          Add to other list
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />

        <ModalContent className={styles["modal"]}>
          <ModalHeader>{ makeModalHeader() }</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <FormLabel className={styles["rating-label"]}>
                <i>What did you think?</i>
                <Stars
                  id="review"
                  initialRating={rating}
                  setParentRating={setReviewRating}
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
      </Modal>
    </> 
    :
    <>
      Login to leave a review
    </>
    }
  </div>
}
