import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

import { createAsyncThunk } from "@reduxjs/toolkit";

interface ReviewsResultsPayload {
  success: boolean;
  message: string;
  data: {};
}

interface NewReview {
  movieId: string;
  review: string;
}

interface NewReviewPayload {
  success: boolean;
  message: string;
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

export const postReview = createAsyncThunk(
  "reviews/postReview",
  async (newReview: NewReview): Promise<NewReviewPayload> => {
    const postReviewUrl = `${BACKEND_URL}/review`;

    const cookies = document.cookie;
    const cookiesArray = cookies.split(";");
    let jwt_token: string;

    cookiesArray.forEach(cookie => {
      if (cookie.includes("jwt_token")) {
        jwt_token = cookie.split("=")[1];
      }
    });

    if (!jwt_token) {
      return {
        success: false,
        message: "must be logged in"
      }
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Cookie", `jwt_token=${jwt_token}`)

    const params = new URLSearchParams();
    params.append("movie_id", newReview.movieId);
    params.append("review", newReview.review);
    params.append("jwt_token", jwt_token);

    const request = new Request(postReviewUrl,
      {
        headers,
        credentials: "include",
        mode: "cors",
        body: params,
        method: "POST"
      }
    );

    const response = await fetch(request);

    if (response.ok) {
      return {
        success: true,
        message: "ok"
      }
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error"
      }
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message
      }
    }
  }
)