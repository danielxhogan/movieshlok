import {
  getReviews,
  getRatingLike,
  postReview,
  Review,
  RatingLikeResponse,
  ReturnedNewReview
} from "@/redux/actions/reviews";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";


// TYPES
// *****************************
// GET ALL REVIEWS FOR A MOVIE
// *****************************

// type for value of reviews variable in redux store
interface Reviews {
  status: Status;
  success: boolean | null;
  message: string;
  page: number;
  total_pages: number | null;
  data: {
    reviews?: [Review]
  }
}

// default value for reviews
const initialReviewsState: Reviews = {
  status: "idle",
  success: null,
  message: "",
  page: 0,
  total_pages: null,
  data: {}
}

// GET RATING AND LIKE FOR A MOVIE
// ********************************

// type for value of rating/like in redux store
interface RatingLike {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  data: RatingLikeResponse | null;
}

const intialRatingLikeState: RatingLike = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  data: null
}

// CREATE A NEW REVIEW IN THE DATABASE TYPES
// ******************************************

// type for value of newReview variable in redux store
interface NewReview {
  status: Status;
  success: boolean | null;
  code: number | null;
  message: string;
  data: ReturnedNewReview | null;
}

// default value for newReview
const initialNewReviewState: NewReview = {
  status: "idle",
  success: null,
  code: null,
  message: "",
  data: null
}

// REDUCERS
// ****************************
// GET ALL REVIEWS FOR A MOVIE
// ****************************

// this reducer sets the value for reviews in redux store
export const reviewsSlice = createSlice({
  name: "reviews",
  initialState: initialReviewsState,
  reducers: {
    addNewReview(state, action) {
      state.data.reviews?.unshift(action.payload.newReview);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.page = 1,
        state.total_pages = null,
        state.data = {}
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = true,
        state.message = action.payload.message,
        state.page = action.payload.page,
        state.total_pages = action.payload.total_pages,
        state.data = action.payload.data
      })
  }
});

export const { addNewReview } = reviewsSlice.actions;
export const selectReveiws = (state: AppState) => state.reviews;
export const reviewsReducer = reviewsSlice.reducer;

// GET RATING AND LIKE FOR A MOVIE
// ********************************
export const ratingLikeSlice = createSlice({
  name: "ratingLike",
  initialState: intialRatingLikeState,
  reducers: {
    unsetRatingLike(state) {
      state.status = "idle";
      state.success = null;
      state.code = null;
      state.message = "";
      state.data = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRatingLike.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.code = null,
        state.data = null
      })
      .addCase(getRatingLike.fulfilled, (state,action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.code = action.payload.code,
        state.data = action.payload.data
      })
  }

});

export const { unsetRatingLike } = ratingLikeSlice.actions;
export const selectRatingLike = (state: AppState) => state.ratingLike;
export const ratingLikeReducer = ratingLikeSlice.reducer;

// CREATE A NEW REVIEW IN THE DATABASE
// ************************************

// this reducer sets the value for newReview in redux store
export const newReviewSlice = createSlice({
  name: "newReview",
  initialState: initialNewReviewState,
  reducers: {
    resetNewReview(state) {
      state.status = "idle",
      state.success = null,
      state.code = null,
      state.message = "",
      state.data = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postReview.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.code = null,
        state.message = "",
        state.data = null
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.code = action.payload.code,
        state.message = action.payload.message,
        state.data = action.payload.data
      })
  }
});

export const { resetNewReview } = newReviewSlice.actions;
export const selectNewReview = (state: AppState) => state.newReview;
export const newReviewReducer = newReviewSlice.reducer;