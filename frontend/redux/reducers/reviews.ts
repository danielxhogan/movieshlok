import { getReviews } from "../actions/reviews";
import { AppState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";


interface Review {
  id: string;
  user_id: string;
  movie_id: string;
  rating?: number;
  review: string;
  liked?: boolean;

}

// MAIN RESPONSE
interface Reviews {
  status: string;
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