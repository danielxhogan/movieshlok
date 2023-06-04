import { authSliceReducer } from "@/redux/reducers/auth";
import { searchResultsReducer, movieDetailsReducer } from "@/redux/reducers/tmdb";
import { reviewsReducer } from "@/redux/reducers/reviews";
import { combineReducers } from 'redux';

const reducers = combineReducers({
  credentials: authSliceReducer,
  searchResults: searchResultsReducer,
  movieDetails: movieDetailsReducer,
  reviews: reviewsReducer
});

export default reducers;