import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

import { createAsyncThunk } from "@reduxjs/toolkit";

export interface ReviewsResultsPayload {
  success: boolean;
  message: string;
  data: {};
}

export const getReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (movieId: string): Promise<ReviewsResultsPayload> => {
    const getReviewsUrl = `${BACKEND_URL}/reviews`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("movie_id", movieId);

    const request = new Request(getReviewsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        data
      }

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        data: {}
      }

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        data: {}
      }
    }
  }
)