import styles from "./MenuSummaryCard.module.css";

export default function MenusSummaryCard({ menu }) {
  // 메뉴 상태별 갯수 계산
  const calculateMenuCounts = () => {
    if (!menu.menus || !Array.isArray(menu.menus)) {
      return {
        totalMenuCount: 0,
        orderableMenuCount: 0,
        outOfStockTodayCount: 0,
        hiddenMenuCount: 0
      };
    }

    return {
      totalMenuCount: menu.menus.length,
      orderableMenuCount: menu.menus.filter(menu => menu.menuStatus === "ONSALE").length,
      outOfStockTodayCount: menu.menus.filter(menu => menu.menuStatus === "OUT_OF_STOCK").length,
      hiddenMenuCount: menu.menus.filter(menu => menu.menuStatus === "HIDDEN").length
    };
  };

  const menuCounts = calculateMenuCounts();

  return (
    <div className={styles.summaryCard}>
      <div className={styles.card}>
        전체 메뉴<span>{menuCounts.totalMenuCount}개</span>
      </div>
      <div className={styles.card}>
        판매중<span>{menuCounts.orderableMenuCount}개</span>
      </div>
      <div className={styles.card}>
        오늘만 품절<span>{menuCounts.outOfStockTodayCount}개</span>
      </div>
      <div className={styles.card}>
        숨김<span>{menuCounts.hiddenMenuCount}개</span>
      </div>
    </div>
  );
}
