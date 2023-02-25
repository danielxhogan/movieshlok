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

type Result = {
  id: number;
  popularity: number;
  media_type?: string;    // only multi
  title?: string;         // only movie
  poster_path?: string;   // only movie
  overview?: string;      // only movie
  release_date?: string;  // only movie
  vote_count?: number;    // only movie
  name?: string;          // only person
  profile_path?: string;  // only person
}

type Props = {
  previousQuery?: string;
  previousFilter?: string;
  searchResults?: {
    results: [Result]
  };
}

export default function SearchPage(props: Props) {
  let filterStartValue: FilterResults | null = null;

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
      window.location.href = `/m/search?q=${searchQuery}&f=${filter}`;
    }
  }

  function makeMovieResult(result: Result) {
    return <div key={result.id}>
      <br /><h1>{ result.id }</h1><br />
      <h2>{ result.title }</h2><br />
      <h3>{ result.media_type }</h3><br />
      <span>{ result.poster_path }</span><br />
      <span>{ result.overview }</span><br />
      <span>{ result.popularity }</span><br />
      <span>{ result.vote_count }</span><br />
      <span>{ result.release_date }</span><br />
    </div>
  }

  function makePersonResult(result: Result) {
    return <div key={result.id}>
      <br /><h1>{ result.id }</h1><br />
      <h2>{ result.name }</h2><br />
      <h3>{ result.media_type }</h3><br />
      <span>{ result.profile_path }</span><br />
      <span>{ result.popularity }</span><br />
    </div>
  }

  function makeSearchResult(result: Result) {
    switch (filterStartValue) {

      case FilterResults.ALL:
        switch (result.media_type) {
          case "movie": { return makeMovieResult(result); }
          case "person": { return makePersonResult(result); }
        }
        break;

      case FilterResults.MOVIES: { return makeMovieResult(result); }

      case FilterResults.CAST_AND_CREW: { return makePersonResult(result); }
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
          { props.searchResults?.results.map(result => makeSearchResult(result)) }
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
  let response = null;

  if (query) {
    switch (filter) {
      case "0":
        console.log(`query: ${query}`);

        response = await axios({
          url: `${process.env.TMDB_BASE_URL}/search/multi`,
          method: "GET",
          params: {
            "api_key": `${process.env.TMDB_API_KEY}`,
            "query": query
          }
        });
        break;

      case "1":
        response = await axios({
          url: `${process.env.TMDB_BASE_URL}/search/movie`,
          method: "GET",
          params: {
            "api_key": `${process.env.TMDB_API_KEY}`,
            "query": query
          }
        });
        break;

      case "2":
        response = await axios({
          url: `${process.env.TMDB_BASE_URL}/search/person`,
          method: "GET",
          params: {
            "api_key": `${process.env.TMDB_API_KEY}`,
            "query": query
          }
        });
        break;
    }

    if (response && response.statusText === "OK") {
      response.data.results.sort((result1: {popularity: number;}, result2: {popularity: number;}) => {
        if (result1.popularity < result2.popularity) { return  1; }
        if (result1.popularity > result2.popularity) { return -1; }
        return 0;
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

  } else {

    return {
      props: {}
    }
  }
}