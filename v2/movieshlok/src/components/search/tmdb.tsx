"use client";

import { Spinner } from "../icons";
import api from "@/api/client";
import { env } from "@/env.mjs";
import type {
  MoviesResult,
  MoviesResults,
  PeopleResult,
  PeopleResults,
} from "@/tmdb/search";
import { formatDate } from "@/utils/dateFormat";
import Image from "next/image";

function SearchResults({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-primarybg mb-6 rounded p-4">{children}</section>
  );
}

function MovieResult(result: MoviesResult) {
  const score = (result.vote_average / 2).toFixed(1);
  const releaseDate = formatDate(result.release_date);

  return (
    <div className="border-b-shadow border-b">
      <h2 className="my-4 text-2xl">{result.title}</h2>
      <div className="mb-6 grid grid-cols-5 gap-2 lg:grid-cols-9">
        <div>
          {result.poster_path && (
            <Image
              src={`${env.NEXT_PUBLIC_TMDB_POSTER_URL}/w92${result.poster_path}`}
              alt={`poster for ${result.title}`}
              width={92}
              height={138}
              className="w-auto rounded"
            />
          )}
        </div>

        <div className="col-span-4 flex flex-col gap-3 lg:col-span-8">
          <p>{result.overview}</p>
          <p>
            <span className="text-3xl font-semibold">{score}</span>{" "}
            <span className="text-xl">/ 5</span>
          </p>
          <p>
            {result.release_date && (
              <>
                Released on <span className="font-semibold">{releaseDate}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
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

        {data &&
          data.pages[0] &&
          data.pages.length < data.pages[0].results.total_pages - 1 && (
            <button
              onClick={() => fetchNextPage()}
              className="hover:bg-shadow hover:text-invertedfg font-Audiowide border-shadow mt-4 flex h-12 w-48 items-center justify-center rounded border transition-all"
            >
              {isFetching ? <Spinner /> : <p>Load more results</p>}
            </button>
          )}
      </SearchResults>
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
