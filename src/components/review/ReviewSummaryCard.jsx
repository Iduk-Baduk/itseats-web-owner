import styles from "./ReviewSummaryCard.module.css";

export default function ReviewSummaryCard({ stats }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.card}>
        전체<span>{stats.totalReviews || 0}개</span>
      </div>
      <div className={styles.card}>
        답변<span>{stats.answeredReviews || 0}개</span>
      </div>
      <div className={styles.card}>
        미답변<span>{stats.unansweredReviews || 0}개</span>
      </div>
      <div className={styles.card}>
        평균 별점
        <span>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i}>{i < Math.round(stats.averageRating) ? "⭐" : "☆"}</span>
          ))}{" "}
          {stats.averageRating || 0.0}점
        </span>
      </div>
    </div>
  );
}
