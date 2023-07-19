import styles from "@/styles/MovieDetails/MovieData.module.css";
import { reformatTMDBDate } from "@/utils/date";

import { useAppSelector } from "@/redux/hooks";
import { selectMovieDetails, CastCrewMember } from "@/redux/reducers/tmdb";

import Link from "next/link";
import {
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Tooltip
} from "@chakra-ui/react";

enum CastCrewType {
  CAST,
  CREW
}

export default function MovieContent() {
  const movieDetails = useAppSelector(selectMovieDetails);

  const date = movieDetails.data.release_date
    ? reformatTMDBDate(movieDetails.data.release_date)
    : movieDetails.data.release_date;

  function makeCastCrew(
    castCrewMembers: CastCrewMember[],
    castCrewType: CastCrewType
  ) {
    let buttons = [];

    for (let i = 0; i < 20; i++) {
      if (castCrewMembers[i] === undefined) {
        break;
      }
      buttons.push(makeCastCrewButton(castCrewMembers[i], castCrewType));
    }

    return buttons;
  }

  function makeCastCrewButton(
    castCrewMember: CastCrewMember,
    castCrewType: CastCrewType
  ) {
    let role = "";

    switch (castCrewType) {
      case CastCrewType.CAST:
        if (castCrewMember.character) {
          role = castCrewMember.character;
        }
        break;

      case CastCrewType.CREW:
        if (castCrewMember.job) {
          role = castCrewMember.job;
        }
    }
    return (
      <span key={castCrewMember.credit_id}>
        {/* @ts-ignore */}
        <Tooltip label={role} placement="top">
          <Link
            href={`/details/person/${castCrewMember.id}?kf=${castCrewMember.known_for_department}`}
          >
            {/* @ts-ignore */}
            <Button
              colorScheme="teal"
              variant="outline"
              className={styles["cast-crew-button"]}
              // onClick={onOpen}
            >
              {castCrewMember && castCrewMember.name}
            </Button>
          </Link>
        </Tooltip>
      </span>
    );
  }

  return (
    <div className={`${styles["wrapper"]} block`}>
      {movieDetails.data.tagline && (
        <p className={styles["tagline"]}>
          &quot;{movieDetails.data.tagline}&quot;
        </p>
      )}

      <br />
      <Divider />
      <br />

      {movieDetails.data.overview && (
        <p className={styles["overview"]}>{movieDetails.data.overview}</p>
      )}
      <span>
        Released on <strong>{date}</strong>
      </span>
      <br />
      <br />

      <Tabs variant="enclosed">
        <TabList className={styles["tab-list"]}>
          <Tab>Cast</Tab>
          <Tab>Crew</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {movieDetails.data.credits &&
              movieDetails.data.credits.cast &&
              makeCastCrew(movieDetails.data.credits.cast, CastCrewType.CAST)}
          </TabPanel>
          <TabPanel>
            {movieDetails.data.credits &&
              movieDetails.data.credits.crew &&
              makeCastCrew(movieDetails.data.credits.crew, CastCrewType.CREW)}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
