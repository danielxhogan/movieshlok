import {
  getReviewDetails,
  postComment,
  ReviewDetails,
  ReturnedNewComment
} from "../actions/review";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";

// TYPES
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************
interface ReviewDetail {
  status: Status;
  success: boolean | null;
  message: string;
  page: number;
  total_pages: number | null;
  data: ReviewDetails | null;
}
const initialReviewDetailsState: ReviewDetail = {
  status: "idle",
  success: null,
  message: "",
  page: 0,
  total_pages: null,
  data: null
}

// POST NEW COMMENT IN DATABASE
// *******************************

// type for value of newComment in redux store
interface NewComment {
  status: Status,
  success: boolean | null,
  code: number | null,
  message: string;
  data: ReturnedNewComment | null
}

// default value for newComment
const intialNewCommentState: NewComment = {
  status: "idle",
  success: null,
  code: null,
  message: "",
  data: null
}

// REDUCERS
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************

// this reducer sets the vaule of reviewDetails in redux store
export const reviewDetailsSlice = createSlice({
  name: "reviewDetails",
  initialState: initialReviewDetailsState,
  reducers: {
    addNewComment(state, action) {
      state.data?.comments.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviewDetails.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.page = 0,
        state.total_pages = null,
        state.data = null
      })
      .addCase(getReviewDetails.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.page = action.payload.page,
        state.total_pages = action.payload.total_pages,
        state.data = action.payload.data
      })
  }
});

export const { addNewComment } = reviewDetailsSlice.actions;
export const selectReviewDetails = (state: AppState) => state.reviewDetails;
export const reviewDetailsReducer = reviewDetailsSlice.reducer;

// POST NEW COMMENT IN DATABASE
// *******************************

// this reducer sets the value for newComment in redux store
export const newCommentSlice = createSlice({
  name: "newComment",
  initialState: intialNewCommentState,
  reducers: {
    resetNewComment(state) {
      state.status = "idle",
      state.success = null,
      state.code = null,
      state.message = "",
      state.data = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postComment.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.code = null,
        state.message = "",
        state.data = null
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.code = action.payload.code,
        state.message = action.payload.message,
        state.data = action.payload.data
      })
  }
});

export const { resetNewComment } = newCommentSlice.actions;
export const selectNewComment = (state: AppState) => state.newComment;
export const newCommentReducer = newCommentSlice.reducer;