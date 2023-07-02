import { Rating } from "@/components/Stars";

import { createAsyncThunk } from "@reduxjs/toolkit";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

// TYPES
// *****************************

// GET ALL REVIEWS FOR A MOVIE
// *****************************
// passed in when getReviews action is dispatched,
// sent to the /reviews endpoint
export interface GetReviewsRequest {
  movie_id: string;
  page: number;
}

// review type received from api by getReviews action when all reviews are fetched for a movie
export interface Review {
  id: string;
  user_id: string;
  username: string;
  movie_id: string;
  rating: number;
  review: string;
  created_at: number;
}

// payload sent by getReviews action to reviewsSlice reducer
interface ReviewsResultsPayload {
  success: boolean;
  message: string;
  page: number;
  total_pages: number | null;
  data: {
    reviews?: [Review]
  };
}

// GET RATING AND LIKE FOR A MOVIE
// ********************************
// passed in to getRatingLike Action when user views movie details page if logged in
export interface UserMovie {
  jwt_token: string;
  movie_id: string;
}

// used to set the default value for the stars widget, and heart icon
export interface RatingLikeResponse {
  rating: Rating;
  liked: boolean;
}

// payload sent to ratingLikeSlice reducer used to set value of ratingLike in redux store
interface RatingLikePayload {
  success: boolean;
  message: string;
  code: number;
  data: RatingLikeResponse | null;
}

// GET ALL RATINGS FOR A USER
// ***************************
export interface GetRatingsRequest {
  username: string,
  page: number
}

export interface RatingReview {
  movie_id: string;
  movie_title: string;
  poster_path: string;
  rating: number;
  liked: boolean;
  review_id: string | null;
  timestamp: number;
}

interface GetRatingsPayload {
  success: boolean;
  message: string;
  page: number;
  total_pages: number | null;
  ratings: RatingReview[] | null
}

// CREATE A NEW REVIEW IN THE DATABASE TYPES
// ******************************************
// passed in when postReview action is dispatched
export interface NewReview {
  jwt_token: string;
  movieId: string;
  movie_title: string;
  poster_path: string;
  review: string;
  rating: Rating;
  liked: boolean;
}

// if new review is created in the database, this is the returned review
export interface ReturnedNewReview {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  review: string;
  created_at: number;
}

// payload sent to newReviewSlice reducer used to set value of newReview in redux store
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
  async (getReviewsRequest: GetReviewsRequest): Promise<ReviewsResultsPayload> => {
    const limit = 10;
    const offset = (getReviewsRequest.page - 1) * limit;

    const getReviewsUrl = `${BACKEND_URL}/get-reviews`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("movie_id", getReviewsRequest.movie_id);
    params.append("offset", offset.toString());
    params.append("limit", limit.toString());

    const request = new Request(getReviewsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      const total_results = data.total_results;
      const total_pages = Math.ceil(total_results / limit);
      return {
        success: true,
        message: "ok",
        page: getReviewsRequest.page,
        total_pages,
        data: { reviews: data.reviews }
      };

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        page: getReviewsRequest.page,
        total_pages: null,
        data: {}
      };

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        page: getReviewsRequest.page,
        total_pages: null,
        data: {}
      };
    }
  }
);

// GET RATING AND LIKE FOR A MOVIE
// ********************************
export const getRatingLike = createAsyncThunk(
  "reviews/ratingLike",
  async (userMovie: UserMovie): Promise<RatingLikePayload> => {
    const ratingLikeUrl = `${BACKEND_URL}/get-rating-like`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", userMovie.jwt_token);
    params.append("movie_id", userMovie.movie_id);

    const request = new Request(ratingLikeUrl, { headers, body:params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        code: response.status,
        data
      };

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        data: null
      };

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        data: null
      };
    }
  }
);

// GET ALL RATINGS FOR A USER
// ***************************
export const getRatings = createAsyncThunk(
  "ratings/getRatings",
  async(getRatingsRequest: GetRatingsRequest): Promise<GetRatingsPayload> => {
    console.log(getRatingsRequest.username);
    const limit = 10;
    const offset = (getRatingsRequest.page - 1) * limit;

    const getRatingsUrl = `${BACKEND_URL}/get-ratings`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("username", getRatingsRequest.username);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    const request = new Request(getRatingsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        page: getRatingsRequest.page,
        total_pages: data.total_pages,
        ratings: data.ratings
      }

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        page: getRatingsRequest.page,
        total_pages: null,
        ratings: null
      }

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        page: getRatingsRequest.page,
        total_pages: null,
        ratings: null
      }

    }
  }
);

// CREATE A NEW REVIEW IN THE DATABASE
// ************************************
export const postReview = createAsyncThunk(
  "reviews/postReview",
  async (newReview: NewReview): Promise<NewReviewPayload> => {
    const postReviewUrl = `${BACKEND_URL}/post-review`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Cookie", `jwt_token=${newReview.jwt_token}`)

    const params = new URLSearchParams();
    params.append("jwt_token", newReview.jwt_token);
    params.append("movie_id", newReview.movieId);
    params.append("movie_title", newReview.movie_title);
    params.append("poster_path", newReview.poster_path);
    params.append("review", newReview.review);
    params.append("rating", newReview.rating.toString());
    params.append("liked", newReview.liked.toString());

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
      };

    } else if (response.status >= 500) {
      return {
        success: false,
        code: response.status,
        message: "server error",
        data: null
      };

    } else {
      const data = await response.json();
      return {
        success: false,
        code: response.status,
        message: data.message,
        data: null
      };
    }
  }
)