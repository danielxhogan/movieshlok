import styles from "@/styles/MovieDetails/Hero.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectMovieDetails, MovieImage } from "@/redux/reducers/tmdb";

import Image from "next/image";
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton
} from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;

export default function Hero() {
  const movieDetails = useAppSelector(selectMovieDetails);

  const { isOpen, onOpen, onClose } = useDisclosure();

  let trailerPath = null;
  let trailerSite = null;

  if (movieDetails.data.videos && movieDetails.data.videos.results) {
    const videos = movieDetails.data.videos.results;

    for (let i = 0; i < movieDetails.data.videos.results.length; i++) {
      if (
        videos[i].type === "Trailer" &&
        videos[i].site === "YouTube" &&
        videos[i].iso_639_1 === "en"
      ) {
        trailerPath = videos[i].key;
        trailerSite = videos[i].site;
        break;
      }
    }
  }

  function makeTitle() {
    let year: string = "";
    let directors: string[] = [];
    let director: string = "";
    const score = movieDetails.data.vote_average
      ? (movieDetails.data.vote_average / 2).toFixed(1)
      : movieDetails.data.vote_average;

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
        <h1>
          <span className={styles["title"]}>{movieDetails.data.title},</span>
          <span className={styles["year"]}>{year}</span>
        </h1>
        <h2>
          directed by
          <span className={styles["director"]}> {director}</span>
        </h2>
        <span className={styles["score"]}>
          <span className={styles["score-number"]}>{score}</span> / 5
        </span>
      </div>
    );
  }

  return (
    <div className={styles["wrapper"]}>
      {trailerPath && trailerSite === "YouTube" && (
        <>
          {/* @ts-ignore */}
          <Button
            colorScheme="teal"
            variant="outline"
            className={styles["trailer-button"]}
            onClick={onOpen}
          >
            Watch Trailer
          </Button>

          <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <iframe
                  className={styles["trailer"]}
                  src={`https://www.youtube.com/embed/${trailerPath}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}

      {movieDetails.data.backdrop_path && (
        <Image
          src={`${TMDB_IMAGE_URL}/w780${movieDetails.data.backdrop_path}`}
          className={styles["backdrop"]}
          width={780}
          height={300}
          alt="backdrop"
        ></Image>
      )}

      <div className={styles["title-section"]}>
        <div className={styles["movie-poster-div"]}>
          {movieDetails.data.poster_path && (
            <Image
              src={`${TMDB_IMAGE_URL}/w342${movieDetails.data.poster_path}`}
              className={styles["movie-poster"]}
              width={200}
              height={500}
              alt="backdrop"
            ></Image>
          )}
        </div>

        {makeTitle()}
      </div>
    </div>
  );
}
