import {
  getReviewDetails,
  postComment,
  ReviewDetails,
  deleteReview,
  deleteComment,
  ReturnedNewComment,
  ReturnedDeletedReview,
  ReturnedDeletedComment
} from "../actions/review";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";

// TYPES
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************
// type for value of reviewDetails in redux store
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

// DELETE REVIEW
// **************
// type for value of deletedReview in redux store
interface DeletedReview {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  review: ReturnedDeletedReview | null;
}

const initialDeletedReviewState: DeletedReview = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  review: null
}

// DELETE COMMENT
// ***************
// type for value of deletedComment in redux store
interface DeletedComment {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  comment: ReturnedDeletedComment | null;
}

const initialDeletedCommentState: DeletedComment = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  comment: null
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
    },
    removeDeletedComment(state, action) {
      if (state.data) {
        const newComments = state.data.comments.filter(comment => comment.id !== action.payload.commentId);
        state.data.comments = newComments;
      }
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
export const { removeDeletedComment } = reviewDetailsSlice.actions;
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

// DELETE REVIEW
// **************
// this reducer sets the value for deletedReview in redux store
export const deletedReviewSlice = createSlice({
  name: "deletedReviewItem",
  initialState: initialDeletedReviewState,
  reducers: {
    resetDeletedReview(state) {
      state.status = "idle",
      state.success = null,
      state.message = "",
      state.code = null,
      state.review = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteReview.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.code = null,
      state.review = null
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.code = action.payload.code,
        state.review = action.payload.review
      })
  }
});

export const { resetDeletedReview } = deletedReviewSlice.actions;
export const selectDeletedReview = (state: AppState) => state.deletedReview;
export const deletedReviewReducer = deletedReviewSlice.reducer;

// DELETE COMMENT
// ***************
// this reducer sets the value for deletedComment in redux store
export const deletedCommentSlice = createSlice({
  name: "deletedCommentItem",
  initialState: initialDeletedCommentState,
  reducers: {
    resetDeletedComment(state) {
      state.status = "idle",
      state.success = null,
      state.message = "",
      state.code = null,
      state.comment = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteComment.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.code = null,
      state.comment = null
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.code = action.payload.code,
        state.comment = action.payload.comment
      })
  }
});

export const { resetDeletedComment } = deletedCommentSlice.actions;
export const selectDeletedComment = (state: AppState) => state.deletedComment;
export const deletedCommentReducer = deletedCommentSlice.reducer;