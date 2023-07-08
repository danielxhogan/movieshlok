import { authSliceReducer } from "@/redux/reducers/auth";
import { searchResultsReducer, movieDetailsReducer } from "@/redux/reducers/tmdb";
import {
  reviewsReducer,
  ratingLikeReducer,
  ratingsReducer,
  newReviewReducer,
} from "@/redux/reducers/reviews";
import {
  reviewDetailsReducer,
  newCommentReducer,
  deletedReviewReducer,
  deletedCommentReducer
} from "@/redux/reducers/review";
import {
  listsReducer,
  listItemsReducer,
  watchlistReducer,
  newListReducer,
  newListItemReducer,
  deletedListReducer,
  deletedListItemReducer
} from "./lists";
import { combineReducers } from 'redux';

export type Status = "fulfilled" | "loading" | "idle";

const reducers = combineReducers({
  credentials: authSliceReducer,
  searchResults: searchResultsReducer,

  // on page load movie details page
  movieDetails: movieDetailsReducer,
  reviews: reviewsReducer,
  ratingLike: ratingLikeReducer,

  // actions available on movie details page
  newReview: newReviewReducer,
  deletedReview: deletedReviewReducer,
  lists: listsReducer,
  newList: newListReducer,
  newListItem: newListItemReducer,

  // review details page
  reviewDetails: reviewDetailsReducer,
  newComment: newCommentReducer,
  deletedComment: deletedCommentReducer,

  // ratings page
  ratings: ratingsReducer,

  // list/watchlist pages
  listItems: listItemsReducer,
  watchlist: watchlistReducer,
  deletedList: deletedListReducer,
  deletedListItem: deletedListItemReducer
});

export default reducers;