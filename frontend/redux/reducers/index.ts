import { authSliceReducer } from "@/redux/reducers/auth";
import { searchResultsReducer, movieDetailsReducer } from "@/redux/reducers/tmdb";
import { combineReducers } from 'redux';

const reducers = combineReducers({
  credentials: authSliceReducer,
  searchResults: searchResultsReducer,
  movieDetails: movieDetailsReducer
});

export default reducers;