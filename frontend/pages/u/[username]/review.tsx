import styles from "@/styles/u/ReviewPage.module.css";
import Navbar from "@/components/Navbar"
import Searchbar from "@/components/Searchbar";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getMovieDetails } from "@/redux/actions/tmdb";
import { selectMovieDetails } from "@/redux/reducers/tmdb";

import { useRouter } from "next/router";
import { useEffect } from "react";


export default function ReviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const movieDetails = useAppSelector(selectMovieDetails);

  useEffect(() => {
    if (typeof router.query.movieId === "string") {
      dispatch(getMovieDetails(router.query.movieId));
    }
  }, [dispatch, router.query]);

  return <div className={styles["wrapper"]}>
    <Navbar />
    <div className={styles["content"]}>
      <Searchbar />
    </div>
    <Footer singlePage={true} />
  </div>
}

