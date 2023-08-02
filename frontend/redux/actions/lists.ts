import { createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

// TYPES
// **************************

// GET ALL LISTS FOR A USER
// *************************
export interface GetListsRequest {
  username: string;
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
  lists: List[] | null;
}

// GET ALL LIST ITEMS FOR A LIST
// ******************************
export interface ListItem {
  id: string;
  list_id: string;
  movie_id: string;
  movie_title: string;
  poster_path: string;
  created_at: number;
}

export interface GetListItemsRequest {
  list_id: string;
  page: number;
}

interface GetListItemsPayload {
  success: boolean;
  message: string;
  page: number;
  total_pages: number | null;
  list_items: ListItem[] | null;
}

// GET WATCHLIST FOR A USER
// ******************************
export interface GetWatchlistRequest {
  username: string;
  page: number;
}

interface GetWatchlistPayload {
  success: boolean;
  message: string;
  page: number;
  total_pages: number | null;
  list_items: ListItem[] | null;
}

// CREATE NEW LIST FOR A USER
// ***************************
export interface NewList {
  jwt_token: string;
  username: string;
  name: string;
}

interface CreateListPayload {
  success: boolean;
  message: string;
  code: number;
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
  watchlist: boolean;
}

interface CreateListItemPayload {
  success: boolean;
  message: string;
  code: number;
  list_name: string | null;
}

// DELETE A LIST
// **************
export interface DeleteListRequest {
  jwt_token: string;
  username: string;
  list_id: string;
}

interface DeleteListPayload {
  success: boolean;
  message: string;
  code: number;
  list: List | null;
}

// DELETE AN ITEM FROM A LIST
// ****************************
export interface DeleteListItemRequest {
  jwt_token: string;
  list_id: string;
  list_item_id: string;
}

interface DeleteListItemPayload {
  success: boolean;
  message: string;
  code: number;
  list_item: ListItem | null;
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

    const request = new Request(getListsUrl, {
      headers,
      body: params,
      method: "POST"
    });
    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        lists: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        lists: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        lists: null
      };
    }
  }
);

// GET ALL LIST ITEMS FOR A LIST
// ******************************
export const getListItems = createAsyncThunk(
  "lists/getListItems",
  async (
    getListItemsRequest: GetListItemsRequest
  ): Promise<GetListItemsPayload> => {
    const limit = 10;
    const offset = limit * (getListItemsRequest.page - 1);

    const getListItemsUrl = `${BACKEND_URL}/get-list-items`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("list_id", getListItemsRequest.list_id);
    params.append("offset", offset.toString());
    params.append("limit", limit.toString());

    const request = new Request(getListItemsUrl, {
      headers,
      body: params,
      method: "POST"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      const total_pages = Math.ceil(data.total_results / limit);

      return {
        success: true,
        message: "ok",
        page: getListItemsRequest.page,
        total_pages,
        list_items: data.list_items
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        page: getListItemsRequest.page,
        total_pages: null,
        list_items: null
      };
    } else {
      const data = await response.json();

      return {
        success: false,
        message: data.message,
        page: getListItemsRequest.page,
        total_pages: null,
        list_items: null
      };
    }
  }
);

// GET WATCHLIST FOR A USER
// ******************************
export const getWatchlist = createAsyncThunk(
  "lists/getWatchlist",
  async (
    getWatchlistRequest: GetWatchlistRequest
  ): Promise<GetWatchlistPayload> => {
    const limit = 10;
    const offset = limit * (getWatchlistRequest.page - 1);

    const getWatchlistsUrl = `${BACKEND_URL}/get-watchlist`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("username", getWatchlistRequest.username);
    params.append("offset", offset.toString());
    params.append("limit", limit.toString());

    const request = new Request(getWatchlistsUrl, {
      headers,
      body: params,
      method: "POST"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      const total_pages = Math.ceil(data.total_results / limit);
      return {
        success: true,
        message: "ok",
        page: getWatchlistRequest.page,
        total_pages,
        list_items: data.list_items
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        page: getWatchlistRequest.page,
        total_pages: null,
        list_items: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        page: getWatchlistRequest.page,
        total_pages: null,
        list_items: null
      };
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
    params.append("username", newList.username);
    params.append("name", newList.name);

    const request = new Request(createListsUrl, {
      headers,
      body: params,
      method: "POST"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        code: response.status,
        list: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        list: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        list: null
      };
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

    const request = new Request(createListitemsUrl, {
      headers,
      body: params,
      method: "POST"
    });

    const response = await fetch(request);

    if (response.ok) {
      return {
        success: true,
        message: "ok",
        code: response.status,
        list_name: newListItem.list_name
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        list_name: newListItem.list_name
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        list_name: newListItem.list_name
      };
    }
  }
);

// DELETE A LIST
// **************
export const deleteList = createAsyncThunk(
  "lists/deleteList",
  async (deleteRequest: DeleteListRequest): Promise<DeleteListPayload> => {
    const deleteListUrl = `${BACKEND_URL}/delete-list`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", deleteRequest.jwt_token);
    params.append("username", deleteRequest.username);
    params.append("list_id", deleteRequest.list_id);

    const request = new Request(deleteListUrl, {
      headers,
      body: params,
      method: "DELETE"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        code: response.status,
        list: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        list: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        list: null
      };
    }
  }
);

// DELETE AN ITEM FROM A LIST
// ****************************
export const deleteListItem = createAsyncThunk(
  "lists/deleteListItem",
  async (
    deleteRequest: DeleteListItemRequest
  ): Promise<DeleteListItemPayload> => {
    const deleteListItemUrl = `${BACKEND_URL}/delete-list-item`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("jwt_token", deleteRequest.jwt_token);
    params.append("list_id", deleteRequest.list_id);
    params.append("list_item_id", deleteRequest.list_item_id);

    const request = new Request(deleteListItemUrl, {
      headers,
      body: params,
      method: "DELETE"
    });

    const response = await fetch(request);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "ok",
        code: response.status,
        list_item: data
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        message: "server error",
        code: response.status,
        list_item: null
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message,
        code: response.status,
        list_item: null
      };
    }
  }
);
