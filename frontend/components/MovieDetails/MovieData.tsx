import styles from "@/styles/MovieDetails/MovieData.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectMovieDetails, CastCrewMember } from "@/redux/reducers/tmdb";

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

  function reformatDate(date: string) {
    const year = date.substring(0, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    let monthText;

    switch (month) {
      case "01": monthText = "January"; break;
      case "02": monthText = "February"; break;
      case "03": monthText = "March"; break;
      case "04": monthText = "April"; break;
      case "05": monthText = "May"; break;
      case "06": monthText = "June"; break;
      case "07": monthText = "July"; break;
      case "08": monthText = "August"; break;
      case "09": monthText = "September"; break;
      case "10": monthText = "October"; break;
      case "11": monthText = "November"; break;
      case "12": monthText = "December"; break;
    }

    return `${monthText} ${day}, ${year}`;
  }

  const date = movieDetails.data.release_date ? reformatDate(movieDetails.data.release_date) : movieDetails.data.release_date;

  function makeCastCrew(castCrewMembers: [CastCrewMember], castCrewType: CastCrewType) {
    let buttons = [];

    for (let i=0; i<20; i++) {
      if (castCrewMembers[i] === undefined) { break; }
      buttons.push(makeCastCrewButton(castCrewMembers[i], castCrewType));
    }

    return buttons;
  }

  function makeCastCrewButton(castCrewMember: CastCrewMember, castCrewType: CastCrewType) {
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
    return <span key={castCrewMember.credit_id}>
      <Tooltip label={role} placement="top">
        <Button
          colorScheme='teal' variant='outline'
          className={styles["cast-crew-button"]}
          // onClick={onOpen}
          >
          { castCrewMember && castCrewMember.name }
        </Button>

      </Tooltip>
    </span>
  }


  return <div className={`${styles["wrapper"]} block`}>

    { movieDetails.data.tagline &&
      <p className={styles["tagline"]}>&quot;{ movieDetails.data.tagline }&quot;</p>
    }

    <br />
    <Divider />
    <br />

    { movieDetails.data.overview &&
      <p className={styles["overview"]}>{ movieDetails.data.overview }</p>
    }
    <span>Released on <strong>{ date }</strong></span>
    <br /><br />

    <Tabs variant='enclosed'>
      <TabList className={styles["tab-list"]}>
        <Tab>Cast</Tab>
        <Tab>Crew</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          { movieDetails.data.credits && movieDetails.data.credits.cast &&
            makeCastCrew(movieDetails.data.credits.cast, CastCrewType.CAST) }
        </TabPanel>
        <TabPanel>
          { movieDetails.data.credits && movieDetails.data.credits.crew &&
            makeCastCrew(movieDetails.data.credits.crew, CastCrewType.CREW) }
        </TabPanel>
      </TabPanels>
    </Tabs>

  </div>
}
