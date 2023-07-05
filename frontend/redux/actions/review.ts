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
  username: string;
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

// POST NEW COMMENT IN DATABASE
// *******************************

export interface NewComment {
  jwt_token: string;
  review_id: string;
  comment: string;
}

export interface ReturnedNewComment {
  id: string;
  user_id: string;
  review_id: string;
  comment: string;
  created_at: number;
}

interface NewCommentPayload {
  success: boolean;
  code: number;
  message: string;
  data: ReturnedNewComment | null;
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
);

// POST NEW COMMENT IN DATABASE
// *******************************
export const postComment = createAsyncThunk(
  "review/postComment",
  async(newComment: NewComment): Promise<NewCommentPayload> => {
    const postCommentUrl = `${BACKEND_URL}/post-comment`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", newComment.jwt_token);
    params.append("review_id", newComment.review_id);
    params.append("comment", newComment.comment);

    const request = new Request(postCommentUrl, { body: params, method: "POST" });
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
);