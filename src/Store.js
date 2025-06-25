// src/Store.js
import { configureStore } from "@reduxjs/toolkit";
import order from "./store/orderSlice";

const store = configureStore({
  reducer: { order: order.reducer },
  devTools: true,
});

export default store;
