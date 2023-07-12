import styles from "@/styles/u/ReviewDetailsPage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Stars from "@/components/Stars";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { getMovieDetails } from "@/redux/actions/tmdb";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import {
  getReviewDetails,
  postComment,
  GetReviewRequest,
  deleteReview,
  deleteComment,
  Comment,
  NewComment,
  DeleteReviewRequest,
  DeleteCommentRequest
} from "@/redux/actions/review";

import {
  selectReviewDetails,
  addNewComment,
  selectNewComment,
  resetNewComment,
  selectDeletedReview,
  resetDeletedReview,
  selectDeletedComment,
  resetDeletedComment,
  removeDeletedComment
} from "@/redux/reducers/review";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  Textarea,
  Button,
  Tooltip,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Spinner
} from "@chakra-ui/react";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;
const BACKEND_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

enum ModalType {
  DELETE_REVIEW,
  DELETE_COMMENT
}

export default function ReviewDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const reviewDetails = useAppSelector(selectReviewDetails);
  const newComment = useAppSelector(selectNewComment);
  const deletedReview = useAppSelector(selectDeletedReview);
  const deletedComment = useAppSelector(selectDeletedComment);

  const [commentText, setCommentText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [deletingCommentText, setDeletingCommentText] = useState("");
  const [modalType, setModalType] = useState(ModalType.DELETE_REVIEW);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const score = movieDetails.data.vote_average
    ? (movieDetails.data.vote_average / 2).toFixed(1)
    : movieDetails.data.vote_average;

  useEffect(() => {
    if (typeof router.query.movieId === "string") {
      dispatch<any>(getMovieDetails(router.query.movieId));
    }
    if (typeof router.query.id === "string") {
      const getReviewRequest: GetReviewRequest = {
        review_id: router.query.id,
        page: 1
      };

      dispatch<any>(getReviewDetails(getReviewRequest));
    }
  }, [dispatch, router.query]);

  // WEBSOCKET ON MESSAGE
  // ********************************************************************
  const onNewComment = useCallback(
    (newComment: string) => {
      let id: string | null = null;
      let username: string | null = null;
      let review_id: string | null = null;
      let comment: string | null = null;
      let created_at: number | null = null;
      const newCommentArray = newComment.split(";");

      newCommentArray.forEach(commentField => {
        const commentFieldArray = commentField.split("=");
        const key = commentFieldArray[0];
        const value = commentFieldArray[1];

        // prettier-ignore
        switch (key) {
          case "id": id = value; break;
          case "username": username = value; break;
          case "review_id": review_id = value; break;
          case "comment": comment = value; break;
          case "created_at": created_at = parseInt(value); break;
        }
      });

      if (id && username && review_id && comment && created_at) {
        const insertingNewComment: Comment = {
          id,
          username,
          review_id,
          comment,
          created_at
        };

        dispatch(addNewComment(insertingNewComment));
      }
    },
    [dispatch]
  );

  // WEBSOCKET SETUP
  // *************************************************************
  useEffect(() => {
    async function wsSetup() {
      const registerWsUrl = `${BACKEND_URL}/register-comments-ws`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      // add params
      const params = new URLSearchParams();

      // add credentials if logged in
      if (credentials.jwt_token) {
        params.append("jwt_token", credentials.jwt_token);
      }

      // add review id as topic
      const topic = router.query.id;
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

      const request = new Request(registerWsUrl, {
        headers,
        body: params,
        method: "POST"
      });
      try {
        const response = await fetch(request);
        const data = await response.json();

        if (!response.ok) {
          console.log(`ws-uuid: ${ws_uuid}, message: ${data.message}`);
          return;
        }

        const ws = new WebSocket(data.ws_url);
        ws.onopen = () => {
          console.log(`connected, uuid: ${data.uuid}`);
        };
        ws.onmessage = msg => {
          onNewComment(msg.data);
        };

        localStorage.setItem("ws-uuid", data.uuid);
      } catch (err) {
        return;
      }
    }

    wsSetup();

    // WEBSOCKET CLEANUP
    // *************************************************************
    return () => {
      const ws_uuid = localStorage.getItem("ws-uuid");
      if (ws_uuid) {
        const unregisterWsUrl = `${BACKEND_URL}/unregister-comments-ws`;

        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        const params = new URLSearchParams();
        console.log(`disconnecting, uuid: ${ws_uuid}`);
        params.append("uuid", ws_uuid);

        const request = new Request(unregisterWsUrl, {
          headers,
          body: params,
          method: "POST"
        });

        fetch(request);
        localStorage.setItem("ws-uuid", "");
      }
    };
  }, [credentials.jwt_token, onNewComment, router.query.id]);

  // MAKE NEW COMMENT
  // **********************************
  function onClickAddComment() {
    if (commentText !== "" && credentials.jwt_token && reviewDetails.data) {
      const newComment: NewComment = {
        jwt_token: credentials.jwt_token,
        review_id: reviewDetails.data?.review.id,
        comment: commentText
      };

      dispatch<any>(postComment(newComment));
    }
  }

  // DETECT NEW COMMENT
  // *********************************************
  useEffect(() => {
    if (
      newComment.status === "fulfilled" &&
      newComment.success === true &&
      newComment.data &&
      credentials.username &&
      credentials.jwt_token
    ) {
      // ADD TO REDUX
      const insertingNewComment: Comment = {
        id: newComment.data.id,
        username: credentials.username,
        review_id: newComment.data.review_id,
        comment: newComment.data.comment,
        created_at: newComment.data.created_at
      };

      dispatch(addNewComment(insertingNewComment));
      setCommentText("");

      // SEND WS MESSAGE
      const emitCommentUrl = `${BACKEND_URL}/emit-comment`;

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const params = new URLSearchParams();
      params.append("id", newComment.data.id);
      params.append("jwt_token", credentials.jwt_token);
      params.append("username", credentials.username);
      params.append("topic", newComment.data.review_id);
      params.append("comment", newComment.data.comment);
      params.append("created_at", newComment.data.created_at.toString());

      const request = new Request(emitCommentUrl, {
        headers,
        body: params,
        method: "POST"
      });
      fetch(request);
      dispatch(resetNewComment());

      // INVALID JWT TOKEN
    } else if (newComment.status === "fulfilled" && newComment.code === 401) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetNewComment());

      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [
    newComment,
    credentials.username,
    dispatch,
    credentials.jwt_token,
    toast
  ]);

  // MODAL OPEN - DELETE COMMENT OR REVIEW
  // **********************************************
  function onClickDeleteComment(comment: Comment) {
    setDeletingCommentId(comment.id);
    setDeletingCommentText(comment.comment);
    setModalType(ModalType.DELETE_COMMENT);
    onOpen();
  }

  function onCickDeleteReview() {
    setModalType(ModalType.DELETE_REVIEW);
    onOpen();
  }

  // MODAL RENDER
  // **********************************************
  function makeModal(type: ModalType) {
    switch (type) {
      case ModalType.DELETE_REVIEW:
        return (
          <>
            {/* @ts-ignore */}
            <ModalContent className={styles["modal"]}>
              <ModalHeader>Delete Review</ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                <i>
                  Are you sure you want to delete your review for{" "}
                  <strong>{movieDetails.data.title}</strong>
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
                  onClick={dispatchDeleteReview}
                >
                  Delete Review
                </Button>
              </ModalFooter>
            </ModalContent>
          </>
        );

      case ModalType.DELETE_COMMENT:
        return (
          <>
            <ModalContent className={styles["modal"]}>
              <ModalHeader>Delete Comment</ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                <i>Are you sure you want to delete the comment:</i>
                <br />
                <br />
                <p>{deletingCommentText}</p>
              </ModalBody>

              <ModalFooter>
                <Button
                  className={styles["submit-review"]}
                  colorScheme="red"
                  variant="outline"
                  mr={3}
                  onClick={dispatchDeleteComment}
                >
                  Delete Comment
                </Button>
              </ModalFooter>
            </ModalContent>
          </>
        );
    }
  }

  // DELETE REVIEW
  // *********************************
  function dispatchDeleteReview() {
    if (
      credentials.jwt_token &&
      typeof router.query.id === "string" &&
      typeof router.query.movieId === "string"
    ) {
      const deleteRequest: DeleteReviewRequest = {
        jwt_token: credentials.jwt_token,
        review_id: router.query.id,
        movie_id: router.query.movieId
      };

      dispatch<any>(deleteReview(deleteRequest));
    }
  }

  useEffect(() => {
    if (
      deletedReview.status === "fulfilled" &&
      deletedReview.success === true
    ) {
      router.back();
      dispatch(resetDeletedReview());

      // INVALID JWT TOKEN
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

      dispatch(resetDeletedComment());

      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [deletedReview, dispatch, router, toast]);

  // DELETE COMMENT
  // *********************************
  function dispatchDeleteComment() {
    onClose();

    if (credentials.jwt_token) {
      const deleteRequest: DeleteCommentRequest = {
        jwt_token: credentials.jwt_token,
        comment_id: deletingCommentId
      };

      dispatch<any>(deleteComment(deleteRequest));
    }
  }

  useEffect(() => {
    if (
      deletedComment.status === "fulfilled" &&
      deletedComment.success === true
    ) {
      dispatch(removeDeletedComment({ commentId: deletingCommentId }));
      dispatch(resetDeletedComment());

      // INVALID JWT TOKEN
    } else if (
      deletedComment.status === "fulfilled" &&
      deletedComment.code === 401
    ) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetDeletedComment());

      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [deletedComment, deletingCommentId, dispatch, toast]);

  // RENDERING FUNCTIONS
  // *********************************************************
  function makeTitle() {
    let year: string = "";
    let directors: string[] = [];
    let director: string = "";

    if (movieDetails.data.release_date) {
      year = movieDetails.data.release_date.substring(0, 4);
    }

    movieDetails.data.credits?.crew?.forEach(crewMember => {
      if (crewMember.job === "Director") {
        crewMember.name && directors.push(crewMember.name);
      }
    });

    if (directors.length > 0) {
      director = directors[0];
    }

    return (
      <div className={styles["title-text"]}>
        <Link href={`/details/movie/${movieDetails.data.id}`}>
          <h1>
            <span className={styles["title"]}>{movieDetails.data.title},</span>
            <span className={styles["year"]}>{year}</span>
          </h1>
        </Link>
        <h3>
          directed by
          <span className={styles["director"]}> {director}</span>
        </h3>
        <span className={styles["small-score"]}>
          <span className={styles["score-number"]}>{score}</span> / 5
        </span>
      </div>
    );
  }

  function makeDate(timestamp: number) {
    if (reviewDetails.data) {
      const date = new Date(timestamp * 1000);
      const month = date.getMonth();
      let monthText: string = "";

      // prettier-ignore
      switch (month) {
        case 0:monthText = "January"; break;
        case 1:monthText = "February"; break;
        case 2:monthText = "March"; break;
        case 3:monthText = "April"; break;
        case 4:monthText = "May"; break;
        case 5:monthText = "June"; break;
        case 6:monthText = "July"; break;
        case 7:monthText = "August"; break;
        case 8:monthText = "September"; break;
        case 9:monthText = "October"; break;
        case 10:monthText = "November"; break;
        case 11:monthText = "December"; break;
      }

      return (
        <span>{`${monthText} ${date.getDate()}, ${date.getFullYear()}`}</span>
      );
    }
  }

  function makeComment(comment: Comment, idx: number) {
    return (
      <div className="block" key={comment.id} id={comment.id}>
        <div className={styles["comment-title"]}>
          <Link href={`/u/${comment.username}/profile`}>
            <h3 className={styles["username"]}>
              <strong>{comment.username}</strong>
            </h3>
          </Link>

          <div className={styles["comment-title-right"]}>
            <i>{makeDate(comment.created_at)}</i>

            {credentials.username === comment.username && (
              <Tooltip label={"delete comment"} placement="top">
                <i
                  className={`${styles["delete-comment"]} fa-solid fa-trash fa-md`}
                  onClick={() => onClickDeleteComment(comment)}
                />
              </Tooltip>
            )}
          </div>
        </div>

        <p>{comment.comment}</p>
      </div>
    );
  }

  // JSX
  // *************************************************************************
  return (
    <div className="wrapper">
      <Navbar />
      <div className="content">
        <ProfileNav />

        {movieDetails.status === "fulfilled" ? (
          <div className={styles["review-content"]}>
            <div className={styles["movie-poster-div"]}>
              <div className={styles["sticky-div"]}>
                {movieDetails.data.poster_path && (
                  <Image
                    src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
                    className={styles["movie-poster"]}
                    onClick={() => {
                      router.push(`/details/movie/${movieDetails.data.id}`);
                    }}
                    width={300}
                    height={500}
                    alt="backdrop"
                  ></Image>
                )}

                <span className={styles["score"]}>
                  <span className={styles["score-number"]}>{score}</span> / 5
                </span>
              </div>
            </div>

            <div className={styles["review-details"]}>
              <div className={styles["title-section"]}>
                {credentials.username === router.query.username && (
                  <Tooltip label={"delete review"} placement="top">
                    <i
                      className={`${styles["delete-review"]} fa-solid fa-trash fa-md`}
                      onClick={onCickDeleteReview}
                    />
                  </Tooltip>
                )}

                <div className={styles["title-movie-poster"]}>
                  {movieDetails.data.poster_path && (
                    <Image
                      src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
                      className={styles["movie-poster"]}
                      onClick={() => {
                        router.push(`/details/movie/${movieDetails.data.id}`);
                      }}
                      width={300}
                      height={500}
                      alt="backdrop"
                    ></Image>
                  )}
                </div>

                <div className={styles["user-title-data"]}>
                  <div className={styles["username-section"]}>
                    <Link href={`/u/${router.query.username}/profile`}>
                      <h2>{router.query.username}</h2>
                    </Link>

                    <div className={styles["rating-heart"]}>
                      {reviewDetails.data && (
                        <Stars
                          id="title-section"
                          initialRating={reviewDetails.data.review.rating}
                          setParentRating={() => {}}
                          interactive={false}
                          size={"xl"}
                        />
                      )}

                      <span className={styles["heart"]}>
                        {reviewDetails.data && reviewDetails.data.liked ? (
                          <i className={`fa-solid fa-heart fa-2xl`}></i>
                        ) : (
                          <i className={`fa-regular fa-heart fa-2xl`}></i>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={styles["user-title-movie-poster"]}>
                    {movieDetails.data.poster_path && (
                      <Image
                        src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
                        className={styles["movie-poster"]}
                        onClick={() => {
                          router.push(`/details/movie/${movieDetails.data.id}`);
                        }}
                        width={300}
                        height={500}
                        alt="backdrop"
                      ></Image>
                    )}
                  </div>

                  {makeTitle()}
                </div>
              </div>

              <div className={`${styles["review-section"]} block`}>
                {reviewDetails.status === "fulfilled" ? (
                  <>
                    {reviewDetails.data && (
                      <>
                        <p className={styles["date"]}>
                          Watched on{" "}
                          {makeDate(reviewDetails.data.review.created_at)}
                        </p>
                        <p>{reviewDetails.data.review.review}</p>
                      </>
                    )}
                  </>
                ) : (
                  <div className="spinner">
                    <Spinner size="xl" />
                  </div>
                )}
              </div>

              <div className={styles["comments-section"]}>
                <h2 className={styles["comments-title"]}>Comments</h2>

                {reviewDetails.status === "fulfilled" ? (
                  reviewDetails.data &&
                  reviewDetails.data.comments.length > 0 ? (
                    <>
                      {reviewDetails.data.comments.map((comment, idx) =>
                        makeComment(comment, idx)
                      )}
                    </>
                  ) : (
                    <h2 className={styles["no-comments"]}>
                      Be the first to comment
                    </h2>
                  )
                ) : (
                  <div className="spinner">
                    <Spinner size="xl" />
                  </div>
                )}
              </div>

              <div className={`${styles["comment-section"]} block`}>
                {credentials.jwt_token ? (
                  <>
                    Leave a comment
                    <Textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      rows={5}
                    />
                    <div className={styles["submit-comment"]}>
                      <Button
                        className={styles["submit-comment-button"]}
                        colorScheme="teal"
                        variant="outline"
                        mr={3}
                        onClick={onClickAddComment}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </>
                ) : (
                  <p>Login to leave a comment</p>
                )}
              </div>
            </div>

            <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
              <ModalOverlay />
              {makeModal(modalType)}
            </Modal>
          </div>
        ) : (
          <div className="spinner">
            <Spinner size="xl" />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
