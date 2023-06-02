/* eslint-disable react/no-children-prop */
import styles from "@/styles/SearchPage.module.css";
import Navbar from "@/components/Navbar";
import Pagination, { UseCases } from "@/components/Pagination";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getSearchResults, SearchParams } from "@/redux/actions/tmdb";
import { selectSearchResults, Result, KnownFor } from "@/redux/reducers/tmdb";

import { FormEvent, useState } from "react";
import { InputGroup, InputLeftElement, Input, Divider, Button, Link } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Image from "next/image";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";


export enum FilterResults {
  ALL,
  MOVIES,
  CAST_AND_CREW
}


export default function SearchPage() {

  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectSearchResults);

  const [ filter, setFilter ] = useState(FilterResults.ALL);
  const [ searchQuery, setSearchQuery ] = useState("");


  function onSubmitSearchForm(e: FormEvent<HTMLFormElement>, page: string = "1") {
    e.preventDefault();
    dispatchGetSearchResults("1");
  }

  async function dispatchGetSearchResults(page: string) {
    if (searchQuery !== "") {
      let endpoint: string = "";

      switch (filter) {
        case 0: endpoint = "multi"; break;
        case 1: endpoint = "movie"; break;
        case 2: endpoint = "person"; break;
      }

      const searchParams: SearchParams = {
        query: searchQuery,
        page,
        endpoint
      }

      dispatch(getSearchResults(searchParams));
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
      <Link as={NextLink} href={`/details/movie/${result.id}`}>
        <span className={styles["result-title"]}>{ result.title }</span><br />

      <div className={styles["movie-result-content"]}>
          { result.poster_path &&
            <Image
              src={`${TMDB_IMAGE_URL}/w92${result.poster_path}`}
              className={styles["movie-poster-image"]}
              width={75}
              height={225}
              alt="movie poster"
            />
          }

        <div className={styles["movie-details"]}>
          <span>{ result.overview }</span><br /><br />
          <span>Average score: { result.vote_average }</span><br />
          <span>Votes: { result.vote_count }</span><br />
          <span>Release date: { date }</span><br />
        </div>

      </div>
        </Link>
    </div>
  }

  function makeKnownFor(knownFor: KnownFor[]) {
    const knownForText = knownFor.map(( movie, idx ) => {
      if (idx >= 10 || movie.media_type !== "movie") { return; }
      else {
        return (
        <Link key={movie.id} as={NextLink} href={`/details/movie/${movie.id}`}>
          <Button
            colorScheme="teal"
            size="sm"
            variant="outline"
            className={styles["know-for-item"]}>
            {movie.title} 
          </Button>
        </Link>
        )
      }
    });

    return knownForText;
  }

  function makePersonResult(result: Result) {
    return <div key={result.id} className={styles["search-result"]}>
      <Link as={NextLink} href={`/details/person/${result.id}`}>
        <span className={styles["result-title"]}>{ result.name }</span><br />

      <div className={styles["person-result-content"]}>
          { result.profile_path &&
            <Image
              src={`${TMDB_IMAGE_URL}/w185${result.profile_path}`}
              className={styles["cast-crew-profile"]}
              width={75}
              height={225}
              alt="cast & crew profile"
            />
          }

        <div className={styles["known-for"]}>
          { result.known_for && makeKnownFor(result.known_for) }
        </div>

      </div>
      <br />
        </Link>
    </div>
  }

  function makeSearchResult(result: Result) {
    console.log("here");

    switch (filter) {

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

  function sortAndMakeSearchResults(results: [Result]) {
    results.sort((result1: {popularity: number;}, result2: {popularity: number;}) => {
      if (result1.popularity < result2.popularity) { return  1; }
      if (result1.popularity > result2.popularity) { return -1; }
      return 0;
    });

    return results.map(result => makeSearchResult(result));
  }

  return <div className={styles["wrapper"]}>
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

          <div className={styles["vertical-filter"]}>
            <h3>show results for:</h3>

            <Link as={NextLink} href={`/search?q=${searchQuery}&f=${FilterResults.ALL}&p=1`}>
              <Button
                colorScheme='teal'
                variant={filter === FilterResults.ALL ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => setFilter(FilterResults.ALL)}
                justifyContent="left">
                ALL
              </Button>
            </Link>

            <Link as={NextLink} href={`/search?q=${searchQuery}&f=${FilterResults.MOVIES}&p=1`}>
              <Button
                colorScheme='teal'
                variant={filter === FilterResults.MOVIES ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => setFilter(FilterResults.MOVIES)}
                justifyContent="left">
                MOVIES
              </Button>
            </Link>

            <Link as={NextLink} href={`/search?q=${searchQuery}&f=${FilterResults.CAST_AND_CREW}&p=1`}>
              <Button
                colorScheme='teal'
                variant={filter === FilterResults.CAST_AND_CREW ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => setFilter(FilterResults.CAST_AND_CREW)}
                justifyContent="left">
                CAST & CREW
              </Button>
            </Link>

          </div>

          { searchResults.data.results && sortAndMakeSearchResults([...searchResults.data.results])}

          { searchResults.data.page &&
            searchResults.data.total_pages &&
            parseInt(searchResults.data.total_pages) > 1 &&

            <Pagination
              useCase={UseCases.SEARCH_RESULTS}
              currentPage={searchResults.data.page}
              totalPages={searchResults.data.total_pages}
              searchQuery={searchQuery}
              filter={filter}
            />
          }
        </div>

        <div className={styles["filter"]}>
          <h3>show results for</h3>
          <Divider />

          <div className={styles["filter-buttons"]}>
            <Link as={NextLink} href={`/search?q=${searchQuery}&f=${FilterResults.ALL}&p=1`}>
              <Button
                colorScheme='teal'
                variant={filter === FilterResults.ALL ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => setFilter(FilterResults.ALL)}
                justifyContent="left">
                ALL
              </Button>
            </Link>

            <Link as={NextLink} href={`/search?q=${searchQuery}&f=${FilterResults.MOVIES}&p=1`}>
              <Button
                colorScheme='teal'
                variant={filter === FilterResults.MOVIES ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => setFilter(FilterResults.MOVIES)}
                justifyContent="left">
                MOVIES
              </Button>
            </Link>

            <Link as={NextLink} href={`/search?q=${searchQuery}&f=${FilterResults.CAST_AND_CREW}&p=1`}>
              <Button
                colorScheme='teal'
                variant={filter === FilterResults.CAST_AND_CREW ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => setFilter(FilterResults.CAST_AND_CREW)}
                justifyContent="left">
                CAST & CREW
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </div>

  </div>
}