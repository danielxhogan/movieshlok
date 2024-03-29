import { FilterResults } from "@/pages/search";
import {
  getSearchResults,
  getMovieDetails,
  getPersonDetails,
  PersonData
} from "@/redux/actions/tmdb";
import { Status } from "@/redux/reducers/index";
import { AppState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";

// MOVIE DETAILS
// **************************************************

// RESPONSE DATA
export interface Genre {
  id?: number;
  name?: string;
}

export interface ProductionCompany {
  id?: number;
  logo_path?: string;
  name?: string;
  origin_country?: string;
}

export interface ProductionCountry {
  iso_3166_1?: string;
  name?: string;
}

export interface Language {
  english_name?: string;
  iso_639_1?: string;
  name?: string;
}

// VIDEOS
export interface Video {
  iso_639_1?: string;
  iso_3166_1?: string;
  name?: string;
  key?: string;
  site?: string;
  size?: number;
  type?: string;
  official?: boolean;
  published_at?: string;
  id?: string;
}

export interface Videos {
  id?: number;
  results?: [Video];
}

// IMAGES
export interface MovieImage {
  aspect_ration?: number;
  height?: number;
  iso_639_1?: string;
  file_path?: string;
  vote_average?: number;
  vote_count?: number;
  width?: number;
}

interface Images {
  id?: number;
  backdrops?: [MovieImage];
  logos?: [MovieImage];
}

// CREDITS
export interface CastCrewMember {
  // cast & crew
  adult?: boolean;
  gener?: number;
  id: number;
  known_for_department?: string;
  name?: string;
  original_name?: string;
  popularity?: number;
  profile_path?: string;
  credit_id?: string;

  // cast
  cast_id?: number;
  character?: string;
  order?: number;

  // crew
  department?: string;
  job?: string;
}

interface Credits {
  id?: number;
  cast?: CastCrewMember[];
  crew?: CastCrewMember[];
}

// MAIN RESPONSE
export interface MovieDetails {
  status: Status;
  success: boolean | null;
  message: string;
  data: {
    adult?: boolean;
    backdrop_path?: string;
    budget?: number;
    genres?: [Genre];
    homepage?: string;
    id?: number;
    imdb_id?: string;
    original_language?: string;
    original_title?: string;
    overview?: string;
    popularity?: number;
    poster_path?: string;
    production_companies?: [ProductionCompany];
    production_countries?: [ProductionCountry];
    release_date?: string;
    revenue?: number;
    runtime?: number;
    spoken_languages?: [Language];
    status?: string;
    tagline?: string;
    title?: string;
    video?: boolean;
    vote_average?: number;
    vote_count?: number;
    videos?: Videos;
    images?: Images;
    credits?: Credits;
  };
}

// INITIAL STATE
const initialMovieDetailsState: MovieDetails = {
  status: "idle",
  success: null,
  message: "",
  data: {}
};

// SEARCH
// **************************************************

// RESPONSE DATA
export interface KnownFor {
  id: number;
  title: string;
  media_type: string;
}

export interface SearchResult {
  id: number;
  popularity: number;
  media_type?: string; // only multi
  title?: string; // only movie
  poster_path?: string; // only movie
  overview?: string; // only movie
  release_date?: string; // only movie
  vote_average?: number; // only movie
  vote_count?: number; // only movie
  name?: string; // only person
  profile_path?: string; // only person
  known_for?: KnownFor[]; // only person
  known_for_department?: string;
}

// MAIN RESPONSE
interface SearchResults {
  status: Status;
  success: boolean | null;
  message: string;
  query: string;
  filter: FilterResults | null;
  data: {
    page?: string;
    results?: [SearchResult];
    total_pages?: string;
  };
}

// INITIAL STATE
const initialSearchResultsState: SearchResults = {
  status: "idle",
  success: null,
  message: "",
  query: "",
  filter: null,
  data: {}
};

// PERSON DETAILS
// ****************************
interface PersonDetails {
  status: Status;
  success: boolean | null;
  message: string;
  details: PersonData | null;
}

const initialPersonDetailsState: PersonDetails = {
  status: "idle",
  success: null,
  message: "",
  details: null
};

export const searchResultsSlice = createSlice({
  name: "searchResults",
  initialState: initialSearchResultsState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getSearchResults.pending, state => {
        state.status = "loading";
        state.success = null;
        state.message = "";
        state.query = "";
        state.filter = null;
        state.data = {};
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.query = action.payload.query;
        state.filter = action.payload.filter;
        state.data = action.payload.data;
      });
  }
});

export const selectSearchResults = (state: AppState) => state.searchResults;
export const searchResultsReducer = searchResultsSlice.reducer;

export const movieDetailsSlice = createSlice({
  name: "movieDetails",
  initialState: initialMovieDetailsState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getMovieDetails.pending, state => {
        state.status = "loading";
        state.success = null;
        state.message = "";
        state.data = {};
      })
      .addCase(getMovieDetails.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.data = action.payload.data;
      });
  }
});

export const selectMovieDetails = (state: AppState) => state.movieDetails;
export const movieDetailsReducer = movieDetailsSlice.reducer;

export const personDetailsSlice = createSlice({
  name: "personDetails",
  initialState: initialPersonDetailsState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getPersonDetails.pending, state => {
        state.status = "loading";
        state.success = null;
        state.message = "";
        state.details = null;
      })
      .addCase(getPersonDetails.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.details = action.payload.details;
      });
  }
});

export const selectPersonDetails = (state: AppState) => state.personDetails;
export const personDetailsReducer = personDetailsSlice.reducer;
