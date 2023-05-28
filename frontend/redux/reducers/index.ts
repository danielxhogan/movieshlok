import { authSliceReducer } from "@/redux/reducers/auth";
import { searchResultsReducer } from "@/redux/reducers/tmdb";
import { combineReducers } from 'redux';

const reducers = combineReducers({
  credentials: authSliceReducer,
  searchResults: searchResultsReducer
});

export default reducers;