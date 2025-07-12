import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMenuByIdAsync } from "../store/menuSlice";

export default function useFetchMenus() {
  const dispatch = useDispatch();
  const { menu, status, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuByIdAsync());
  }, [dispatch]);

  return { menu, status, error };
}
