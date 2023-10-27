import { env } from "@/env.mjs";
import axios from "axios";

interface MovieDetailsResponse {
  data: MovieDetails;
}
interface MovieDetails {
  id: number;
  title: string;
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
