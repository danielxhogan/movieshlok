import styles from "@/styles/MovieDetails/MovieDetails.module.css";
import Navbar from "@/components/Navbar"
import Hero from "@/components/MovieDetails/Hero";

import { useAppDispatch } from "@/redux/hooks";
import { getMovieDetails } from "@/redux/actions/tmdb";
// import { selectMovieDetails } from "@/redux/reducers/tmdb";

import { useEffect } from "react";
import { useRouter } from "next/router";

// import { GetServerSideProps } from "next";
// import { wrapper } from "@/redux/store";
// import {
//   getMovieDetailsAction,
//   getMovieVideosAction
// } from "@/redux/actions/movieDetails";

export default function MovieDetailsPage() {
  const dispatch = useAppDispatch();
  // const movieDetails = useAppSelector(selectMovieDetails);
  const router = useRouter();


  useEffect(() => {
    if (router.query.movieId && typeof router.query.movieId === "string") {
      // dispatch(clearResults());
      dispatch(getMovieDetails(router.query.movieId));
    }

  }, [dispatch, router.query])

  return <div className={styles["wrapper"]}>
    <Navbar />
    <div className={styles["movie-details"]}>
      <Hero />
    </div>
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