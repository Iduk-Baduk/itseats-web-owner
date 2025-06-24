import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    orderNumber: "GRMT0N",
    orderTime: "2025-06-13T12:00:02",
    menuCount: 2,
    totalPrice: 15000,
    menuItems: [
      {
        menuName: "아메리카노",
        quantity: 2,
        options: ["샷추가", "샷추가", "사이즈업"],
      },
    ],
    deliveryStatus: "COKING",
    customerRequest: "아메리카노 더블샷추가, 사이즈업 입니다.",
    riderPhone: null,
  },
  {
    orderNumber: "B9103A",
    orderTime: "2025-06-13T11:39:00",
    menuCount: 3,
    totalPrice: 15000,
    menuItems: [
      {
        menuName: "아메리카노",
        quantity: 2,
        options: ["샷추가", "샷추가", "사이즈업"],
      },
      {
        menuName: "에스프레소",
        quantity: 1,
        options: [],
      },
    ],
    deliveryStatus: "DELIVERING",
    customerRequest: "아메리카노 더블샷추가, 사이즈업 입니다.",
    riderPhone: "010-1234-5678",
  },
  {
    orderNumber: "K2642F",
    orderTime: "2025-06-13T11:39:00",
    menuCount: 5,
    totalPrice: 35000,
    menuItems: [
      {
        menuName: "아메리카노",
        quantity: 2,
        options: ["샷추가", "샷추가", "사이즈업"],
      },
      {
        menuName: "에스프레소",
        quantity: 1,
        options: [],
      },
    ],
    deliveryStatus: "COMPLETED",
    customerRequest: "크림 적게 주세요~",
    riderPhone: "010-1221-5678",
  },
];

const order = createSlice({
  name: "order",
  initialState,
  reducers: {
    addOrder: (state, action) => {
      state.push(action.payload);
    },
    updateOrderStatus: (state, action) => {
      const { orderNumber, newStatus } = action.payload;
      const order = state.find((order) => order.orderNumber === orderNumber);
      if (order) {
        order.deliveryStatus = newStatus;
      }
    },
  },
});

export default order;
