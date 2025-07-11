import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { menuAPI } from "../services/menuAPI";
import { getGroupNames } from "../utils/groupMenus";

export const fetchMenuByIdAsync = createAsyncThunk(
  "menu/fetchMenuById",
  async (storeId) => {
    const response = await menuAPI.getMenusByStoreId(storeId);
    return {
      menus: response.menus || [],
      stats: {
        totalMenus: response.totalMenuCount,
        activeMenus: response.orderableMenuCount,
        outOfStockMenus: response.outOfStockTodayCount,
        hiddenMenus: response.hiddenMenuCount
      }
    };
  }
);

export const updateMenuPriorityAsync = createAsyncThunk(
  "menu/updateMenuPriority",
  async ({ groupName, menus }) => {
    const updates = menus.map(menu => 
      menuAPI.updateMenu(menu.id || menu.menuId, { menuPriority: menu.menuPriority })
    );
    await Promise.all(updates);
    return { groupName, menus };
  }
);

// 메뉴 우선순위 업데이트를 위한 공통 함수
const updateMenuPriorityInState = (state, { groupName, menus }) => {
  const updatedMenus = state.menu.menus.map(menu => {
    if (menu.menuGroupName === groupName) {
      const updatedMenu = menus.find(m => m.id === menu.id || m.menuId === menu.menuId);
      return updatedMenu || menu;
    }
    return menu;
  });
  state.menu.menus = updatedMenus;
};

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
    updateMenuPriority: (state, action) => {
      updateMenuPriorityInState(state, action.payload);
    },
    addGroupName: (state, action) => {
      if (!state.groupNames.includes(action.payload)) {
        state.groupNames.push(action.payload);
      }
    },
    setAllGroupNames: (state, action) => {
      state.groupNames = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuByIdAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenuByIdAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menu = { menus: action.payload.menus };
        state.stats = action.payload.stats;
        
        // 그룹 이름 업데이트
        state.groupNames = getGroupNames(action.payload.menus);
      })
      .addCase(fetchMenuByIdAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateMenuPriorityAsync.fulfilled, (state, action) => {
        updateMenuPriorityInState(state, action.payload);
      });
  },
});

export default menuSlice.reducer;
export const { updateMenuPriority, addGroupName, setAllGroupNames } = menuSlice.actions;
