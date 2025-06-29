import { useState } from "react";
import styles from "./MenuOptionGroupModal.module.css";

export default function MenuOptionGroupModal({ onClose }) {
  // 모달 뒷 배경 클릭 시 닫히게 하는 함수
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [optionGroupNames, setOptionGroupNames] = useState([]);
  const [optionName, setOptionName] = useState("");

  const optionGroupNameChangeHandler = () => {
    if (!optionName.trim()) {
      return;
    }

    setOptionGroupNames((prev) => [...prev, optionName]);
    setOptionName("");
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContainer}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2>옵션 그룹 관리</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>

        {/* 바디 (2단 레이아웃) */}
        <div className={styles.modalBody}>
          {/* 왼쪽 패널: 옵션 추가 */}
          <div className={styles.leftPanel}>
            <div className={styles.formGroup}>
              <select defaultValue="옵션그룹">
                {optionGroupNames.map((groupName, index) => (
                  <option key={index} value={groupName}>
                    {groupName}
                  </option>
                ))}
                <option value="기타">기타</option>
                <option>옵션 그룹</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <input placeholder="옵션 명" type="text" />
            </div>
            <div className={styles.formGroup}>
              <input placeholder="가격(원)" type="number" defaultValue="0" />
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.cancelBtn} onClick={onClose}>
                취소
              </button>
              <button className={styles.addBtn}>추가</button>
            </div>
          </div>

          {/* 오른쪽 패널: 그룹 관리 */}
          <div className={styles.rightPanel}>
            <div className={styles.requiredOption}>
              <input type="checkbox" id="required" />
              <label htmlFor="required">표시 시 필수 옵션으로 변환됩니다.</label>
            </div>
            {/* 옵션 그룹 목록 (예시) */}
            <div className={styles.optionGroupList}>
              <div className={styles.optionGroupItem}>
                <input type="checkbox" />
                <>
                  {optionGroupNames.map((groupName, index) => (
                    <>
                      <span index={index}>{groupName}</span>
                      <div className={styles.itemActions}>
                        <button>×</button>
                        <button>≡</button>
                      </div>
                    </>
                  ))}
                </>
              </div>
              {/* 하위 옵션 예시 */}
              <div className={styles.subOptionItem}>
                <span>HOT</span>
                <span>1,000원</span>
                <button>≡</button>
              </div>
              <div className={styles.subOptionItem}>
                <span>ICE</span>
                <span>1,000원</span>
                <button>≡</button>
              </div>
            </div>
            <div className={styles.addGroup}>
              <input
                type="text"
                placeholder="옵션 그룹명"
                onChange={(e) => {
                  setOptionName(e.target.value);
                }}
              />
              <button className={styles.addBtn} onClick={optionGroupNameChangeHandler}>
                추가
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>
            취소
          </button>
          <button onClick={onClose} className={styles.addBtn}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
