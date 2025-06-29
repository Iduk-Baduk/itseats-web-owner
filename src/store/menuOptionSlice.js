// src/store/menuOptionSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { menuAPI } from "../services/menuAPI"; // API 서비스 사용

// 특정 ID의 메뉴 상세 정보를 불러오는 Thunk
export const fetchDetailedMenuByIdAsync = createAsyncThunk(
  "menuOption/fetchDetailedMenuById",
  async (menuId) => {
    // 실제로는 ID로 메뉴 하나를 가져오는 API가 필요합니다.
    // 예: return await menuAPI.getMenuById(menuId);

    // 현재는 전체 목록에서 찾는 것으로 대체합니다.
    const menuListResponse = await menuAPI.getMenuList();
    return menuListResponse.menus.find((menu) => menu.menuId === menuId);
  }
);

const initialState = {
  // 단일 메뉴의 상세 정보를 담을 상태
  currentMenu: null,
  status: "idle",
  error: null,
};

const menuOptionSlice = createSlice({
  name: "menuOption",
  initialState,
  reducers: {
    // 추가/수정/삭제와 같은 동기적인 로직을 추가
    clearCurrentMenu: (state) => {
      state.currentMenu = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDetailedMenuByIdAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDetailedMenuByIdAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log("🔥 상세 메뉴 응답:", action.payload);
        state.currentMenu = action.payload; // 불러온 메뉴 데이터를 상태에 저장
      })
      .addCase(fetchDetailedMenuByIdAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentMenu } = menuOptionSlice.actions;
export default menuOptionSlice.reducer;
