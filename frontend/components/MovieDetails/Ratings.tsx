import styles from "@/styles/MovieDetails/Ratings.module.css";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import { postReview, NewReview } from "@/redux/actions/reviews";

import { useEffect, useState } from "react";

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

  const [ currentRating, setCurrentRating ] = useState(Rating.ZERO);
  const [ newRating, setNewRating ] = useState(Rating.ZERO);
  const [ newReviewText, setNewReviewText ] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  function onOpenModal() {
    onOpen();
    let starOne: HTMLElement | null = null;
    let starTwo: HTMLElement | null = null;
    let starThree: HTMLElement | null = null;
    let starFour: HTMLElement | null = null;
    let starFive: HTMLElement | null = null;

    let insideStarOne = false;
    let insideStarTwo = false;
    let insideStarThree = false;
    let insideStarFour = false;
    let insideStarFive = false;

    const starsInterval = setInterval(() => {
      starOne = document.getElementById("star-one");
      starTwo = document.getElementById("star-two");
      starThree = document.getElementById("star-three");
      starFour = document.getElementById("star-four");
      starFive = document.getElementById("star-five");

      if ( !starOne || !starTwo || !starThree || !starFour || !starFive ) { return; }

      clearInterval(starsInterval);
      console.log(starFive);
      // let currentRating = Rating.ZERO;
      // let newRating = Rating.ZERO;

      window.addEventListener("mousemove", event => {
        if (insideStarOne) {
          if (event.offsetX < 20) {
            setNewRating(Rating.POINT_FIVE);
          } else {
            setNewRating(Rating.ONE);
          }

        } else if (insideStarTwo) {
          if (event.offsetX < 20) {
            setNewRating(Rating.ONE_POINT_FIVE);
          } else {
            setNewRating(Rating.TWO);
          }

        } else if (insideStarThree) {
          if (event.offsetX < 20) {
            setNewRating(Rating.TWO_POINT_FIVE);
          } else {
            setNewRating(Rating.THREE);
          }

        } else if (insideStarFour) {
          if (event.offsetX < 20) {
            setNewRating(Rating.THREE_POINT_FIVE);
          } else {
            setNewRating(Rating.FOUR);
          }

        } else if (insideStarFive) {
          if (event.offsetX < 20) {
            setNewRating(Rating.FOUR_POINT_FIVE);
          } else {
            setNewRating(Rating.FIVE);
          }
        }
      });

    starOne.addEventListener("mouseover", (event) => {
      insideStarOne = true;
    });

    starOne.addEventListener("mouseout", (event) => {
      insideStarOne = false;
    });

    starTwo.addEventListener("mouseover", (event) => {
      insideStarTwo = true;
    });

    starTwo.addEventListener("mouseout", (event) => {
      insideStarTwo = false;
    });

    starThree.addEventListener("mouseover", (event) => {
      insideStarThree = true;
    });

    starThree.addEventListener("mouseout", (event) => {
      insideStarThree = false;
    });

    starFour.addEventListener("mouseover", (event) => {
      insideStarFour = true;
    });

    starFour.addEventListener("mouseout", (event) => {
      insideStarFour = false;
    });

    starFive.addEventListener("mouseover", (event) => {
      insideStarFive = true;
    });

    starFive.addEventListener("mouseout", (event) => {
      insideStarFive = false;
    });

    }, 100);  // end interval
  }

  function onClickStar() {
    setCurrentRating(newRating);
  }

  const halfStarStyle = {
    "--fa-secondary-color": "#c0c0c0"
  }

  function makeStars(rating: Rating) {
    switch (rating) {
      case Rating.ZERO:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.POINT_FIVE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} ${styles["half-star"]} fa-regular fa-star-half-stroke fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.ONE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.ONE_POINT_FIVE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} ${styles["half-star"]} fa-solid fa-star-half-stroke fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.TWO:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.TWO_POINT_FIVE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} ${styles["half-star"]} fa-regular fa-star-half-stroke fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.THREE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.THREE_POINT_FIVE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} ${styles["half-star"]} fa-solid fa-star-half-stroke fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.FOUR:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.FOUR_POINT_FIVE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} ${styles["half-star"]} fa-solid fa-star-half-stroke fa-2xl`}></i>
        </>
      case Rating.FIVE:
        return <>
          <i id="star-one" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-two" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-three" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-four" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
          <i id="star-five" onClick={onClickStar} onMouseOut={() => {}} className={`${styles["star"]} fa-solid fa-star fa-2xl`}></i>
        </>
    }
  }

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
        onClick={onOpenModal}>
        Leave Review
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />

        <ModalContent className={styles["modal"]}>
          <ModalHeader>{ makeModalHeader() }</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <FormLabel className={styles["rating-label"]}>
                <i>What did you think?</i>
                <span>
                  <span id="stars" className={styles["stars"]} onMouseOut={() => setNewRating(currentRating)}>
                    { makeStars(newRating) }
                  </span>
                </span>
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
