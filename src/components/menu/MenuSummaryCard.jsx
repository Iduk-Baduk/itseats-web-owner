import styles from "./MenuSummaryCard.module.css";

export default function MenusSummaryCard({ menu }) {
  return (
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
  );
}
