import { useState } from "react";
import styles from "./ReportModal.module.css";

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }
    onSubmit(reason);
    setReason(""); // 제출 후 입력 초기화
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>🚩 리뷰 신고</h2>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="신고 사유를 입력하세요"
        />
        <div className={styles.buttons}>
          <button onClick={onClose}>취소</button>
          <button onClick={handleSubmit}>제출</button>
        </div>
      </div>
    </div>
  );
}
