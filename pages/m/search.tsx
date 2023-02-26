/* eslint-disable react/no-children-prop */
import styles from "@/styles/SearchPage.module.css";
import Navbar from "@/components/Navbar";
import Pagination, { Api } from "@/components/Pagination";

import { FormEvent, useState } from "react";
import { InputGroup, InputLeftElement, Input, Divider, Button } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Image from "next/image";

import { GetServerSideProps } from "next";
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";


export enum FilterResults {
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
  vote_average?: number;  // only movie
  vote_count?: number;    // only movie
  name?: string;          // only person
  profile_path?: string;  // only person
}

type Props = {
  previousQuery?: string;
  previousFilter?: string;
  previousPage?: string;
  searchResults?: {
    total_pages: string;
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

  function onClickFilterButton(newFilter: FilterResults) {
    setFilter(newFilter);

    if (searchQuery !== "") {
      window.location.href = `/m/search?q=${searchQuery}&f=${newFilter}&p=1`;
    }
  }

  function onSubmitSearchForm(e: FormEvent<HTMLFormElement>, page: string = "1") {
    e.preventDefault();

    if (searchQuery !== "") {
      window.location.href = `/m/search?q=${searchQuery}&f=${filter}&p=${page}`;
    }
  }

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

  function makeMovieResult(result: Result) {
    const date = result.release_date ? reformatDate(result.release_date) : result.release_date;
    return <div key={result.id} className={styles["search-result"]}>
      <h2>{ result.title }</h2><br />
      {result.poster_path &&
        <Image
          src={`${TMDB_IMAGE_URL}/w92${result.poster_path}`}
          alt="movie poster"
          width={75}
          height={225}
        />
      }
      <br />
      <span>{ result.overview }</span><br /><br />
      <span>Average score: { result.vote_average }</span><br />
      <span>Votes: { result.vote_count }</span><br />
      <span>Release date: { date }</span><br />
    </div>
  }

  function makePersonResult(result: Result) {
    return <div key={result.id} className={styles["search-result"]}>
      <h2>{ result.name }</h2><br />
      {result.profile_path &&
        <Image
          src={`${TMDB_IMAGE_URL}/w185${result.profile_path}`}
          alt="movie poster"
          width={75}
          height={225}
        />
      }
      <br />
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
            variant="filled"
            placeholder="search movies, or cast & crew"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </form>

      <div className={styles["content"]}>
        <div className={styles["results"]}>

          { props.searchResults && props.previousPage &&
            <Pagination
              api={Api.TMDB}
              currentPage={props.previousPage}
              totalPages={props.searchResults.total_pages}
              searchQuery={searchQuery}
              filter={filter}
            />
          }

          { props.searchResults?.results.map(result => makeSearchResult(result)) }
        </div>

        <div className={styles["filter"]}>
          <h3>show results for</h3>
          <Divider />

          <div className={styles["filter-buttons"]}>
            <Button
              colorScheme='teal'
              variant={filter === FilterResults.ALL ? "solid" : "ghost"}
              onClick={() => onClickFilterButton(FilterResults.ALL)}
              justifyContent="left">
              ALL
            </Button>

            <Button
              colorScheme='teal'
              variant={filter === FilterResults.MOVIES ? "solid" : "ghost"}
              onClick={() => onClickFilterButton(FilterResults.MOVIES)}
              justifyContent="left">
              MOVIES
            </Button>

            <Button
              colorScheme='teal'
              variant={filter === FilterResults.CAST_AND_CREW ? "solid" : "ghost"}
              onClick={() => onClickFilterButton(FilterResults.CAST_AND_CREW)}
              justifyContent="left">
              CAST & CREW
            </Button>
          </div>

        </div>
      </div>
    </div>
  </>
}

async function makeRequest(query: string | string[], page: string | string[], endpoint: string) {
  return await axios({
    url: `${process.env.TMDB_BASE_URL}/search/${endpoint}`,
    method: "GET",
    params: {
      "api_key": `${process.env.TMDB_API_KEY}`,
      "query": query,
      "page": page
    }
  });
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = context.query.q;
  const filter = context.query.f;
  const page = context.query.p;
  let response = null;

  if (query && page) {
    switch (filter) {
      case "0": response = await makeRequest(query, page, "multi"); break;
      case "1": response = await makeRequest(query, page, "movie"); break;
      case "2": response = await makeRequest(query, page, "person"); break;
    }

    const configureResponse = await axios({
      url: `${process.env.TMDB_BASE_URL}/configuration`,
      method: "GET",
      params: {
        "api_key": `${process.env.TMDB_API_KEY}`,
      }
    });

    console.log(configureResponse.status);
    console.log(configureResponse.data);

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
          previousPage: page,
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