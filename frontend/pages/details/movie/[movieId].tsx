import styles from "@/styles/MovieDetails/MovieDetailsPage.module.css";
import Navbar from "@/components/Navbar"
import Searchbar from "@/components/Searchbar";
import Hero from "@/components/MovieDetails/Hero";
import MovieData from "@/components/MovieDetails/MovieData";
import Ratings from "@/components/MovieDetails/Ratings";
import Reviews from "@/components/MovieDetails/Reviews";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getMovieDetails } from "@/redux/actions/tmdb";
import { getReviews, getRatingLike, UserMovie } from "@/redux/actions/reviews";
import { selectCredentials } from "@/redux/reducers/auth";
import { selectMovieDetails } from "@/redux/reducers/tmdb";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Spinner } from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;

// import { GetServerSideProps } from "next";
// import { wrapper } from "@/redux/store";


export default function MovieDetailsPage() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const movieDetails = useAppSelector(selectMovieDetails);
  const router = useRouter();

  useEffect(() => {
    if (router.query.movieId && typeof router.query.movieId === "string") {
      dispatch(getMovieDetails(router.query.movieId));
      dispatch(getReviews(router.query.movieId));
    }
  }, [dispatch, router.query])

  useEffect(() => {
    if (credentials.jwt_token && router.query.movieId && typeof router.query.movieId === "string") {
      const userMovie: UserMovie = {
        jwt_token: credentials.jwt_token,
        movie_id: router.query.movieId
      };

      dispatch(getRatingLike(userMovie));
    }
  })

  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["movie-details"]}>
      <Searchbar />

      { movieDetails.status === "fulfilled" ? <>
        <Hero />

        <div className={styles["sub-hero"]}>
          <div className={styles["movie-poster-div"]}>
          { movieDetails.data.poster_path &&
            <Image
              src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
              className={styles["movie-poster"]}
              width={300}
              height={500}
              alt="backdrop">
            </Image>
          }
          </div>
          <div className={styles["movie-content"]}>
            <MovieData />
            <Ratings />
            <Reviews />
          </div>
        </div>
      </> : <>
        <div className={styles["spinner"]}>
          <Spinner size='xl' />
        </div>
      </>}


    </div>
    { movieDetails.status === "fulfilled" && <Footer singlePage={false}/> }
  </div>
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