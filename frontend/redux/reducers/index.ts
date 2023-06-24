import { authSliceReducer } from "@/redux/reducers/auth";
import { searchResultsReducer, movieDetailsReducer } from "@/redux/reducers/tmdb";
import { reviewsReducer, ratingLikeReducer, newReviewReducer } from "@/redux/reducers/reviews";
import { reviewDetailsReducer } from "@/redux/reducers/review";
import { combineReducers } from 'redux';

export type Status = "fulfilled" | "loading" | "idle";

const reducers = combineReducers({
  credentials: authSliceReducer,
  searchResults: searchResultsReducer,
  movieDetails: movieDetailsReducer,
  reviews: reviewsReducer,
  ratingLike: ratingLikeReducer,
  newReview: newReviewReducer,
  reviewDetails: reviewDetailsReducer
});

export default reducers;