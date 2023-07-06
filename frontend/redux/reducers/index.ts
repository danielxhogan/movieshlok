import { authSliceReducer } from "@/redux/reducers/auth";
import { searchResultsReducer, movieDetailsReducer } from "@/redux/reducers/tmdb";
import {
  reviewsReducer,
  ratingLikeReducer,
  ratingsReducer,
  newReviewReducer
} from "@/redux/reducers/reviews";
import { reviewDetailsReducer, newCommentReducer } from "@/redux/reducers/review";
import {
  listsReducer,
  listItemsReducer,
  watchlistReducer,
  newListReducer,
  newListItemReducer
} from "./lists";
import { combineReducers } from 'redux';

export type Status = "fulfilled" | "loading" | "idle";

const reducers = combineReducers({
  credentials: authSliceReducer,
  searchResults: searchResultsReducer,
  movieDetails: movieDetailsReducer,
  reviews: reviewsReducer,
  ratingLike: ratingLikeReducer,
  newReview: newReviewReducer,
  reviewDetails: reviewDetailsReducer,
  newComment: newCommentReducer,
  ratings: ratingsReducer,
  lists: listsReducer,
  newList: newListReducer,
  newListItem: newListItemReducer,
  listItems: listItemsReducer,
  watchlist: watchlistReducer
});

export default reducers;