import { getReviews, postReview } from "../actions/reviews";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";


// GET REVEIWS
// **********************************
export interface Review {
  id: string;
  user_id: string;
  username: string;
  movie_id: string;
  rating?: number;
  review: string;
  liked?: boolean;

}

// MAIN RESPONSE
interface Reviews {
  status: Status;
  success: boolean | null;
  message: string;
  data: {
    reviews?: [Review]
  }
}

// INITIAL STATE
const initialReviewsState: Reviews = {
  status: "idle",
  success: null,
  message: "",
  data: {}
}

// NEW REVIEW
// **********************************
interface NewReview {
  status: Status;
  success: boolean | null;
  message: string;
}

const initialNewReviewState: NewReview = {
  status: "idle",
  success: null,
  message: ""
}

export const reviewsSlice = createSlice({
  name: "reviews",
  initialState: initialReviewsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.data = {}
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = true,
        state.message = action.payload.message,
        state.data = action.payload.data
      })
  }
});

export const selectReveiws = (state: AppState) => state.reviews;
export const reviewsReducer = reviewsSlice.reducer;

export const newReviewSlice = createSlice({
  name: "newReview",
  initialState: initialNewReviewState,
  reducers: {
    resetNewReview(state) {
      state.status = "idle",
      state.success = null,
      state.message = ""
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postReview.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = ""
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message
      })
  }
});

export const { resetNewReview } = newReviewSlice.actions;
export const selectNewReview = (state: AppState) => state.newReview;
export const newReviewReducer = newReviewSlice.reducer;