import {
  getLists,
  getListItems,
  getWatchlist,
  createList,
  createListItem,
  deleteList,
  deleteListItem,
  List,
  ListItem
} from "@/redux/actions/lists";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index";
import { AppState } from "@/redux/store";

// TYPES
// **************************

// GET ALL LISTS FOR A USER
// *************************
// type for value of lists in redux store
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
};

// GET ALL LIST ITEMS FOR A LIST
// ******************************
// type for value of listItems in redux store
interface ListItems {
  status: Status;
  success: boolean | null;
  message: string;
  list_items: ListItem[] | null;
}

const initialListItemsState: ListItems = {
  status: "idle",
  success: null,
  message: "",
  list_items: null
};

// GET WATCHLIST FOR A USER
// ******************************
// type for value of watchlist in redux store
const initialWatchlistState: ListItems = {
  status: "idle",
  success: null,
  message: "",
  list_items: null
};

// CREATE NEW LIST FOR A USER
// ***************************
// type for value of newList in redux store
interface NewList {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  list: List | null;
}

const initialNewListState: NewList = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  list: null
};

// ADD A MOVIE TO A LIST
// ***************************
// type for value of newListItem in redux store
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
};

// DELETE A LIST
// **************
// type for value of deletedList in redux store
interface DeletedList {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  list: List | null;
}

const initialDeletedListState: DeletedList = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  list: null
};

// DELETE AN ITEM FROM A LIST
// ****************************
// type for value of deletedListItem in redux store
interface DeletedListItem {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  list_item: ListItem | null;
}

const initialDeletedListItemState: DeletedListItem = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  list_item: null
};

// REDUCERS
// *************************

// GET ALL LISTS FOR A USER
// *************************
// this reducer sets the value for lists in redux store
export const listsSlice = createSlice({
  name: "lists",
  initialState: initialListsState,
  reducers: {
    addNewList(state, action) {
      state.lists?.push(action.payload.newList);
    },
    removeDeletedList(state, action) {
      if (state.lists) {
        const newList = state.lists.filter(
          list => list.id !== action.payload.list_id
        );
        state.lists = newList;
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getLists.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.lists = []);
      })
      .addCase(getLists.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.lists = action.payload.lists);
      });
  }
});

export const { addNewList } = listsSlice.actions;
export const { removeDeletedList } = listsSlice.actions;
export const selectLists = (state: AppState) => state.lists;
export const listsReducer = listsSlice.reducer;

// GET ALL LIST ITEMS FOR A LIST
// ******************************
// this reducer sets the value for listItems in redux store
export const listItemsSlice = createSlice({
  name: "listItems",
  initialState: initialListItemsState,
  reducers: {
    removeListItem(state, action) {
      if (state.list_items) {
        const newItems = state.list_items.filter(
          list_item => list_item.id !== action.payload.list_item_id
        );
        state.list_items = newItems;
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getListItems.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.list_items = null);
      })
      .addCase(getListItems.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.list_items = action.payload.list_items);
      });
  }
});

export const { removeListItem } = listItemsSlice.actions;
export const selectListItems = (state: AppState) => state.listItems;
export const listItemsReducer = listItemsSlice.reducer;

// GET WATCHLIST FOR A USER
// ******************************
// this reducer sets the value for watchlist in redux store
export const watchlistSlice = createSlice({
  name: "listItems",
  initialState: initialWatchlistState,
  reducers: {
    removeWatchlistItem(state, action) {
      if (state.list_items) {
        const newItems = state.list_items.filter(
          list_item => list_item.id !== action.payload.list_item_id
        );
        state.list_items = newItems;
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getWatchlist.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.list_items = null);
      })
      .addCase(getWatchlist.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.list_items = action.payload.list_items);
      });
  }
});

export const { removeWatchlistItem } = watchlistSlice.actions;
export const selectWatchlist = (state: AppState) => state.watchlist;
export const watchlistReducer = watchlistSlice.reducer;

// CREATE NEW LIST FOR A USER
// ***************************
// this reducer sets the value for newList in redux store
export const newListSlice = createSlice({
  name: "newList",
  initialState: initialNewListState,
  reducers: {
    resetNewList(state) {
      (state.status = "idle"),
        (state.success = null),
        (state.message = ""),
        (state.code = null),
        (state.list = null);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createList.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.code = null),
          (state.list = null);
      })
      .addCase(createList.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.code = action.payload.code),
          (state.list = action.payload.list);
      });
  }
});

export const { resetNewList } = newListSlice.actions;
export const selectNewList = (state: AppState) => state.newList;
export const newListReducer = newListSlice.reducer;

// ADD A MOVIE TO A LIST
// ***************************
// this reducer sets the value for newListItem in redux store
export const newListItemSlice = createSlice({
  name: "newListItem",
  initialState: initialNewListItemState,
  reducers: {
    resetNewListItem(state) {
      (state.status = "idle"),
        (state.success = null),
        (state.message = ""),
        (state.code = null),
        (state.list_name = null);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createListItem.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.code = null),
          (state.list_name = null);
      })
      .addCase(createListItem.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.code = action.payload.code),
          (state.list_name = action.payload.list_name);
      });
  }
});

export const { resetNewListItem } = newListItemSlice.actions;
export const selectNewListItem = (state: AppState) => state.newListItem;
export const newListItemReducer = newListItemSlice.reducer;

// DELETE A LIST
// **************
// this reducer sets the value for deletedList in redux store
export const deletedListSlice = createSlice({
  name: "deletedList",
  initialState: initialDeletedListState,
  reducers: {
    resetDeletedList(state) {
      (state.status = "idle"),
        (state.success = null),
        (state.message = ""),
        (state.code = null),
        (state.list = null);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(deleteList.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.code = null),
          (state.list = null);
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.code = action.payload.code),
          (state.list = action.payload.list);
      });
  }
});

export const { resetDeletedList } = deletedListSlice.actions;
export const selectDeletedList = (state: AppState) => state.deletedList;
export const deletedListReducer = deletedListSlice.reducer;

// DELETE AN ITEM FROM A LIST
// ****************************
// this reducer sets the value for deletedListItem in redux store
export const deletedListItemSlice = createSlice({
  name: "deletedListItem",
  initialState: initialDeletedListItemState,
  reducers: {
    resetDeletedListItem(state) {
      (state.status = "idle"),
        (state.success = null),
        (state.message = ""),
        (state.code = null),
        (state.list_item = null);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(deleteListItem.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.code = null),
          (state.list_item = null);
      })
      .addCase(deleteListItem.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.code = action.payload.code),
          (state.list_item = action.payload.list_item);
      });
  }
});

export const { resetDeletedListItem } = deletedListItemSlice.actions;
export const selectDeletedListItem = (state: AppState) => state.deletedListItem;
export const deletedListItemReducer = deletedListItemSlice.reducer;
