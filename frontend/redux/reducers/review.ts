import { getReviewDetails, ReviewDetails } from "../actions/review";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";

// TYPES
// *******************************
// GET REVIEW, LIKE, AND COMMENTS
// *******************************
interface InitialReviewDetailsState {
  status: Status;
  success: boolean | null;
  message: string;
  page: number;
  total_pages: number | null;
  data: ReviewDetails | null;
}
const initialReviewDetailsState: InitialReviewDetailsState = {
  status: "idle",
  success: null,
  message: "",
  page: 0,
  total_pages: null,
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
  reducers: {},
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

export const selectReviewDetails = (state: AppState) => state.reviewDetails;
export const reviewDetailsReducer = reviewDetailsSlice.reducer;