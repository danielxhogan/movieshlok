import { createAsyncThunk } from "@reduxjs/toolkit";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

// TYPES
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************

// passed in when getReview action is dispatched,
// sent to the /get-review endpoint
export interface GetReviewRequest {
  review_id: string;
  page: number;
}

export interface Comment {
  id: string;
  user_id: string;
  review_id: string;
  comment: string;
  created_at: number;
}

export interface ReviewDetails {
  review: {
    id: string;
    user_id: string;
    movie_id: string;
    review: string;
    rating: number;
    created_at: number;
  };
  liked: boolean;
  comments: [Comment];
}

// payload sent by getReview to reviewDetails reducer
interface GetReviewPayload {
  success: boolean;
  message: string;
  page: number;
  total_pages: number | null;
  data: ReviewDetails | null;
}

// ACTIONS
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************

export const getReviewDetails = createAsyncThunk(
  "review/getReview",
  async (getReviewRequest: GetReviewRequest): Promise<GetReviewPayload> => {
    const limit = 10;
    const offset = (getReviewRequest.page - 1) * limit;

    const getReviewsUrl = `${BACKEND_URL}/get-review`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("review_id", getReviewRequest.review_id);
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
        page: getReviewRequest.page,
        total_pages,
        data
      }

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        page: 0,
        total_pages: null,
        data: null
      }

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        page: 0,
        total_pages: null,
        data: null
      }
    }
  }
)