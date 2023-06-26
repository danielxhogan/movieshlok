import styles from "@/styles/u/ReviewDetailsPage.module.css";
import Navbar from "@/components/Navbar"
import Searchbar from "@/components/Searchbar";
import Stars from "@/components/Stars";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { getMovieDetails } from "@/redux/actions/tmdb";
import { selectMovieDetails } from "@/redux/reducers/tmdb";
import {
  getReviewDetails,
  postComment,
  GetReviewRequest,
  Comment,
  NewComment
} from "@/redux/actions/review";
import {
  selectReviewDetails,
  addNewComment,
  selectNewComment,
  resetNewComment
} from "@/redux/reducers/review";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Textarea, Button, Spinner } from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;


export default function ReviewDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const reviewDetails = useAppSelector(selectReviewDetails);
  const newComment = useAppSelector(selectNewComment);

  const [ commentText, setCommentText ] = useState("");

  useEffect(() => {
    if (typeof router.query.movieId === "string") {
      dispatch(getMovieDetails(router.query.movieId));
    }
    if (typeof router.query.id === "string") {
      const getReviewRequest: GetReviewRequest = {
        review_id: router.query.id,
        page: 1
      };

      dispatch(getReviewDetails(getReviewRequest));

    }
  }, [dispatch, router.query]);

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

    
    return <div className={styles["title-text"]}>
      <h1>
        <span className={styles["title"]}>
          { movieDetails.data.title },
        </span>
        <span className={styles["year"]}>
          { year }
        </span>
      </h1>
      <h3>
        directed by
        <span className={styles["director"]}> {director}</span>
      </h3>
    </div>
  }

  function makeDate(timestamp: number) {
    if (reviewDetails.data) {
      const date = new Date(timestamp * 1000);
      const month = date.getMonth();
      let monthText: string = "";

      switch (month) {
        case 1: monthText = "January"; break;
        case 2: monthText = "February"; break;
        case 3: monthText = "March"; break;
        case 4: monthText = "April"; break;
        case 5: monthText = "May"; break;
        case 6: monthText = "June"; break;
        case 7: monthText = "July"; break;
        case 8: monthText = "August"; break;
        case 9: monthText = "September"; break;
        case 10: monthText = "October"; break;
        case 11: monthText = "November"; break;
        case 12: monthText = "December"; break;
      }

      return <span>{`${monthText} ${date.getDate()}, ${date.getFullYear()}`}</span>
    }
  }

  function makeComment(comment: Comment) {
    return <div className="block">
      <div className={styles["comment-title"]}>
        <h3 className={styles["username"]}><strong>{comment.username}</strong></h3>
        <div><i>{ makeDate(comment.created_at) }</i></div>
      </div>

      <p>{comment.comment}</p>

    </div>
  }

  function onClickAddComment() {
    if (commentText !== "" &&
        credentials.jwt_token &&
        reviewDetails.data
      ) {
      const newComment: NewComment = {
        jwt_token: credentials.jwt_token,
        review_id: reviewDetails.data?.review.id,
        comment: commentText
      }

      dispatch(postComment(newComment));
    }
  }

  useEffect(() => {
    if (newComment.status === "fulfilled" &&
        newComment.success === true &&
        newComment.data &&
        credentials.username
    ) {
      const insertingNewComment: Comment = {
        id: newComment.data.id,
        username: credentials.username,
        review_id: newComment.data.review_id,
        comment: newComment.data.comment,
        created_at: newComment.data.created_at
      }

      dispatch(addNewComment(insertingNewComment));
      setCommentText("");

    } else if (newComment.code === 401) {
      dispatch(resetNewComment());

      dispatch(unsetCredentials());
      document.cookie = "username=";
      document.cookie = "jwt_token=";
    }
  }, [newComment, credentials.username, dispatch]);

  return <div className="wrapper">
    <Navbar />
    <div className="content">
      <Searchbar />

      { movieDetails.status === "fulfilled" ?
        <div className={styles["review-content"]}>
          <div className={styles["movie-poster-div"]}>
          { movieDetails.data.poster_path &&
            <Image
              src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
              className={styles["movie-poster"]}
              onClick={ () => { router.push(`/details/movie/${movieDetails.data.id}`) }}
              width={300}
              height={500}
              alt="backdrop">
            </Image>
          }
          </div>

          <div className={styles["review-details"]}>

            <div className={styles["title-section"]}>
              <div className={styles["username-section"]}>
                <h2>{ typeof router.query.username === "string" && router.query.username }</h2>
                {reviewDetails.data &&
                  <Stars
                    id="title-section"
                    initialRating={reviewDetails.data.review.rating}
                    setParentRating={()=>{}}
                    interactive={false}
                    size={"xl"}
                  />
                }
                <span className={styles["heart"]}>
                  { reviewDetails.data && reviewDetails.data.liked
                  ?
                    <i className={`fa-solid fa-heart fa-2xl`}></i>
                  :
                    <i className={`fa-regular fa-heart fa-2xl`}></i>
                  }
                </span>
              </div>

              { makeTitle() }
            </div>

            <div className={`${styles["review-section"]} block`}>
              { reviewDetails.status === "fulfilled" ?
              <>
                { reviewDetails.data &&
                <>
                  <p className={styles["date"]}>Watched on { makeDate(reviewDetails.data.review.created_at) }</p>
                  <p>{ reviewDetails.data.review.review }</p>
                </>
                }
              </>
              :
                <div className="spinner">
                  <Spinner size='xl' />
                </div>
              }
            </div>

            <div className={styles["comments-section"]}>
              <h2 className={styles["comments-title"]}>Comments</h2>
              { reviewDetails.status === "fulfilled" ?
                  reviewDetails.data && reviewDetails.data.comments.length > 0 ?
                  <>{reviewDetails.data.comments.map(comment => makeComment(comment)) }</>
                  :
                  <h2 className={styles["no-comments"]}>Be the first to comment</h2>
                  // <>no Comments</>
                :
                  <div className="spinner">
                    <Spinner size='xl' />
                  </div>
              }
            </div>

            <div className={`${styles["comment-section"]} block`}>
              { credentials.jwt_token ?
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
                    colorScheme="teal" variant="outline"
                    mr={3}
                    onClick={onClickAddComment}
                    >
                    Add Comment
                  </Button>
                </div>
              </>
              :
              <p>Login to leave a comment</p>
              }
            </div>

          </div>

        </div>
      :
        <div className="spinner">
          <Spinner size='xl' />
        </div>
      }

    </div>
    <Footer singlePage={true} />
  </div>
}
