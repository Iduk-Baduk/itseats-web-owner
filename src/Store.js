// src/Store.js
import { configureStore } from "@reduxjs/toolkit";
import order from "./store/orderSlice";
import menuReducer from "./store/menuSlice";

const store = configureStore({
  reducer: {
    order: order.reducer,
    menu: menuReducer, // 메뉴 리듀서 추가
  },
  devTools: true,
});

export default store;
