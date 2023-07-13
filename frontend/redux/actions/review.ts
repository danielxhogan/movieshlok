import { createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

// TYPES
// *******************************

// GET REVIEW, LIKE, AND COMMENTS
// *******************************
// type passed in to getReview action
export interface GetReviewRequest {
  review_id: string;
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
  comments: Comment[];
}

// payload sent by getReview to reviewDetails reducer
interface GetReviewPayload {
  success: boolean;
  message: string;
  data: ReviewDetails | null;
}

// POST NEW COMMENT IN DATABASE
// *******************************
// type passed in to postComment action
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

// DELETE REVIEW
// **************
// type passed in to deleteReview action
export interface DeleteReviewRequest {
  jwt_token: string;
  review_id: string;
  movie_id: string;
}

export interface ReturnedDeletedReview {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  review: string;
  created_at: number;
}

interface DeleteReviewPayload {
  success: boolean;
  message: string;
  code: number;
  review: ReturnedDeletedReview | null;
}

// DELETE COMMENT
// ***************
// type passed in to deleteComment action
export interface DeleteCommentRequest {
  jwt_token: string;
  comment_id: string;
}

export interface ReturnedDeletedComment {
  id: string;
  user_id: string;
  review_id: string;
  comment: string;
  created_at: number;
}

interface DeleteCommentPayload {
  success: boolean;
  message: string;
  code: number;
  comment: ReturnedDeletedComment | null;
}

// ACTIONS
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************

export const getReviewDetails = createAsyncThunk(
  "review/getReview",
  async (getReviewRequest: GetReviewRequest): Promise<GetReviewPayload> => {
    const getReviewsUrl = `${BACKEND_URL}/get-review`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("review_id", getReviewRequest.review_id);

    const request = new Request(getReviewsUrl, {
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
        data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        data: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        data: null
      };
    }
  }
);

// POST NEW COMMENT IN DATABASE
// *******************************
export const postComment = createAsyncThunk(
  "review/postComment",
  async (newComment: NewComment): Promise<NewCommentPayload> => {
    const postCommentUrl = `${BACKEND_URL}/post-comment`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", newComment.jwt_token);
    params.append("review_id", newComment.review_id);
    params.append("comment", newComment.comment);

    const request = new Request(postCommentUrl, {
      body: params,
      method: "POST"
    });

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
);

// DELETE REVIEW
// **************
export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (deleteRequest: DeleteReviewRequest): Promise<DeleteReviewPayload> => {
    const deleteReviewUrl = `${BACKEND_URL}/delete-review`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", deleteRequest.jwt_token);
    params.append("review_id", deleteRequest.review_id);
    params.append("movie_id", deleteRequest.movie_id);

    const request = new Request(deleteReviewUrl, {
      headers,
      body: params,
      method: "DELETE"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        code: response.status,
        review: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        review: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        review: null
      };
    }
  }
);

// DELETE COMMENT
// ***************
export const deleteComment = createAsyncThunk(
  "review/deleteComment",
  async (
    deleteRequest: DeleteCommentRequest
  ): Promise<DeleteCommentPayload> => {
    const deleteCommentUrl = `${BACKEND_URL}/delete-comment`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", deleteRequest.jwt_token);
    params.append("comment_id", deleteRequest.comment_id);

    const request = new Request(deleteCommentUrl, {
      headers,
      body: params,
      method: "DELETE"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        code: response.status,
        comment: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        comment: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        comment: null
      };
    }
  }
);
