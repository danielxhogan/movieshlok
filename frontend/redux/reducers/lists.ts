import { getLists, createList, createListItem, List } from "@/redux/actions/lists";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index"
import { AppState } from "@/redux/store";

// TYPES
// **************************

// GET ALL LISTS FOR A USER
// *************************
interface Lists {
  status: Status;
  success: boolean | null;
  message: string;
  lists: List[] | null;
}

const initialListsState: Lists = {
  status: "idle",
  success: null,
  message: "",
  lists: []
}

// CREATE NEW LIST FOR A USER
// ***************************
interface NewList {
  status: Status;
  success: boolean | null;
  message: string;
  list: List | null;
}

const initialNewListState: NewList = {
  status: "idle",
  success: null,
  message: "",
  list: null
}

// ADD A MOVIE TO A LIST
// ***************************

interface NewListItem {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  list_name: string | null;
}

const initialNewListItemState: NewListItem = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  list_name: null
}

// REDUCERS
// *************************

// GET ALL LISTS FOR A USER
// *************************
export const listsSlice = createSlice({
  name: "lists",
  initialState: initialListsState,
  reducers: {
    addNewList(state, action) {
      state.lists?.push(action.payload.newList);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLists.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.lists = []
      })
      .addCase(getLists.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.lists = action.payload.lists
      })
  }
});

export const { addNewList } = listsSlice.actions;
export const selectLists = (state: AppState) => state.lists;
export const listsReducer = listsSlice.reducer;

// CREATE NEW LIST FOR A USER
// ***************************
export const newListSlice = createSlice({
  name: "newList",
  initialState: initialNewListState,
  reducers: {
    resetNewList(state) {
      state.status = "idle",
      state.success = null,
      state.message = "",
      state.list = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createList.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.list = null
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.list = action.payload.list
      })
  }
});

export const { resetNewList } = newListSlice.actions;
export const selectNewList = (state: AppState) => state.newList;
export const newListReducer = newListSlice.reducer;

// ADD A MOVIE TO A LIST
// ***************************
export const newListItemSlice = createSlice({
  name: "newListItem",
  initialState: initialNewListItemState,
  reducers: {
    resetNewListItem(state) {
      state.status = "idle",
      state.success = null,
      state.message = "",
      state.code = null,
      state.list_name = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createListItem.pending, (state) => {
        state.status = "loading",
        state.success = null,
        state.message = "",
        state.code = null,
        state.list_name = null
      })
      .addCase(createListItem.fulfilled, (state, action) => {
        state.status = "fulfilled",
        state.success = action.payload.success,
        state.message = action.payload.message,
        state.code = action.payload.code,
        state.list_name = action.payload.list_name
      })
  }
});

export const { resetNewListItem } = newListItemSlice.actions;
export const selectNewListItem = (state: AppState) => state.newListItem;
export const newListItemReducer = newListItemSlice.reducer;