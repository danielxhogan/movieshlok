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
  success: boolean
  message: string;
  list: List | null;
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
)