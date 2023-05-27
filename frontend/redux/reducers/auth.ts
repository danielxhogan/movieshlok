import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "@/redux/store";
import { HYDRATE } from "next-redux-wrapper";

export interface Credentials {
  jwt_token: string | null;
  username: string | null;
}

const initialState: Credentials = {
  jwt_token: null,
  username: null
};

export const authSlice = createSlice({
  name: "credentials",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.jwt_token = action.payload.jwt_token;
      state.username = action.payload.username;
    },
    unsetCredentials(state) {
      state.jwt_token = null;
      state.username = null;
    },
  },

  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.credentials,
      };
    },
  },
});

export const { setCredentials, unsetCredentials } = authSlice.actions;
export const selectCredentials = (state: AppState) => state.credentials;
export const authSliceReducer = authSlice.reducer;