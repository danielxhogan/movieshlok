import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import reducers from './reducers';

const makeStore = () =>
  configureStore({
    reducer: reducers,
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppDispatch = ReturnType<AppStore["dispatch"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);







// import { createStore, applyMiddleware, Store, AnyAction } from 'redux';
// import { HYDRATE, createWrapper, Context } from 'next-redux-wrapper';
// import ThunkMiddleware from 'redux-thunk';
// const { composeWithDevTools } = require('redux-devtools-extension');
// import reducers from './reducers';

// export interface State {
//   movieDetails: string;
//   movieVideos: string;
// }

// const initialState = {
//   movieDetails: "",
//   movieVideos: ""
// }

// const reducer = (state: State = initialState, action: AnyAction) => {
//   if (action.type === HYDRATE) {
//     const nextState = {
//       ...state,
//       ...action.payload
//     };
//     return nextState;

//   } else {
//     return reducers(state, action);
//   }
// };

// const bindMiddleware = (middleware: any) => {
//     return composeWithDevTools(applyMiddleware(...middleware));
// };

// const initStore = (context: Context) => createStore(reducer, bindMiddleware([ThunkMiddleware]));
// export const wrapper = createWrapper<Store<State>>(initStore);