import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

import { createAsyncThunk } from "@reduxjs/toolkit";

import { FilterResults } from "@/pages/search";

export interface SearchParams {
  query: string;
  page: string;
  filter: FilterResults
}

export interface SearchResultsPayload {
  success: boolean;
  message: string;
  query: string;
  filter: FilterResults;
  data: {};
};

export interface MovieDetailsPayload {
  success: boolean;
  message: string;
  data: {};
};

export const getSearchResults = createAsyncThunk(
  "searchResults/fetchResults",
  async (searchParams: SearchParams): Promise<SearchResultsPayload> => {

    // calculate endpoint to send request to based on filter value
    type Endpoint = "multi" | "movie" | "person" | "";
    let endpoint: Endpoint = "";
    console.log("1");

    switch (searchParams.filter) {
      case FilterResults.ALL: endpoint = "multi"; break;
      case FilterResults.MOVIES: endpoint = "movie"; break;
      case FilterResults.CAST_AND_CREW: endpoint = "person"; break;
    }
    console.log("2");

    // construct the request
    const searchUrl = `${BACKEND_URL}/tmdb/search`;
    console.log("3");

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    console.log("4");

    const params = new URLSearchParams();
    params.append("query", searchParams.query);
    params.append("page", searchParams.page);
    params.append("endpoint", endpoint);
    console.log("5");

    // make the request
    const request = new Request(searchUrl, { headers, body: params, method: "POST" });
    console.log("here");
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
)

export const getMovieDetails = createAsyncThunk(
  "movieDetails/fetchDetails",
  async (movieId: string): Promise<MovieDetailsPayload> => {
    const movieDetailsUrl = `${BACKEND_URL}/tmdb/movie`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("movie_id", movieId);

    const request = new Request(movieDetailsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: movieId, data };

    } else if (response.status >= 500) {
      return { success: false, message: "server error", data: {} };

    } else {
      const data = await response.json();
      return { success: false, message: data.message, data: {} };
    }
  }
)