import { createAsyncThunk } from "@reduxjs/toolkit";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

// TYPES
// **************************

// GET ALL LISTS FOR A USER
// *************************
export interface GetListsRequest {
  username: string
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  watchlist: boolean;
  created_at: number;
}

interface GetListsPayload {
  success: boolean;
  message: string;
  lists: List[] | null
}

// CREATE NEW LIST FOR A USER
// ***************************
export interface NewList {
  jwt_token: string;
  name: string;
}

interface CreateListPayload {
  success: boolean;
  message: string;
  list: List | null;
}

// ADD A MOVIE TO A LIST
// ***************************
export interface NewListItem {
  jwt_token: string;
  list_id?: string;
  list_name: string;
  movie_id: string;
  movie_title: string;
  poster_path: string;
  watchlist: boolean
}

interface CreateListItemPayload {
  success: boolean;
  message: string;
  code: number;
  list_name: string | null;
}

// ACTIONS
// *************************

// GET ALL LISTS FOR A USER
// *************************
export const getLists = createAsyncThunk(
  "lists/getLists",
  async (getListsRequest: GetListsRequest): Promise<GetListsPayload> => {
    const getListsUrl = `${BACKEND_URL}/get-lists`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("username", getListsRequest.username);

    const request = new Request(getListsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        lists: data
      }

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        lists: null
      }

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        lists: null
      }
    }
  }
);

// CREATE NEW LIST FOR A USER
// ***************************
export const createList = createAsyncThunk(
  "lists/createList",
  async (newList: NewList): Promise<CreateListPayload> => {
    const createListsUrl = `${BACKEND_URL}/create-list`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", newList.jwt_token);
    params.append("name", newList.name);

    const request = new Request(createListsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        list: data
      }

    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        list: null
      }

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        list: null
      }
    }
  }
);

// ADD A MOVIE TO A LIST
// ***************************
export const createListItem = createAsyncThunk(
  "lists/createListItem",
  async (newListItem: NewListItem): Promise<CreateListItemPayload> => {
    const createListitemsUrl = `${BACKEND_URL}/create-list-item`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", newListItem.jwt_token);
    newListItem.list_id && params.append("list_id", newListItem.list_id);
    params.append("movie_id", newListItem.movie_id);
    params.append("movie_title", newListItem.movie_title);
    params.append("poster_path", newListItem.poster_path);
    params.append("watchlist", newListItem.watchlist.toString());

    const request = new Request(createListitemsUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      return {
        success: true,
        message: "ok",
        code: response.status,
        list_name: newListItem.list_name
      }

    } else if (response.status >= 500) {
      return{
        success: false,
        message: "server error",
        code: response.status,
        list_name: newListItem.list_name
      }

    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        list_name: newListItem.list_name
      }
    }
  }
);