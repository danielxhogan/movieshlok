import styles from "@/styles/u/RatingsPage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Rating from "@/components/Rating";
import Pagination, { UseCases } from "@/components/Pagination";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import {
  getRatings,
  deleteRating,
  GetRatingsRequest,
  RatingReview,
  DeleteRatingRequest
} from "@/redux/actions/reviews";

import {
  selectRatings,
  selectDeletedRating,
  removeRatingByRatingId,
  removeRatingByReviewId,
  resetDeletedRating
} from "@/redux/reducers/reviews";

import { deleteReview, DeleteReviewRequest } from "@/redux/actions/review";
import {
  selectDeletedReview,
  resetDeletedReview
} from "@/redux/reducers/review";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  Button,
  ModalCloseButton,
  ModalFooter,
  Spinner
} from "@chakra-ui/react";

export default function ReviewsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const ratings = useAppSelector(selectRatings);
  const deletedRating = useAppSelector(selectDeletedRating);
  const deletedReview = useAppSelector(selectDeletedReview);

  const [deletingRating, setDeletingRating] = useState<RatingReview>();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const username = router.query.username;
    const page = router.query.page;

    if (typeof username === "string" && typeof page === "string") {
      const getRatingsRequest: GetRatingsRequest = {
        username,
        page: 1
      };

      dispatch<any>(getRatings(getRatingsRequest));
    }
  }, [dispatch, router.query]);

  function onClickDeleteRating(rating: RatingReview) {
    setDeletingRating(rating);
    onOpen();
  }

  function dispatchDeleteRating() {
    if (credentials.jwt_token && deletingRating) {
      if (deletingRating.review_id) {
        const deleteRequest: DeleteReviewRequest = {
          jwt_token: credentials.jwt_token,
          review_id: deletingRating.review_id,
          movie_id: deletingRating.movie_id
        };

        dispatch<any>(deleteReview(deleteRequest));
      } else if (deletingRating.rating_id) {
        const deleteRequest: DeleteRatingRequest = {
          jwt_token: credentials.jwt_token,
          rating_id: deletingRating.rating_id
        };

        dispatch<any>(deleteRating(deleteRequest));
      }
    }
  }

  useEffect(() => {
    onClose();

    if (
      deletedReview.status === "fulfilled" &&
      deletedReview.success === true &&
      deletedReview.review
    ) {
      dispatch(removeRatingByReviewId({ review_id: deletedReview.review.id }));
      dispatch(resetDeletedReview());
    } else if (
      deletedReview.status === "fulfilled" &&
      deletedReview.code === 401
    ) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetDeletedReview());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [deletedReview, dispatch, onClose, toast]);

  useEffect(() => {
    onClose();

    if (
      deletedRating.status === "fulfilled" &&
      deletedRating.success === true &&
      deletedRating.rating
    ) {
      dispatch(removeRatingByRatingId({ rating_id: deletedRating.rating.id }));
      dispatch(resetDeletedRating());
    } else if (
      deletedRating.status === "fulfilled" &&
      deletedRating.code === 401
    ) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetDeletedRating());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [deletedRating, dispatch, onClose, toast]);

  let currentMonth = 13;

  function makeRating(rating: RatingReview, idx: number) {
    const date = new Date(rating.timestamp * 1000);
    const month = date.getMonth();
    let monthText: string = "";
    let monthHeading: JSX.Element | null;

    if (month < currentMonth) {
      currentMonth = month;

      // prettier-ignore
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

      monthHeading = (
        <h2 className={styles["month-heading"]}>
          <span className={styles["month"]}>{monthText}</span>{" "}
          {date.getFullYear()}
        </h2>
      );
    } else {
      monthHeading = null;
    }

    let canDelete = false;
    if (credentials.username === router.query.username) {
      canDelete = true;
    }

    const ratingElement = (
      <Rating
        key={idx}
        id={idx}
        rating={rating}
        date={date.getDate()}
        onClickDeleteRating={canDelete ? onClickDeleteRating : null}
      />
    );

    if (monthHeading) {
      return (
        <>
          {monthHeading}
          {ratingElement}
        </>
      );
    } else {
      return ratingElement;
    }
  }

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          Ratings
        </h1>

        {ratings.status === "fulfilled" ? (
          <>
            {ratings.ratings?.map((rating, idx) => {
              return <>{rating && <>{makeRating(rating, idx)}</>}</>;
            })}

            {ratings.ratings && ratings.ratings[0] === null && (
              <div className={styles["no-ratings"]}>
                No ratings from {router.query.username} yet
              </div>
            )}

            {ratings.ratings &&
              ratings.total_pages &&
              ratings.total_pages > 1 &&
              typeof router.query.username === "string" && (
                <Pagination
                  useCase={UseCases.RATINGS}
                  currentPage={ratings.page}
                  totalPages={ratings.total_pages}
                  username={router.query.username}
                />
              )}

            <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
              <ModalOverlay />
              {/* @ts-ignore */}
              <ModalContent className={styles["modal"]}>
                <ModalHeader>Delete Rating</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                  <i>
                    Are you sure you want to delete your rating for
                    <strong> {deletingRating?.movie_title}</strong>
                  </i>
                  <br />
                  <br />
                </ModalBody>

                <ModalFooter>
                  <Button
                    className={styles["submit-review"]}
                    colorScheme="red"
                    variant="outline"
                    mr={3}
                    onClick={dispatchDeleteRating}
                  >
                    Delete Rating
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : (
          <>
            <div className="spinner">
              {/* @ts-ignore */}
              <Spinner size="xl" />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
