import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { menuAPI } from "../services/menuAPI";

export const fetchMenuByIdAsync = createAsyncThunk(
  "menu/fetchMenuById", // 액션 타입
  async () => {
    return await menuAPI.getMenus(); // API 호출
  }
);

export const menuSlice = createSlice({
  name: "menu",
  initialState: {
    menu: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuByIdAsync.pending, (state) => {
        // 로딩 상태 처리
        console.log("메뉴 로딩 중...");
      })
      .addCase(fetchMenuByIdAsync.fulfilled, (state, action) => {
        // 성공적으로 데이터를 가져온 경우
        console.log("🔥 메뉴 응답:", action.payload);
        state.status = "succeeded";
        state.menu = action.payload;
      })
      .addCase(fetchMenuByIdAsync.rejected, (state, action) => {
        // 에러 처리
        console.error("메뉴 로딩 실패:", action.error.message);
      });
  },
});

export default menuSlice.reducer;
