// PauseOrderModal.jsx
import styles from "./PosOrderModal.module.css";

export default function PosOrderModal({ onSelect, onClose }) {
  const pauseButton = [15, 30, 60];
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon className={styles.closeIcon} />
          </button>
          <span style={{ marginLeft: "1rem" }}>주문 일시 정지</span>
        </div>
        <div style={{ marginTop: "80px" }}>
          <p>일시 정지할 시간을 선택해 주세요</p>
          <p style={{ fontSize: "14px", color: "gray" }}>일시 정지는 언제든지 해체할 수 있어요</p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {pauseButton.map((min) => (
              <button key={min} className={styles.modalButton} onClick={() => onSelect(min)}>
                {min}분
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CloseIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="20"
      height="35"
      viewBox="0 0 20 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.54682 17.5L19.3942 3.65262L16.6251 0.883533L1.3932 16.1155C1.02607 16.4827 0.819824 16.9807 0.819824 17.5C0.819824 18.0193 1.02607 18.5173 1.3932 18.8845L16.6251 34.1165L19.3942 31.3474L5.54682 17.5Z"
        fill="black"
      />
    </svg>
  );
};
