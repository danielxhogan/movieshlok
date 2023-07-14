import styles from "@/styles/SearchPage.module.css";
import Navbar from "@/components/Navbar";
import Pagination, { UseCases } from "@/components/Pagination";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { getSearchResults, SearchParams } from "@/redux/actions/tmdb";
import {
  selectSearchResults,
  SearchResult,
  KnownFor
} from "@/redux/reducers/tmdb";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import { Divider, Button, Spinner } from "@chakra-ui/react";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

export enum FilterResults {
  ALL,
  MOVIES,
  CAST_AND_CREW
}

export default function SearchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchResults = useAppSelector(selectSearchResults);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState(FilterResults.ALL);

  function setParentSeachQuery(value: string) {
    setSearchQuery(value);
  }

  // get search results on page load based on query parameters
  // and set filter and searchQuery
  useEffect(() => {
    let query = router.query.query;
    let filter = router.query.filter;
    let page = router.query.page;

    if (
      typeof query === "string" &&
      typeof filter === "string" &&
      typeof page === "string"
    ) {
      let filterResults: FilterResults;

      // prettier-ignore
      switch (filter) {
        case "0": filterResults = FilterResults.ALL; break;
        case "1": filterResults = FilterResults.MOVIES; break;
        case "2": filterResults = FilterResults.CAST_AND_CREW; break;
        default: filterResults = FilterResults.ALL; break;
      }

      setFilter(filterResults);
      setSearchQuery(query);

      const searchParams: SearchParams = {
        query,
        page,
        filter: filterResults
      };

      dispatch<any>(getSearchResults(searchParams));
    }
  }, [dispatch, router.query.filter, router.query.page, router.query.query]);

  function onClickFilterButton(newFilter: FilterResults) {
    if (newFilter !== filter) {
      router.push(`/search?query=${searchQuery}&filter=${newFilter}&page=1`);
    }
  }

  function reformatDate(date: string) {
    const year = date.substring(0, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    let monthText;

    // prettier-ignore
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

  function makeMovieResult(result: SearchResult) {
    const date = result.release_date
      ? reformatDate(result.release_date)
      : result.release_date;

    const score = result.vote_average
      ? (result.vote_average / 2).toFixed(1)
      : result.vote_average;

    return (
      <div key={result.id} className="block block-btn">
        <Link href={`/details/movie/${result.id}`}>
          <span className={styles["result-title"]}> {result.title} </span>
          <br />

          <div className={styles["movie-result-content"]}>
            <div>
              {result.poster_path && (
                <Image
                  src={`${TMDB_IMAGE_URL}/w185${result.poster_path}`}
                  className={styles["movie-poster-image"]}
                  width={100}
                  height={1}
                  alt="movie poster"
                />
              )}
            </div>

            <div className={styles["movie-details"]}>
              <div className={styles["movie-overview"]}>{result.overview}</div>
              <span className={styles["score"]}>
                <span className={styles["score-number"]}>{score}</span> / 5
              </span>
              <br />
              <span>
                Released on <strong>{date}</strong>
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  function makeKnownFor(knownFor: KnownFor[]) {
    const knownForText = knownFor.map((movie, idx) => {
      if (idx >= 10 || movie.media_type !== "movie") {
        return;
      } else {
        let movie_title: string;
        if (movie.title.length > 30) {
          movie_title = movie.title.substring(0, 30);
          movie_title = `${movie_title}...`;
        } else {
          movie_title = movie.title;
        }

        return (
          <Link key={movie.id} href={`/details/movie/${movie.id}`}>
            {/* @ts-ignore */}
            <Button
              colorScheme="teal"
              size="sm"
              variant="outline"
              className={styles["know-for-item"]}
            >
              {movie_title}
            </Button>
          </Link>
        );
      }
    });

    return knownForText;
  }

  function makePersonResult(result: SearchResult) {
    return (
      <div key={result.id} className="block block-btn">
        <Link
          href={`/details/person/${result.id}?kf=${result.known_for_department}`}
        >
          <span className={styles["result-title"]}>{result.name}</span>
          <br />

          <div className={styles["person-result-content"]}>
            <div>
              {result.profile_path && (
                <Image
                  src={`${TMDB_IMAGE_URL}/w185${result.profile_path}`}
                  className={styles["cast-crew-profile"]}
                  width={100}
                  height={1}
                  alt="cast & crew profile"
                />
              )}
            </div>

            <div className={styles["known-for"]}>
              {result.known_for && makeKnownFor(result.known_for)}
            </div>
          </div>
          <br />
        </Link>
      </div>
    );
  }

  function makeSearchResult(result: SearchResult) {
    switch (filter) {
      case FilterResults.ALL:
        switch (result.media_type) {
          case "movie": {
            return makeMovieResult(result);
          }
          case "person": {
            return makePersonResult(result);
          }
        }
        break;

      case FilterResults.MOVIES: {
        return makeMovieResult(result);
      }
      case FilterResults.CAST_AND_CREW: {
        return makePersonResult(result);
      }
    }
  }

  function sortAndMakeSearchResults(results: SearchResult[]) {
    if (results.length === 0) {
      return (
        <>
          <h2 className={styles["no-results"]}>Sorry, No Results</h2>
          <Image
            src="/mandy-creeps.png"
            className={styles["no-results-image"]}
            width={1000}
            height={100}
            alt="no-results"
          />
        </>
      );
    } else {
      results.sort(
        (result1: { popularity: number }, result2: { popularity: number }) => {
          if (result1.popularity < result2.popularity) {
            return 1;
          }
          if (result1.popularity > result2.popularity) {
            return -1;
          }
          return 0;
        }
      );

      return results.map(result => makeSearchResult(result));
    }
  }

  return (
    <div className="wrapper">
      <Navbar filter={filter} setParentSeachQuery={setParentSeachQuery} />

      <div className="content">
        <div className={styles["search-data"]}>
          <div className={styles["results"]}>
            <div className={styles["horizontal-filter"]}>
              <h3>show results for:</h3>

              <Button
                colorScheme="teal"
                variant={filter === FilterResults.ALL ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => onClickFilterButton(FilterResults.ALL)}
                justifyContent="left"
              >
                ALL
              </Button>

              <Button
                colorScheme="teal"
                variant={filter === FilterResults.MOVIES ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => onClickFilterButton(FilterResults.MOVIES)}
                justifyContent="left"
              >
                MOVIES
              </Button>

              <Button
                colorScheme="teal"
                variant={
                  filter === FilterResults.CAST_AND_CREW ? "solid" : "ghost"
                }
                className={styles["filter-button"]}
                onClick={() => onClickFilterButton(FilterResults.CAST_AND_CREW)}
                justifyContent="left"
              >
                CAST & CREW
              </Button>
            </div>

            {searchResults.status === "loading" ? (
              <div className="spinner">
                <Spinner size="xl" />
              </div>
            ) : (
              <>
                {searchResults.data.results &&
                  sortAndMakeSearchResults([...searchResults.data.results])}

                {searchResults.data.page &&
                  searchResults.data.total_pages &&
                  parseInt(searchResults.data.total_pages) > 1 && (
                    <Pagination
                      useCase={UseCases.SEARCH_RESULTS}
                      currentPage={searchResults.data.page}
                      totalPages={searchResults.data.total_pages}
                      searchQuery={searchQuery}
                      filter={filter}
                    />
                  )}
              </>
            )}
          </div>
          {/* end results */}

          <div className={styles["filter"]}>
            <h3>show results for</h3>
            <Divider />
            <div className={styles["filter-buttons"]}>
              <Button
                colorScheme="teal"
                variant={filter === FilterResults.ALL ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => onClickFilterButton(FilterResults.ALL)}
                justifyContent="left"
              >
                ALL
              </Button>

              <Button
                colorScheme="teal"
                variant={filter === FilterResults.MOVIES ? "solid" : "ghost"}
                className={styles["filter-button"]}
                onClick={() => onClickFilterButton(FilterResults.MOVIES)}
                justifyContent="left"
              >
                MOVIES
              </Button>

              <Button
                colorScheme="teal"
                variant={
                  filter === FilterResults.CAST_AND_CREW ? "solid" : "ghost"
                }
                className={styles["filter-button"]}
                onClick={() => onClickFilterButton(FilterResults.CAST_AND_CREW)}
                justifyContent="left"
              >
                CAST & CREW
              </Button>
            </div>
            {/* end filter-buttons */}
          </div>
          {/* end filter */}
        </div>
        {/* end search-data */}
      </div>
      {/* end content */}

      <Footer />
    </div>
  ); /* end wrapper */
}
