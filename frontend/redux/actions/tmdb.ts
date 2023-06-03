import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

import { createAsyncThunk } from "@reduxjs/toolkit";

export interface SearchParams {
  query: string;
  page: string;
  endpoint: string;
}

export interface Payload {
  success: boolean;
  message: string;
  data: {};
}

export const getSearchResults = createAsyncThunk(
  "searchResults/fetchResults",
  async (searchParams: SearchParams): Promise<Payload> => {
    const searchUrl = `${BACKEND_URL}/tmdb/search`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("query", searchParams.query);
    params.append("page", searchParams.page);
    params.append("endpoint", searchParams.endpoint);

    const request = new Request(searchUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: "ok", data };

    } else if (response.status >= 500) {
      return { success: false, message: "server error", data: {} };

    } else {
      const data = await response.json();
      return { success: false, message: data.message, data: {} };
    }
  }
)

export const getMovieDetails = createAsyncThunk(
  "movieDetails/fetchDetails",
  async (movieId: string): Promise<Payload> => {
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