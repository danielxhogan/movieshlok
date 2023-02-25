/* eslint-disable react/no-children-prop */
import styles from "@/styles/SearchPage.module.css";
import Navbar from "@/components/Navbar"

import { FormEvent, useState } from "react";
import { InputGroup, InputLeftElement, Input, Divider, Button } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

import axios from "axios";
import { GetServerSideProps } from "next";


enum FilterResults {
  ALL,
  MOVIES,
  CAST_AND_CREW
}

type Props = {
  previousQuery?: string;
  previousFilter?: string;
  searchResults?: {
    results: [
      {
        title: string;
        media_type: string;
      }
    ]
  };
}

export default function SearchPage(props: Props) {
  if (props.searchResults && props.searchResults.results) {
    for(let i=0; i<props.searchResults.results.length; i++) {
      console.log(`searchResults: ${props.searchResults.results[i].title}`);
    }
  }

  let filterStartValue = null;

  if (props.previousFilter) {
    switch (props.previousFilter) {
      case "0": filterStartValue = FilterResults.ALL; break;
      case "1": filterStartValue = FilterResults.MOVIES; break;
      case "2": filterStartValue = FilterResults.CAST_AND_CREW; break;
    }
  }

  const [ filter, setFilter ] = useState(filterStartValue ? filterStartValue : FilterResults.ALL);
  const [ searchQuery, setSearchQuery ] = useState(props.previousQuery ? props.previousQuery : "");

  function onSubmitSearchForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (searchQuery !== "") {
      console.log(`searchQuery: ${searchQuery}`);
      const href = `/m/search?q=${searchQuery}`;
      console.log(`href: ${href}`);
      window.location.href = `/m/search?q=${searchQuery}&f=${filter}`;
    }
  }

  return <>
    <Navbar />
    <div className={styles["search-page"]}>
      <form onSubmit={onSubmitSearchForm}>
        <InputGroup>
          <InputLeftElement
            pointerEvents='none'
            children={<SearchIcon color='gray.500' />}
          />
          <Input
            type="text"
            placeholder="search movies, or cast & crew"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </form>

      <div className={styles["content"]}>
        <div className={styles["results"]}>

        </div>

        <div className={styles["filter"]}>
          <h3>show results for</h3>
          <Divider />

          <div className={styles["filter-buttons"]}>
            <Button
              colorScheme='teal'
              variant={filter === FilterResults.ALL ? "solid" : "ghost"}
              onClick={() => setFilter(FilterResults.ALL)}
              justifyContent="left">
              ALL
            </Button>

            <Button
              colorScheme='teal'
              variant={filter === FilterResults.MOVIES ? "solid" : "ghost"}
              onClick={() => setFilter(FilterResults.MOVIES)}
              justifyContent="left">
              MOVIES
            </Button>

            <Button
              colorScheme='teal'
              variant={filter === FilterResults.CAST_AND_CREW ? "solid" : "ghost"}
              onClick={() => setFilter(FilterResults.CAST_AND_CREW)}
              justifyContent="left">
              CAST & CREW
            </Button>
          </div>

        </div>
      </div>
    </div>
  </>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = context.query.q;
  const filter = context.query.f;

  if (query) {
    console.log(`query: ${query}`);

    const response = await axios({
      url: `${process.env.TMDB_BASE_URL}/search/multi`,
      method: "GET",
      params: {
        "api_key": `${process.env.TMDB_API_KEY}`,
        "query": query
      }
    });


    return {
      props: {
        previousQuery: query,
        previousFilter: filter,
        searchResults: response.data
      }
    }
  } else {

    return {
      props: {}
    }
  }

  // if (response.data.page) {
  //   console.log(`TMDB response: ${response.data.page}`);
  //   console.log(`TMDB response: ${response.data.results}`);
  //   console.log(`TMDB response: ${response.data.results[0].title}`);
  //   console.log(`TMDB response: ${response.status}`);

  // }

}