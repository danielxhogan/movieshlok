"use client";

import api from "@/api/client";
import type { MoviesResult, PeopleResult } from "@/tmdb/search";

function SearchResults({ children }: { children: React.ReactNode }) {
  return <section className="bg-primarybg rounded p-4">{children}</section>;
}

function MovieResult(results: MoviesResult) {
  return <div>{results.title}</div>;
}

export function MoviesSearchResults({
  initialResults,
  query,
}: {
  initialResults: MoviesResult[] | undefined;
  query: string;
}) {
  const { data, fetchNextPage } = api.tmdbSearch.getMovies.useInfiniteQuery(
    {
      query,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialCursor: 2,
    },
  );

  return (
    <SearchResults>
      {initialResults?.map((result) => <MovieResult {...result} />)}

      {data?.pages.map((page) =>
        page.results.map((result) => <MovieResult {...result} />),
      )}

      <button onClick={() => fetchNextPage()}>Load more results</button>
    </SearchResults>
  );
}

function PersonResult(result: PeopleResult) {
  return <div>{result.name}</div>;
}

export function PeopleSearchResults({
  initialResults,
  query,
}: {
  initialResults: PeopleResult[] | undefined;
  query: string;
}) {
  const { data, fetchNextPage } = api.tmdbSearch.getPeople.useInfiniteQuery(
    {
      query,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialCursor: 2,
    },
  );

  return (
    <SearchResults>
      {initialResults?.map((result) => <PersonResult {...result} />)}

      {data?.pages.map((page) =>
        page.results.map((result) => <PersonResult {...result} />),
      )}

      <button onClick={() => fetchNextPage()}>Load more results</button>
    </SearchResults>
  );
}
