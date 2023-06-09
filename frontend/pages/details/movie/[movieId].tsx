import styles from "@/styles/MovieDetails/MovieDetailsPage.module.css";
import Navbar from "@/components/Navbar";
import Hero from "@/components/MovieDetails/Hero";
import MovieData from "@/components/MovieDetails/MovieData";
import Ratings from "@/components/MovieDetails/Ratings";
import Reviews from "@/components/MovieDetails/Reviews";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { getMovieDetails } from "@/redux/actions/tmdb";
import {
  getReviews,
  getRatingLike,
  UserMovie,
  GetReviewsRequest
} from "@/redux/actions/reviews";
import { getLists, GetListsRequest } from "@/redux/actions/lists";
import { selectCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Spinner } from "@chakra-ui/react";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

// import { GetServerSideProps } from "next";
// import { wrapper } from "@/redux/store";

export default function MovieDetailsPage() {
  // const dispatch = useAppDispatch();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const router = useRouter();

  const score = movieDetails.data.vote_average
    ? (movieDetails.data.vote_average / 2).toFixed(1)
    : movieDetails.data.vote_average;

  useEffect(() => {
    if (typeof router.query.movieId === "string") {
      const getReviewsRequest: GetReviewsRequest = {
        movie_id: router.query.movieId,
        page: 1
      };

      dispatch<any>(getMovieDetails(router.query.movieId));
      dispatch<any>(getReviews(getReviewsRequest));
    }
  }, [dispatch, router.query]);

  useEffect(() => {
    if (
      credentials.jwt_token &&
      credentials.username &&
      typeof router.query.movieId === "string"
    ) {
      const userMovie: UserMovie = {
        jwt_token: credentials.jwt_token,
        movie_id: router.query.movieId
      };

      const getListsRequest: GetListsRequest = {
        username: credentials.username
      };

      dispatch<any>(getRatingLike(userMovie));
      dispatch<any>(getLists(getListsRequest));
    }
  });

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        {movieDetails.status === "fulfilled" ? (
          <>
            <Hero />

            <div className={styles["sub-hero"]}>
              <div className={styles["movie-poster-div"]}>
                <div className={styles["sticky-div"]}>
                  {movieDetails.data.poster_path && (
                    <Image
                      src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
                      className={styles["movie-poster"]}
                      width={300}
                      height={500}
                      alt="backdrop"
                    ></Image>
                  )}
                  <span className={styles["score"]}>
                    <span className={styles["score-number"]}>{score}</span> / 5
                  </span>
                  <br />
                </div>
              </div>

              <div className={styles["movie-content"]}>
                <MovieData />
                <Ratings />
                <Reviews />
              </div>
            </div>
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

// export const getServerSideProps: GetServerSideProps =
// wrapper.getServerSideProps(store => async ({ params }) => {

//   if (params && params.movieId && typeof params.movieId === "string") {
//     await store.dispatch<any>(getMovieDetailsAction(params.movieId));
//     await store.dispatch<any>(getMovieVideosAction(params.movieId));
//   }

//   return {
//     props: {}
//   }
// })
