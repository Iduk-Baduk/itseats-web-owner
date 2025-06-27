import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuByIdAsync } from "../../store/menuSlice";

import Header from "../../components/common/Header";
import styles from "./Menus.module.css";

export default function Menus() {
  const dispatch = useDispatch();
  const menuList = useSelector((state) => state.menu.menu); // menuSlice에서 가져옴

  // ✅ mount 시 메뉴 요청
  useEffect(() => {
    dispatch(fetchMenuByIdAsync());
  }, [dispatch]);

  const handleFetchMenu = () => {
    dispatch(fetchMenuByIdAsync(storeId));
  };

  console.log("메뉴 데이터", menuList);

  return (
    <>
      <Header
        nickname="홍길동"
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div>
        <button onClick={handleFetchMenu}>메뉴 불러오기</button>
        <pre>{JSON.stringify(menuList, null, 2)}</pre>
      </div>
    </>
  );
}
