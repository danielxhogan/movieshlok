import { env } from "@/env.mjs";
import axios from "axios";

interface MovieResults {
  data: {
    results: [
      {
        title: string;
      },
    ];
  };
}

interface PersonResults {
  data: {
    results: [
      {
        name: string;
      },
    ];
  };
}

export async function getMovies(query: string, page: number) {
  const results: MovieResults = await axios(
    makeSearchPayload("movie", query, page),
  );
  return results.data.results;
}

export async function getPeople(query: string, page: number) {
  const results: PersonResults = await axios(
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
