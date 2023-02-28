import { combineReducers } from 'redux';

import {
  getMovieDetailsReducer,
  getMovieVideosReducer
} from "@/redux/reducers/movieDetails";

const reducers = combineReducers({
  movieDetails: getMovieDetailsReducer,
  movieVideos: getMovieVideosReducer 
});

export default reducers;
