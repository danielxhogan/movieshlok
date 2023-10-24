"use client";

import { Spinner } from "../icons";
import api from "@/api/client";
import type {
  MoviesResult,
  MoviesResults,
  PeopleResult,
  PeopleResults,
} from "@/tmdb/search";

function SearchResults({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-primarybg mb-6 rounded p-4">{children}</section>
  );
}

function MovieResult(result: MoviesResult) {
  return <div>{result.title}</div>;
}

export function MoviesSearchResults({
  initialResults,
  query,
}: {
  initialResults: MoviesResults | undefined;
  query: string;
}) {
  const { data, fetchNextPage, isFetching } =
    api.tmdbSearch.getMovies.useInfiniteQuery(
      {
        query,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialCursor: 2,
      },
    );

  return (
    <>
      <SearchResults>
        {initialResults?.results.map((result) => (
          <MovieResult key={result.id} {...result} />
        ))}

        {data?.pages.map((page) =>
          page.results.results.map((result) => (
            <MovieResult key={result.id} {...result} />
          )),
        )}
      </SearchResults>

      {data &&
        data.pages[0] &&
        data.pages.length < data.pages[0].results.total_pages - 1 && (
          <button
            onClick={() => fetchNextPage()}
            className="hover:bg-shadow hover:text-invertedfg font-Audiowide border-shadow my-4 flex h-12 w-48 items-center justify-center rounded border transition-all"
          >
            {isFetching ? <Spinner /> : <p>Load more results</p>}
          </button>
        )}
    </>
  );
}

function PersonResult(result: PeopleResult) {
  return <div>{result.name}</div>;
}

export function PeopleSearchResults({
  initialResults,
  query,
}: {
  initialResults: PeopleResults | undefined;
  query: string;
}) {
  const { data, fetchNextPage, isFetching } =
    api.tmdbSearch.getPeople.useInfiniteQuery(
      {
        query,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialCursor: 2,
      },
    );

  return (
    <>
      <SearchResults>
        {initialResults?.results.map((result) => <PersonResult {...result} />)}

        {data?.pages.map((page) =>
          page.results.results.map((result) => <PersonResult {...result} />),
        )}
      </SearchResults>

      {data &&
        data.pages[0] &&
        data.pages.length < data.pages[0].results.total_pages - 1 && (
          <button
            onClick={() => fetchNextPage()}
            className="hover:bg-shadow hover:text-invertedfg font-Audiowide border-shadow my-4 flex h-12 w-48 items-center justify-center rounded border transition-all"
          >
            {isFetching ? <Spinner /> : <p>Load more results</p>}
          </button>
        )}
    </>
  );
}
