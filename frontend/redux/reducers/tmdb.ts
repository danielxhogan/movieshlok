import { getSearchResults } from "@/redux/actions/tmdb";
import { AppState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";

export interface KnownFor {
  id: number;
  title: string;
  media_type: string;
}

export interface Result {
  id: number;
  popularity: number;
  media_type?: string;    // only multi
  title?: string;         // only movie
  poster_path?: string;   // only movie
  overview?: string;      // only movie
  release_date?: string;  // only movie
  vote_average?: number;  // only movie
  vote_count?: number;    // only movie
  name?: string;          // only person
  profile_path?: string;  // only person
  known_for?: KnownFor[];
}

interface SearchResults {
  status: string;
  success: boolean | null;
  message: string;
  data: {
    page?: string
    results?: [Result]
    total_pages?: string
  };
}

const initialState: SearchResults = {
  status: "idle",
  success: null,
  message: "",
  data: {}
}


export const searchResultsSlice = createSlice({
  name: "searchResults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.status = "loading";
        state.success = null;
        state.message = "";
        state.data = {};
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.status = "fullfilled";
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.data = action.payload.data;
      })
  }
});

export const selectSearchResults = (state: AppState) => state.searchResults;
export const searchResultsReducer = searchResultsSlice.reducer;