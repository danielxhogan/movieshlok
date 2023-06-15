import styles from "@/styles/MovieDetails/Ratings.module.css";
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

export default function Ratings() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);

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
        credentials.jwt_token
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
    {/* <h2 className={styles["section-title"]}>Ratings</h2> */}
    { credentials.jwt_token ? <>
      <Button
        colorScheme="teal" variant="outline"
        className={styles["trailer-button"]}
        onClick={onOpen}>
        Leave Review
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>{ makeModalHeader() }</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <FormLabel><i>What did you think?</i></FormLabel>
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
    </> : <>
      Login to leave a review
    </>
    
    }
  </div>
}
