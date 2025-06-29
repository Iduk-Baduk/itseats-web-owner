import Button from "../basic/Button";
import { useEffect, useState } from "react";
import { addGroupName, setAllGroupNames } from "../../store/menuSlice";
import styles from "./MenuGroupModal.module.css";
import { useDispatch } from "react-redux";

// TODO: - button이 css를 안 먹는 버그가 있음
// 추후 해결 필요
export default function MenuGroupModal({
  groupNames,
  modalState,
  setModalState,
  setGroupNames,
  onclose,
}) {
  const [tempGroups, setTempGroups] = useState([]); // 그룹 임시 편집 상태
  const [newGroup, setNewGroup] = useState(""); // 새로 추가 될 그룹

  const dispatch = useDispatch();

  // 추가 핸들러
  const handleAddGroup = () => {
    if (!newGroup.trim()) {
      return;
    }
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
    onclose();
  };

  // 적용 핸들러
  const handleApply = () => {
    const areEqual =
      tempGroups.length === groupNames.length &&
      tempGroups.every((group, index) => group === groupNames[index]);

    if (areEqual) {
      return;
    }

    // 목록 전체를 교체하는 올바른 액션을 사용합니다.
    dispatch(setAllGroupNames(tempGroups));
    setGroupNames(tempGroups);
    alert("메뉴 그룹이 업데이트 되었습니다.");
    setModalState(false);
    onclose();
  };

  useEffect(() => {
    setTempGroups(groupNames);
  }, [groupNames]);

  return (
    <>
      {modalState && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>메뉴 그룹 관리</h2>
              {/* TODO: 버튼으로 교체해야됨 */}
              <div className={styles.modalClose} onClick={() => setModalState(false)}>
                ✕
              </div>
            </div>
            <div className={styles.groupList}>
              {tempGroups.map((group, index) => (
                <div key={index} className={styles.groupItem}>
                  <div className={styles.groupTextContainer}>
                    <span className={styles.groupText}>{group}</span>
                    <div
                      className={styles.groupCloseButton}
                      onClick={() => handleDeleteGroup(index)}
                    >
                      ✕
                    </div>
                  </div>
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
              <div className={styles.addGroupButton} onClick={handleAddGroup}>
                추가
              </div>
            </div>

            <div className={styles.modalActions}>
              {/* TODO: 버튼으로 교체해야됨 */}
              <div className={styles.cancelButton} onClick={handleCancel}>
                취소
              </div>
              <div className={styles.applyButton} onClick={handleApply}>
                적용
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
