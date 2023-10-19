"use client";

import api from "@/api/client";
import type { MoviesResults, PeopleResults } from "@/server/routers/tmdb";

function SearchResults({ children }: { children: React.ReactNode }) {
  return <section className="bg-primarybg rounded p-4">{children}</section>;
}

function MovieResult({ title }: { title: string }) {
  return <div>{title}</div>;
}

export function MoviesSearchResults({
  initialResults,
  query,
}: {
  initialResults: MoviesResults | undefined;
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
      {initialResults?.results.map((result) => <MovieResult {...result} />)}

      {data?.pages.map((page) =>
        page.results.map((result) => <MovieResult {...result} />),
      )}

      <button onClick={() => fetchNextPage()}>Load more results</button>
    </SearchResults>
  );
}

function PersonResult({ name }: { name: string }) {
  return <div>{name}</div>;
}

export function PeopleSearchResults({
  initialResults,
  query,
}: {
  initialResults: PeopleResults | undefined;
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
      {initialResults?.results.map((result) => <PersonResult {...result} />)}

      {data?.pages.map((page) =>
        page.results.map((result) => <PersonResult {...result} />),
      )}

      <button onClick={() => fetchNextPage()}>Load more results</button>
    </SearchResults>
  );
}
