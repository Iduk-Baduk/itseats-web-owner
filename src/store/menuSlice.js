import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { menuAPI } from "../services/menuAPI";
import { getGroupNames } from "../utils/groupMenus";

export const fetchMenuByIdAsync = createAsyncThunk(
  "menu/fetchMenuById",
  async () => {
    const [menuResponse, statsResponse] = await Promise.all([
      menuAPI.getMenus(),
      menuAPI.getMenuStats()
    ]);
    return {
      menus: menuResponse,
      stats: statsResponse
    };
  }
);

export const menuSlice = createSlice({
  name: "menu",
  initialState: {
    menu: { menus: [] },
    stats: {},
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
      state.groupNames = action.payload;
      
      const newMenus = [];
      action.payload.forEach(groupName => {
        const menusInGroup = state.menu.menus.filter(menu => menu.group === groupName);
        newMenus.push(...menusInGroup);
      });
      
      const ungroupedMenus = state.menu.menus.filter(menu => !action.payload.includes(menu.group));
      newMenus.push(...ungroupedMenus);
      
      state.menu.menus = newMenus;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuByIdAsync.pending, (state) => {
        state.status = "loading";
        console.log("메뉴 로딩 중...");
      })
      .addCase(fetchMenuByIdAsync.fulfilled, (state, action) => {
        console.log("🔥 메뉴 응답:", action.payload);
        state.status = "succeeded";
        state.menu = { menus: action.payload.menus };
        state.stats = action.payload.stats;
        
        const currentGroups = new Set(state.groupNames);
        const newGroups = getGroupNames(action.payload.menus);
        
        newGroups.forEach(group => {
          if (!currentGroups.has(group)) {
            state.groupNames.push(group);
          }
        });
        
        state.groupNames = state.groupNames.filter(group => 
          newGroups.includes(group)
        );
      })
      .addCase(fetchMenuByIdAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("메뉴 로딩 실패:", action.error.message);
      });
  },
});

export default menuSlice.reducer;
export const { addGroupName, setAllGroupNames } = menuSlice.actions;
