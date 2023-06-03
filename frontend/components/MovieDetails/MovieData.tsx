import styles from "@/styles/MovieDetails/MovieData.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectMovieDetails } from "@/redux/reducers/tmdb";

export default function MovieContent() {
  const movieDetails = useAppSelector(selectMovieDetails);

  return <div className={styles["wrapper"]}>
    { movieDetails.data.title &&
      <h1>{movieDetails.data.title}</h1>
    }
    { movieDetails.data.overview &&
      <p>{movieDetails.data.overview}</p>
    }
  </div>
}
