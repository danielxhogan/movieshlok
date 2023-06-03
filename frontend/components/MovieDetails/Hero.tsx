import styles from "@/styles/MovieDetails/Hero.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectMovieDetails } from "@/redux/reducers/tmdb";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Spinner
} from "@chakra-ui/react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;

export default function Hero() {
  const movieDetails = useAppSelector(selectMovieDetails);
  const [ loading, setLoading ] = useState(true);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();


  // if there are movieDetails from a previous search result, the movieId
  // in the redux store will not match the movieId in the query param
  useEffect(() => {
    if (router.query.movieId !== movieDetails.message) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [movieDetails, router.query])

  let trailerPath = null;
  let trailerSite = null;

  if (movieDetails.data.videos && movieDetails.data.videos.results) {
    const videos = movieDetails.data.videos.results;

    for (let i=0; i<movieDetails.data.videos.results.length; i++) {
      if (videos[i].type === "Trailer" && videos[i].site === "YouTube" && videos[i].iso_639_1 === "en") {
        trailerPath = videos[i].key;
        trailerSite = videos[i].site;
        break;
      }
    }
  }

  return <>
    { loading ?
    // <h1>Loading...</h1>
    <div className={styles["spinner"]}>
      <Spinner size='xl' />
    </div>
    :
    <div className={styles["wrapper"]}>
    { trailerPath && trailerSite === "YouTube" && <><Button
      colorScheme='teal' variant='outline'
      className={styles["trailer-button"]}
      onClick={onOpen}>
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
              allowFullScreen>
            </iframe>
        </ModalBody>
      </ModalContent>
    </Modal></>
    }

    {movieDetails.data.backdrop_path &&
      <Image
        src={`${TMDB_IMAGE_URL}/w780${movieDetails.data.backdrop_path}`}
        className={styles["backdrop"]}
        width={780}
        height={300}
        alt="backdrop">
      </Image>
    }
    <div className={styles["movie-title"]}>
        <h1>{ movieDetails.data.title }</h1>
    </div>
    </div>}
  </>
}