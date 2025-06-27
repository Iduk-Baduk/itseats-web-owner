import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import menuAPI from "../services/menuAPI";
export const fetchMenuByIdAsync = createAsyncThunk(
  "menu/fetchMenuById", // 액션 타입
  async (storeId) => {
    return await menuAPI.getMenuById(storeId); // API 호출
  }
);
