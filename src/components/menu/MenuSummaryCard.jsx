import styles from "./MenuSummaryCard.module.css";

export default function MenusSummaryCard({ stats }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.card}>
        전체 메뉴<span>{stats.totalMenus || 0}개</span>
      </div>
      <div className={styles.card}>
        판매중<span>{stats.activeMenus || 0}개</span>
      </div>
      <div className={styles.card}>
        오늘만 품절<span>{stats.outOfStockMenus || 0}개</span>
      </div>
      <div className={styles.card}>
        숨김<span>{stats.hiddenMenus || 0}개</span>
      </div>
    </div>
  );
}
