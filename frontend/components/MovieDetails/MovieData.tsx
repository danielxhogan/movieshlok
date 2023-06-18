import styles from "@/styles/MovieDetails/MovieData.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectMovieDetails } from "@/redux/reducers/tmdb";

import { Divider } from "@chakra-ui/react";

export default function MovieContent() {
  const movieDetails = useAppSelector(selectMovieDetails);

  return <div className={`${styles["wrapper"]} block`}>
    { movieDetails.data.tagline &&
      <p className={styles["tagline"]}>"{ movieDetails.data.tagline }"</p>
    }

    <br />
    <Divider />
    <br />

    { movieDetails.data.overview &&
      <p className={styles["overview"]}>{ movieDetails.data.overview }</p>
    }

    </div>
}
