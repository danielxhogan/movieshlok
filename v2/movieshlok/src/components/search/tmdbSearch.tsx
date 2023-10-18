"use client";

import api from "@/api/client";
import { type RouterOutputs } from "@/api/types";

type InitialMoviesResults = RouterOutputs["tmdbSearch"]["getMovies"];
type InitialPeopleResults = RouterOutputs["tmdbSearch"]["getPeople"];

export function MovieSearchResults({
  initialResults,
  query,
}: {
  initialResults: InitialMoviesResults | undefined;
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
    <div>
      {initialResults?.results.map((result) => (
        <div key={result.title}>{result.title}</div>
      ))}

      {data?.pages.map((page) =>
        page.results.map((result) => (
          <div key={result.title}>{result.title}</div>
        )),
      )}

      <button onClick={() => fetchNextPage()}>Load more results</button>
    </div>
  );
}

export function PeopleSearchResults({
  initialResults,
  query,
}: {
  initialResults: InitialPeopleResults | undefined;
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
    <div>
      {initialResults?.results.map((result) => (
        <div key={result.name}>{result.name}</div>
      ))}

      {data?.pages.map((page) =>
        page.results.map((result) => (
          <div key={result.name}>{result.name}</div>
        )),
      )}

      <button onClick={() => fetchNextPage()}>Load more results</button>
    </div>
  );
}
