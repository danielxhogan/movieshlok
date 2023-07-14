const BACKEND_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

import { createAsyncThunk } from "@reduxjs/toolkit";

import { FilterResults } from "@/pages/search";

export interface SearchParams {
  query: string;
  page: string;
  filter: FilterResults;
}

export interface SearchResultsPayload {
  success: boolean;
  message: string;
  query: string;
  filter: FilterResults;
  data: {};
}

export interface MovieDetailsPayload {
  success: boolean;
  message: string;
  data: {};
}

export interface PersonCredit {
  adult?: boolean;
  backdrop_path?: string;
  genre_ids?: number[];
  id?: number;
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  credit_id?: string;

  // cast
  character?: string;
  order?: number;

  // crew
  department?: string;
  job?: string;
}

interface PersonCredits {
  cast: PersonCredit[];
  crew: PersonCredit[];
}

export interface PersonData {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string;
  deathday: string;
  gender: number;
  homepage: string;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string;
  credits: PersonCredits;
}

interface PersonDetailsPayload {
  success: boolean;
  message: string;
  details: PersonData | null;
}

export const getSearchResults = createAsyncThunk(
  "searchResults/fetchResults",
  async (searchParams: SearchParams): Promise<SearchResultsPayload> => {
    // calculate endpoint to send request to based on filter value
    type Endpoint = "multi" | "movie" | "person" | "";
    let endpoint: Endpoint = "";

    // prettier-ignore
    switch (searchParams.filter) {
      case FilterResults.ALL:endpoint = "multi"; break;
      case FilterResults.MOVIES:endpoint = "movie"; break;
      case FilterResults.CAST_AND_CREW:endpoint = "person"; break;
    }

    // construct the request
    const searchUrl = `${BACKEND_URL}/tmdb/search`;
    console.log(searchUrl);

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("query", searchParams.query);
    params.append("page", searchParams.page);
    params.append("endpoint", endpoint);

    // make the request
    const request = new Request(searchUrl, {
      headers,
      body: params,
      method: "POST"
    });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        query: searchParams.query,
        filter: searchParams.filter,
        data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        query: searchParams.query,
        filter: searchParams.filter,
        data: {}
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        query: searchParams.query,
        filter: searchParams.filter,
        data: {}
      };
    }
  }
);

export const getMovieDetails = createAsyncThunk(
  "movieDetails/fetchDetails",
  async (movieId: string): Promise<MovieDetailsPayload> => {
    const movieDetailsUrl = `${BACKEND_URL}/tmdb/movie`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("movie_id", movieId);

    const request = new Request(movieDetailsUrl, {
      headers,
      body: params,
      method: "POST"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();

      return {
        success: true,
        message: movieId,
        data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        data: {}
      };
    } else {
      const data = await response.json();

      return {
        success: false,
        message: data.message,
        data: {}
      };
    }
  }
);

export const getPersonDetails = createAsyncThunk(
  "personDetails/fetchDetails",
  async (personId: string): Promise<PersonDetailsPayload> => {
    const movieDetailsUrl = `${BACKEND_URL}/tmdb/person`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("person_id", personId);

    const request = new Request(movieDetailsUrl, {
      headers,
      body: params,
      method: "POST"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();

      return {
        success: true,
        message: personId,
        details: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        details: null
      };
    } else {
      const data = await response.json();

      return {
        success: false,
        message: data.message,
        details: null
      };
    }
  }
);
