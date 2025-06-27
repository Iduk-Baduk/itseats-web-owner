import Header from "../../components/common/Header";
import useFetchMenus from "../../hooks/useFetchMenus";
import MenuStore from "../../components/menu/MenuStore";
import MenusSummaryCard from "../../components/menu/MenuSummaryCard";

import MenuList from "../../components/menu/MenuList";

import styles from "./Menus.module.css";

export default function Menus() {
  const { menu, status, error } = useFetchMenus();

  if (status === "loading") {
    return <div>메뉴를 불러오는 중...</div>;
  }

  if (error) {
    return <p> 에러 발생: {error}</p>;
  }

  console.log("menu 값:", menu);

  return (
    <div className={styles.container}>
      <Header
        nickname="홍길동"
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />

      <h1 className={styles.title}>메뉴 관리</h1>

      {/* 매장 선택 */}
      <MenuStore />
      {/* 요약 카드 */}
      <MenusSummaryCard menu={menu} />

      {/* 메뉴 리스트 */}
      <MenuList menu={menu} />
    </div>
  );
}
