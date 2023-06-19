import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

import { createAsyncThunk } from "@reduxjs/toolkit";

// TYPES
// *****************************
// GET ALL REVIEWS FOR A MOVIE
// *****************************

// review type received from api by getReviews action when all reviews are fetched for a movie
export interface Review {
  id: string;
  user_id: string;
  username: string;
  movie_id: string;
  rating?: number;
  review: string;
  liked?: boolean;
  created_at: number;
}

// payload sent by getReviews action to reviewsSlice reducer
interface ReviewsResultsPayload {
  success: boolean;
  message: string;
  data: {
    reviews?: [Review]
  };
}

// CREATE A NEW REVIEW IN THE DATABASE TYPES
// ******************************************

// passed in when postReview action is dispatched
export interface NewReview {
  movieId: string;
  review: string;
  jwt_token: string;
}

// if new review is created in the database, this is the returned review
export interface ReturnedNewReview {
  id: string;
  user_id: string;
  movie_id: string;
  rating?: number;
  review: string;
  liked?: boolean;
  created_at: number;
}

// payload sent by postReview action to newReviewSlice reducer
interface NewReviewPayload {
  success: boolean;
  code: number;
  message: string;
  data: ReturnedNewReview | null
}

// ACTIONS
// ****************************
// GET ALL REVIEWS FOR A MOVIE
// ****************************

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

// CREATE A NEW REVIEW IN THE DATABASE
// ************************************

export const postReview = createAsyncThunk(
  "reviews/postReview",
  async (newReview: NewReview): Promise<NewReviewPayload> => {
    const postReviewUrl = `${BACKEND_URL}/review`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Cookie", `jwt_token=${newReview.jwt_token}`)

    const params = new URLSearchParams();
    params.append("movie_id", newReview.movieId);
    params.append("review", newReview.review);
    params.append("jwt_token", newReview.jwt_token);

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
      const data = await response.json();

      return {
        success: true,
        code: response.status,
        message: "ok",
        data
      }
    } else if (response.status >= 500) {
      return {
        success: false,
        code: response.status,
        message: "server error",
        data: null
      }
    } else {
      const data = await response.json();
      return {
        success: false,
        code: response.status,
        message: data.message,
        data: null
      }
    }
  }
)