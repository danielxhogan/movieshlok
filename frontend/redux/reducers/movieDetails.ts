import { movieDetailsEnum } from "@/redux/types/movieDetails";

import { AnyAction } from "redux";

export const getMovieDetailsReducer = (state={}, action: AnyAction) => {
  switch (action.type) {
    case movieDetailsEnum.GET_MOVIE_DETAILS_SUCESS:
      return action.payload;

    case movieDetailsEnum.GET_MOVIE_DETAILS_ERROR:
      return {
        sucess: false,
        message: action.payload
      }

      default:
        return state;
  }
}

export const getMovieVideosReducer = (state={}, action: AnyAction) => {
  switch (action.type) {
    case movieDetailsEnum.GET_MOVIE_VIDEOS_SUCESS:
      return action.payload;

    case movieDetailsEnum.GET_MOVIE_VIDEOS_ERROR:
      return {
        sucess: false,
        message: action.payload
      }

      default:
        return state;
  }
}