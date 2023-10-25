import { env } from "@/env.mjs";
import axios from "axios";

interface MoviesResultsResponse {
  data: MoviesResults;
}

export interface MoviesResults {
  results: MoviesResult[];
  total_pages: number;
  total_results: number;
}

export interface MoviesResult {
  id: number;
  title: string;
  poster_path?: string;
  overview: string;
  vote_average: number;
  popularity: number;
  release_date: string;
}

interface PeopleResultsResponse {
  data: PeopleResults;
}

export interface PeopleResults {
  results: PeopleResult[];
  total_pages: number;
  total_results: number;
}

export interface PeopleResult {
  id: number;
  name: string;
  popularity: number;
}

export async function getMovies(
  query: string,
  page: number,
): Promise<MoviesResults> {
  const results: MoviesResultsResponse = await axios(
    makeSearchPayload("movie", query, page),
  );
  return results.data;
}

export async function getPeople(
  query: string,
  page: number,
): Promise<PeopleResults> {
  const results: PeopleResultsResponse = await axios(
    makeSearchPayload("person", query, page),
  );

  return results.data;
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
