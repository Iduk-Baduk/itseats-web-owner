import Header from "../../components/common/Header";
import useFetchMenus from "../../hooks/useFetchMenus";

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
      {/* TODO: 추후 API에서 매장 정보 여러개 일시 여러개의 매장 정보를 가져옴 */}
      <div className={styles.storeSelector}>
        <select>
          <option value="잠실 커피 로스터리">잠실 커피 로스터리</option>
          <option value="강남 커피 로스터리">강남 커피 로스터리</option>
          <option value="홍대 커피 로스터리">홍대 커피 로스터리</option>
        </select>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryCard}>
        <div className={styles.card}>
          전체 메뉴<span>{menu.totalMenuCount}개</span>
        </div>
        <div className={styles.card}>
          판매중<span>{menu.orderableMenuCount}개</span>
        </div>
        <div className={styles.card}>
          오늘만 품절<span>{menu.outOfStockTodayCount}개</span>
        </div>
        <div className={styles.card}>
          숨김<span>{menu.hiddenMenuCount}개</span>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      {menu.menus && menu.menus.length > 0 ? (
        Object.entries(
          menu.menus.reduce((acc, item) => {
            const group = item.menuGroupName || "기타";
            if (!acc[group]) {
              // 그룹이 없으면 초기화
              acc[group] = [];
            }
            acc[group].push(item);
            return acc;
          }, {})
        ).map(([groupName, items]) => (
          <div key={groupName}>
            <h2 className={styles.groupTitle}>{groupName}</h2>
            <ul className={styles.menuList}>
              {items.map((item) => (
                <li key={item.menuId} className={styles.menuItem}>
                  <input type="checkbox" />
                  <div className={styles.imageBox}></div>
                  <span className={styles.menuName}>{item.menuName}</span>
                  <select className={styles.statusSelect} defaultValue={item.menuStatus}>
                    <option value="ONSALE">판매중</option>
                    <option value="OUT_OF_STOCK">오늘만 품절</option>
                    <option value="HIDDEN">메뉴숨김</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div>메뉴가 없습니다.</div>
      )}
    </div>
  );
}
