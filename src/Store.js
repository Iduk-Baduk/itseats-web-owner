// src/Store.js
import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./store/menuSlice";
import order from "./store/orderSlice";

const store = configureStore({
  reducer: {
    order: order.reducer,
    menu: menuReducer,
  },
  devTools: true,
});

export default store;
