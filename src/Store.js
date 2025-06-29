// src/Store.js
import { configureStore } from "@reduxjs/toolkit";
import order from "./store/orderSlice";
import menuReducer from "./store/menuSlice";
import menuOptionReducer from "./store/menuOptionSlice";

const store = configureStore({
  reducer: {
    order: order.reducer,
    menu: menuReducer,
    menuOption: menuOptionReducer,
  },
  devTools: true,
});

export default store;
