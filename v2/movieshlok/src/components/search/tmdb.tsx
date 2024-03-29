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
import Link from "next/link";

function KnownFor({ movie }: { movie: KnownFor }) {
  let title = movie.title;
  if (!title) {
    return;
  }

  const year = movie.release_date ? movie.release_date.substring(0, 4) : "";

  if (title && title.length > 20) {
    title = title.substring(0, 20).concat("...");
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Link href={`/movie/${movie.id}`}>
        <div className="hover:underline">{title}</div>
      </Link>

      <Link href={`/movie/${movie.id}`}>
        <Image
          src={`${env.NEXT_PUBLIC_TMDB_IMG_URL}/w92${movie.poster_path}`}
          alt={`poster for ${movie.title}`}
          width={92}
          height={138}
          className="border-primarybg hover:border-shadow rounded border transition-all"
        />
      </Link>
      <div>{year}</div>
    </div>
  );
}

function PersonResult(result: PeopleResult) {
  return (
    <section className="border-b-shadow border-b">
      <Link href={`/person/${result.id}`}>
        <h2 className="my-4 text-center text-2xl hover:underline sm:text-left">
          {result.name}
        </h2>
      </Link>

      <div className="mb-6 sm:grid sm:grid-cols-6 sm:gap-2 lg:grid-cols-9">
        <div className="mb-6 sm:col-span-2 sm:mb-0">
          {result.profile_path && (
            <Link href={`/person/${result.id}`}>
              <Image
                src={`${env.NEXT_PUBLIC_TMDB_IMG_URL}/w185${result.profile_path}`}
                alt={`profile img for ${result.name}`}
                width={150}
                height={225}
                className="border-primarybg hover:border-shadow mx-auto rounded border-2 transition-all sm:mx-0"
              />
            </Link>
          )}
        </div>

        <div className="col-span-4 grid grid-cols-3 content-center lg:col-span-7">
          {result.known_for.map((movie) => (
            <KnownFor key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MovieResult(result: MoviesResult) {
  const score = (result.vote_average / 2).toFixed(1);
  const releaseDate = formatDate(result.release_date);

  return (
    <section className="border-b-shadow border-b">
      <Link href={`/movie/${result.id}`}>
        <h2 className="my-4 text-center text-2xl hover:underline sm:text-left">
          {result.title}
        </h2>
      </Link>

      <div className="mb-6 gap-2 sm:grid sm:grid-cols-5 lg:grid-cols-12">
        <div className="mb-6 sm:mb-0 md:col-span-1 lg:col-span-2">
          {result.poster_path && (
            <Link href={`/movie/${result.id}`}>
              <Image
                src={`${env.NEXT_PUBLIC_TMDB_IMG_URL}/w154${result.poster_path}`}
                alt={`poster for ${result.title}`}
                width={150}
                height={138}
                className="border-primarybg hover:border-shadow mx-auto rounded border-2 transition-all sm:mx-0"
              />
            </Link>
          )}
        </div>

        <div className="col-span-4 flex flex-col gap-3 lg:col-span-9">
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
    </section>
  );
}

export function PeopleSearchResults({
  initialResults,
  query,
}: {
  initialResults: PeopleResults;
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
      {initialResults.total_results === 0 && (
        <>
          <h3 className="font-Audiowide mb-4 text-center text-2xl">
            Sorry, No Results
          </h3>
          <Image
            src="/mandy-creeps.png"
            alt="sorry no results"
            width={1280}
            height={536}
            className="rounded"
          />
        </>
      )}

      {initialResults.results.map((result) => (
        <PersonResult key={result.id} {...result} />
      ))}

      {data?.pages.map((page) =>
        page.results.results.map((result) => (
          <PersonResult key={result.id} {...result} />
        )),
      )}

      {data?.pages[0] &&
        data.pages.length < data.pages[0].results.total_pages - 1 && (
          <button
            onClick={() => fetchNextPage()}
            className="hover:bg-shadow hover:text-invertedfg font-Audiowide border-shadow mt-4 flex h-12 w-48 items-center justify-center rounded border transition-all"
          >
            {isFetching ? <Spinner /> : <p>Load more results</p>}
          </button>
        )}
    </>
  );
}

export function MoviesSearchResults({
  initialResults,
  query,
}: {
  initialResults: MoviesResults;
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
      {initialResults.total_results === 0 && (
        <>
          <h3 className="font-Audiowide mb-4 text-center text-2xl">
            Sorry, No Results
          </h3>
          <Image
            src="/mandy-creeps.png"
            alt="sorry no results"
            width={1280}
            height={536}
            className="rounded"
          />
        </>
      )}

      {initialResults?.results.map((result) => (
        <MovieResult key={result.id} {...result} />
      ))}

      {data?.pages.map((page) =>
        page.results.results.map((result) => (
          <MovieResult key={result.id} {...result} />
        )),
      )}

      {data?.pages[0] &&
        data.pages.length < data.pages[0].results.total_pages - 1 && (
          <button
            onClick={() => fetchNextPage()}
            className="hover:bg-shadow hover:text-invertedfg font-Audiowide border-shadow mt-4 flex h-12 w-48 items-center justify-center rounded border transition-all"
          >
            {isFetching ? <Spinner /> : <p>Load more results</p>}
          </button>
        )}
    </>
  );
}
