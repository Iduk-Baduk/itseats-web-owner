import { useState } from "react";
import styles from "./MenuGroupModal.module.css";
import Button from "../basic/Button";

export default function MenuGroupModal({ groupNames, modalState, setModalState }) {
  const [tempGroups, setTempGroups] = useState(groupNames); // 그룹 임시 편집 상태
  const [newGroup, setNewGroup] = useState(""); // 새로 추가 될 그룹

  const handleAddGroup = () => {
    if (!newGroup.trim()) return;
    setTempGroups([...tempGroups, newGroup.trim()]);
    setNewGroup("");
  };

  const handleDeleteGroup = (index) => {
    const copy = [...tempGroups];
    copy.splice(index, 1);
    setTempGroups(copy);
  };

  const handleCancel = () => {
    setTempGroups(groupNames);
    setModalState(false);
  };

  const handleApply = () => {
    // 실제 부모에 적용
    onChange("groupNames", tempGroups);
    setModalState(false);
  };

  return (
    <>
      {modalState && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>메뉴 그룹 관리</h2>
            <div className={styles.groupList}>
              {tempGroups.map((group, index) => (
                <div key={index} className={styles.groupItem}>
                  <span className={styles.groupText}>{group}</span>
                  <button
                    className={styles.groupCloseButton}
                    onClick={() => handleDeleteGroup(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.addGroup}>
              <input
                type="text"
                placeholder="메뉴 그룹명"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
              />
              <button onClick={handleAddGroup}>추가</button>
            </div>

            <div className={styles.modalActions}>
              <Button className={styles.cancelButton} onClick={handleCancel}>
                취소
              </Button>
              <Button className={styles.applyButton} onClick={handleApply}>
                적용
              </Button>
            </div>

            <button className={styles.modalClose} onClick={() => setModalState(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
