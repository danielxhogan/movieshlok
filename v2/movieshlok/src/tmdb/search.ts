import { env } from "@/env.mjs";
import axios from "axios";

interface MoviesResults {
  data: {
    results: MoviesResult[];
  };
}

export interface MoviesResult {
  title: string;
}

interface PeopleResults {
  data: {
    results: PeopleResult[];
  };
}

export interface PeopleResult {
  name: string;
}

export async function getMovies(
  query: string,
  page: number,
): Promise<MoviesResult[]> {
  const results: MoviesResults = await axios(
    makeSearchPayload("movie", query, page),
  );
  return results.data.results;
}

export async function getPeople(
  query: string,
  page: number,
): Promise<PeopleResult[]> {
  const results: PeopleResults = await axios(
    makeSearchPayload("person", query, page),
  );

  return results.data.results;
}

function makeSearchPayload(filter: string, query: string, page: number) {
  return {
    method: "get",
    baseURL: `https://api.themoviedb.org/3/search/${filter}?query=${query}&page=${page}`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  };
}
