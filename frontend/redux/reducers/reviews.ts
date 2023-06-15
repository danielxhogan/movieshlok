import { getReviews, postReview, Review, ReturnedNewReview } from "@/redux/actions/reviews";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";


// TYPES
// *****************************
// GET ALL REVIEWS FOR A MOVIE
// *****************************

// type for value of reviews variable in redux store
interface Reviews {
  status: Status;
  success: boolean | null;
  message: string;
  data: {
    reviews?: [Review]
  }
}

// default value for reviews
const initialReviewsState: Reviews = {
  status: "idle",
  success: null,
  message: "",
  data: {}
}

// CREATE A NEW REVIEW IN THE DATABASE TYPES
// ******************************************

// type for value of newReview variable in redux store
interface NewReview {
  status: Status;
  success: boolean | null;
  message: string;
  data: ReturnedNewReview | null;
}

// default value for newReview
const initialNewReviewState: NewReview = {
  status: "idle",
  success: null,
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
      state.data.reviews?.push(action.payload.newReview)
    }
  },
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

export const { addNewReview } = reviewsSlice.actions;
export const selectReveiws = (state: AppState) => state.reviews;
export const reviewsReducer = reviewsSlice.reducer;


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
      state.message = ""
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postReview.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.data = null
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.data = action.payload.data
      })
  }
});

export const { resetNewReview } = newReviewSlice.actions;
export const selectNewReview = (state: AppState) => state.newReview;
export const newReviewReducer = newReviewSlice.reducer;