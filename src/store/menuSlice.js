import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { menuAPI } from "../services/menuAPI";
import { getGroupNames } from "../utils/groupMenus";

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
    groupNames: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addGroupName: (state, action) => {
      if (!state.groupNames.includes(action.payload)) {
        state.groupNames.push(action.payload);
      }
    },
    setAllGroupNames: (state, action) => {
      // action.payload로 받은 배열로 groupNames 상태를 완전히 교체
      state.groupNames = action.payload;
    },
  },
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
        state.groupNames = getGroupNames(action.payload.menus);
      })
      .addCase(fetchMenuByIdAsync.rejected, (state, action) => {
        // 에러 처리
        console.error("메뉴 로딩 실패:", action.error.message);
      });
  },
});

export default menuSlice.reducer;
export const { addGroupName, setAllGroupNames } = menuSlice.actions;
