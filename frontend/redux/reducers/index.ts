import { authSliceReducer } from "@/redux/reducers/auth";
import { combineReducers } from 'redux';

const reducers = combineReducers({
  credentials: authSliceReducer,
});

export default reducers;





// import { combineReducers } from 'redux';

// import {
//   getMovieDetailsReducer,
//   getMovieVideosReducer
// } from "@/redux/reducers/movieDetails";

// const reducers = combineReducers({
//   movieDetails: getMovieDetailsReducer,
//   movieVideos: getMovieVideosReducer 
// });

// export default reducers;
