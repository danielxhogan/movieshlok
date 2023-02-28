import { movieDetailsEnum } from "@/redux/types/movieDetails"; 

import { AnyAction } from "redux";
import axios from "axios";

export const getMovieDetailsAction = (movieId: string) => async (dispatch: any) => {
  try {
    const movieDetails = await axios({
      url: `${process.env.TMDB_BASE_URL}/movie/${movieId}`,
      method: "GET",
      params: {
        "api_key": `${process.env.TMDB_API_KEY}`
      }
    })

    if (movieDetails.statusText === "OK") {
      dispatch({
        type: movieDetailsEnum.GET_MOVIE_DETAILS_SUCESS,
        payload: movieDetails.data
      })
    }
  } catch (err: any) {
    console.log(`getMovieDetailsAction error: ${err.message}`)
    dispatch({
      type: movieDetailsEnum.GET_MOVIE_DETAILS_ERROR,
      payload: err.message
    })
  }
}

export const getMovieVideosAction = (movieId: string) => async (dispatch: any) => {
  try {
    const video = await axios({
      url: `${process.env.TMDB_BASE_URL}/movie/${movieId}/videos`,
      method: "GET",
      params: {
        "api_key": `${process.env.TMDB_API_KEY}`
      }
    })

    if (video.statusText === "OK") {
      dispatch({
        type: movieDetailsEnum.GET_MOVIE_VIDEOS_SUCESS,
        payload: video.data
      })
    }
  } catch (err: any) {
    console.log(`getMovieDetailsAction error: ${err.message}`)
    dispatch({
      type: movieDetailsEnum.GET_MOVIE_VIDEOS_ERROR,
      payload: err.message
    })
  }
}