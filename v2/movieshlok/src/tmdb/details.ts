import { env } from "@/env.mjs";
import axios from "axios";

interface MovieDetailsResponse {
  data: MovieDetails;
}
export interface MovieDetails {
  id: number;
  title: string;
  videos: { results: Video[] };
}

export interface Video {
  site: string;
  key: string;
  type: string;
}

interface PersonDetailsResponse {
  data: PersonDetails;
}

interface PersonDetails {
  id: number;
  name: string;
}

export async function getMovie(movieId: string): Promise<MovieDetails> {
  const results: MovieDetailsResponse = await axios({
    method: "get",
    baseURL: `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  return results.data;
}

export async function getPerson(personId: string): Promise<PersonDetails> {
  const results: PersonDetailsResponse = await axios({
    method: "get",
    baseURL: `https://api.themoviedb.org/3/person/${personId}`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  return results.data;
}
