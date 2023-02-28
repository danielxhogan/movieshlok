import styles from "@/styles/MovieDetails/Hero.module.css";

import { useState } from "react";

import { Button } from "@chakra-ui/react";

import Image from "next/image";
import { useSelector } from "react-redux";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

const SHOWN = "shown";
const HIDDEN = "hidden";

export default function Hero() {
  const movieDetails = useSelector((state: any) => state.movieDetails);
  const videos = useSelector((state: any) => state.movieVideos.results);

  const [ videoState, setVideoState ] = useState(HIDDEN);
  const [ trailerButtonText, setTrailerButtonText ] = useState("Watch Trailer");

  let trailerPath = null;
  let trailerSite = null;

  for (let i=0; i<videos.length; i++) {
    if (videos[i].type === "Trailer" && videos[i].iso_639_1 === "en") {
      trailerPath = videos[i].key;
      trailerSite = videos[i].site;
      break;
    }
  }

  function toggleVideoState() {
    switch (videoState) {
      case HIDDEN: setVideoState(SHOWN); setTrailerButtonText("Hide Trailer"); break;
      case SHOWN: setVideoState(HIDDEN); setTrailerButtonText("Watch Trailer"); break;
    }
  }

  return <>
    { trailerPath && <Button
      colorScheme='teal' variant='outline'
      className={styles["trailer-button"]}
      onClick={toggleVideoState}>
        { trailerButtonText }
      </Button>
    }

    <div className={styles["trailer-backdrop"]}>
      <div className={`${styles["trailer-container"]} ${styles[videoState]}`}>
        { trailerPath && trailerSite === "YouTube" &&
          <iframe
            className={styles["trailer"]}
            src={`https://www.youtube.com/embed/${trailerPath}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen>
          </iframe>
        }
      </div>

      {movieDetails.backdrop_path &&
        <Image
          src={`${TMDB_IMAGE_URL}/w780${movieDetails.backdrop_path}`}
          className={styles["backdrop"]}
          width={780}
          height={300}
          alt="backdrop">
        </Image>
      }
    </div>
    <div className={styles["movie-title"]}>
        <h1>{ movieDetails.title }</h1>
    </div>
  </>
}