import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMenuByIdAsync } from "../store/menuSlice";

export default function useFetchMenus(storeId) {
  const dispatch = useDispatch();
  const { menu, stats, status, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuByIdAsync(storeId));
  }, [dispatch, storeId]);

  return { menu, stats, status, error };
}
