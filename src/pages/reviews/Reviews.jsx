import { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import styles from "./Reviews.module.css";
import ReviewAPI from "../../services/reviewAPI";
import AuthAPI from "../../services/authAPI";
import ReviewSummaryCard from "../../components/review/ReviewSummaryCard";
import ReportModal from "../../components/review/ReportModal";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(null);

  // ✅ 모달용 state
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await AuthAPI.getCurrentUser();
        setStores(user.stores || []);
        const firstStoreId = user.storeId;
        setStoreId(firstStoreId);
        if (firstStoreId) {
          await fetchReviews(firstStoreId);
        }
      } catch (err) {
        console.error("❌ 사용자 정보 조회 실패:", err);
        setError("사용자 정보를 불러오는 데 실패했습니다.");
      }
    };
    init();
  }, []);

  const fetchReviews = async (id = storeId) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ReviewAPI.getStoreReviews(id, startDate, endDate);
      console.log("✅ 리뷰 데이터:", data);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("❌ 리뷰 불러오기 실패:", err);
      setError("리뷰를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportReview = async (reviewId, reason) => {
    console.log("🚨 신고 처리 중, reviewId:", reviewId, "reason:", reason);
    try {
      await ReviewAPI.reportReview(storeId, reviewId, { reason });
      alert("신고가 접수되었습니다.");
      await fetchReviews(); // 신고 후 목록 갱신
    } catch (err) {
      console.error("❌ 신고 실패:", err);
      alert(err.response?.data?.message || "신고에 실패했습니다.");
    }
  };

  const answeredCount = reviews.filter(r => r.ownerReply).length;
  const unansweredCount = reviews.length - answeredCount;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <>
      <Header showBackButton={true} onLeftClick={() => console.log("뒤로가기 클릭됨")} />
      <div className={styles.container}>
        <h1 className={styles.title}>리뷰 관리</h1>

        {loading ? (
          <div>로딩 중...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : stores.length === 0 ? (
          <div>등록된 매장이 없습니다.</div>
        ) : (
          <>
            <ReviewSummaryCard
              stats={{
                totalReviews: reviews.length,
                answeredReviews: answeredCount,
                unansweredReviews: unansweredCount,
                averageRating: averageRating,
              }}
            />

            <div className={styles.filters}>
              <select
                value={storeId || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  setStoreId(selectedId);
                  fetchReviews(selectedId);
                }}
              >
                {stores.map((store) => (
                  <option key={store.storeId} value={store.storeId}>
                    {store.storeName}
                  </option>
                ))}
              </select>

              <div className={styles.dateGroup}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <button onClick={() => fetchReviews()}>조회</button>
              </div>
            </div>

            <div className={styles.reviewHeader}>
              <div>리뷰 작성일</div>
              <div>리뷰 내용</div>
            </div>

            <div className={styles.reviewList}>
              {reviews.length === 0 ? (
                <div>리뷰가 없습니다.</div>
              ) : (
                reviews.map((review, index) => (
                  <div key={index} className={styles.reviewCard}>
                    <div className={styles.left}>
                      <div className={styles.reviewer}>
                        {review.reviewer}
                      </div>
                      <div className={styles.stars}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <div className={styles.date}>
                        {review.createdAt?.split("T")[0] || "날짜 없음"}
                      </div>
                    </div>

                    <div className={styles.right}>
                      <div className={styles.rightContent}>
                        <div className={styles.smallText}>주문 메뉴: {review.menuName}</div>
                        <div className={styles.smallText}>주문 번호: {review.orderNumber}</div>
                        <div className={styles.smallText}>{review.content}</div>
                      </div>
                      <button
                        className={styles.reportButton}
                        onClick={() => {
                          setSelectedReviewId(review.reviewId);
                          setReportModalOpen(true);
                        }}
                        disabled={review.reported}
                      >
                        {review.reported ? "✅ 신고 완료" : "🚩 신고하기"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={(reason) => {
          if (selectedReviewId) {
            handleReportReview(selectedReviewId, reason);
          }
          setReportModalOpen(false);
        }}
      />
    </>
  );
}
