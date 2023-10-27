import { env } from "@/env.mjs";
import axios from "axios";

interface MovieDetailsResponse {
  data: MovieDetails;
}
interface MovieDetails {
  id: number;
  title: string;
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
    baseURL: `https://api.themoviedb.org/3/movie/${movieId}`,
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
