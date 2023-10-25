"use client";

import { Spinner } from "../icons";
import api from "@/api/client";
import { env } from "@/env.mjs";
import { formatDate } from "@/utils/dateFormat";

import type {
  MoviesResult,
  MoviesResults,
  PeopleResult,
  PeopleResults,
  KnownFor,
} from "@/tmdb/search";

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
              src={`${env.NEXT_PUBLIC_TMDB_IMG_URL}/w92${result.poster_path}`}
              alt={`poster for ${result.title}`}
              width={92}
              height={138}
              className="rounded"
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

function KnownFor({ movie }: { movie: KnownFor }) {
  let title = movie.title;
  if (!title) {
    return;
  }

  const year = movie.release_date ? movie.release_date.substring(0, 4) : "";

  if (title && title.length > 20) {
    title = title.substring(0, 20);
  }

  return (
    <div key={movie.id} className="flex flex-col items-center gap-2">
      <div>{title}</div>

      <Image
        src={`${env.NEXT_PUBLIC_TMDB_IMG_URL}/w92${movie.poster_path}`}
        alt={`poster for ${movie.title}`}
        width={92}
        height={138}
        className="rounded"
      />
      <div>{year}</div>
    </div>
  );
}

function PersonResult(result: PeopleResult) {
  return (
    <div className="border-b-shadow border-b">
      <h2 className="my-4 text-center text-2xl sm:text-left">{result.name}</h2>

      <div className="mb-6 sm:grid sm:grid-cols-6 sm:gap-2 lg:grid-cols-9">
        <div className="mb-6 sm:col-span-2 sm:mb-0">
          {result.profile_path && (
            <Image
              src={`${env.NEXT_PUBLIC_TMDB_IMG_URL}/w185${result.profile_path}`}
              alt={`profile img for ${result.name}`}
              width={150}
              height={225}
              className="mx-auto rounded sm:mx-0"
            />
          )}
        </div>

        <div className="col-span-4 grid grid-cols-3 content-center lg:col-span-7">
          {result.known_for.map((movie) => (
            <KnownFor movie={movie} />
          ))}
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
