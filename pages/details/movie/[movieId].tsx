import styles from "@/styles/MovieDetails/MovieDetails.module.css";
import Navbar from "@/components/Navbar"
import Hero from "@/components/MovieDetails/Hero";

import { GetServerSideProps } from "next";
import { wrapper } from "@/redux/store";
import {
  getMovieDetailsAction,
  getMovieVideosAction
} from "@/redux/actions/movieDetails";

export default function MovieDetailsPage() {
  return <>
    <Navbar />
    <div className={styles["movie-details"]}>
      <Hero />
    </div>
  </>
}

export const getServerSideProps: GetServerSideProps = 
wrapper.getServerSideProps(store => async ({ params }) => {

  if (params && params.movieId && typeof params.movieId === "string") {
    await store.dispatch<any>(getMovieDetailsAction(params.movieId));
    await store.dispatch<any>(getMovieVideosAction(params.movieId));
  }

  return {
    props: {}
  }
})