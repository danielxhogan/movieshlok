import styles from "@/styles/MovieDetails/Ratings.module.css";
import Stars from "@/components/Stars";
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

enum Rating {
  ZERO,
  POINT_FIVE,
  ONE,
  ONE_POINT_FIVE,
  TWO,
  TWO_POINT_FIVE,
  THREE,
  THREE_POINT_FIVE,
  FOUR,
  FOUR_POINT_FIVE,
  FIVE
}

export default function Ratings() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);

  const [ rating, setRating ] = useState(Rating.ZERO);
  const [ reviewRating, setReviewRating] = useState(Rating.ZERO);

  const [ currentRating, setCurrentRating ] = useState(Rating.ZERO);
  const [ newRating, setNewRating ] = useState(currentRating);
  const [ newReviewText, setNewReviewText ] = useState("");

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
        movieId,
        review: newReviewText,
        jwt_token: credentials.jwt_token
      };

      dispatch(postReview(newReview));
    }
  }


  return <div className={`${styles["wrapper"]} block`}>
    { credentials.jwt_token ? <>
      <Button
        colorScheme="teal" variant="outline"
        className={styles["trailer-button"]}
        onClick={onOpen}>
        Leave Review
      </Button>

      <Stars
        id="rating"
        initialCurrentRating={currentRating}
        setParentCurrentRating={setCurrentRating}
      />


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
                  initialCurrentRating={currentRating}
                  setParentCurrentRating={setCurrentRating}
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
            <Button
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
