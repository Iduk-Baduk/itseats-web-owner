import { useState } from "react";
import styles from "./MenuOptionGroupModal.module.css";
import { UpArrayIcon, DownArrayIcon, DeleteIcon } from "../common/Icons";

export default function MenuOptionGroupModal({ onClose, onSave }) {
  const [optionGroups, setOptionGroups] = useState([]);
  const [optionGroupName, setOptionGroupName] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState(0);
  const [isRequired, setIsRequired] = useState(false);

  const addOptionGroup = () => {
    if (!optionGroupName.trim()) {
      return;
    }
    setOptionGroups((prev) => [
      ...prev,
      {
        groupName: optionGroupName,
        isOpen: true,
        isRequired: false, // 그룹별로 저장
        options: [],
      },
    ]);

    setOptionGroupName("");
    setSelectedGroupIndex(optionGroups.length); // 새 그룹 선택
  };

  const addOptionToGroup = () => {
    if (!optionName.trim()) {
      return;
    }

    const updatedGroups = [...optionGroups];
    const targetGroup = updatedGroups[selectedGroupIndex];

    if (!targetGroup) {
      return;
    }

    targetGroup.options.push({ 
      name: optionName, 
      price: Number(optionPrice), 
      optionStatus: "ONSALE" 
    });

    setOptionGroups(updatedGroups);
    setOptionName("");
    setOptionPrice(0);
  };

  const toggleGroup = (index) => {
    const updated = [...optionGroups];
    updated[index].isOpen = !updated[index].isOpen;
    setOptionGroups(updated);
  };

  const deleteOptionGroup = (index) => {
    const updatedGroups = optionGroups.filter((_, i) => i !== index);
    setOptionGroups(updatedGroups);

    if (selectedGroupIndex === index) {
      setSelectedGroupIndex(""); // 선택 해제
    } else if (selectedGroupIndex > index) {
      setSelectedGroupIndex((prev) => prev - 1); // 삭제된 그룹 이후의 그룹이 선택되면 인덱스 조정
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <div onClick={onClose} className={styles.headerTitle}>
            옵션 그룹 관리
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.leftPanel}>
            <div className={styles.formGroup}>
              {/* 그룹명 선택 */}
              <select
                value={selectedGroupIndex}
                onChange={(e) => setSelectedGroupIndex(Number(e.target.value))}
              >
                <option value="" disabled>옵션 그룹 선택</option>
                {optionGroups.map((group, index) => (
                  <option key={index} value={index}>
                    {group.groupName}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                placeholder="옵션 명"
                type="text"
                value={optionName}
                onChange={(e) => setOptionName(e.currentTarget.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                placeholder="가격(원)"
                type="number"
                value={optionPrice}
                onChange={(e) => setOptionPrice(e.currentTarget.value)}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.cancelBtn} onClick={onClose}>
                취소
              </button>
              <button className={styles.addBtn} onClick={addOptionToGroup}>
                추가
              </button>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.requiredOption}>
              <input 
                type="checkbox" 
                id="required" 
                className={styles.checkBox}
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
              <label htmlFor="required">표시 시 필수 옵션으로 변환됩니다.</label>
            </div>

            <div className={styles.optionGroupList}>
              {optionGroups.map((group, index) => (
                <div key={index} className={styles.optionGroupItem}>
                  <div
                    className={styles.optionGroupItemHeader}
                    onClick={() => toggleGroup(index)}
                    style={{ cursor: "pointer" }}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={group.isRequired}
                        onChange={(e) => {
                          const updatedGroups = [...optionGroups];
                          updatedGroups[index].isRequired = e.target.checked;
                          setOptionGroups(updatedGroups);
                        }}
                        className={styles.checkBox}
                      />
                    </div>
                    <span className={styles.groupName}>{group.groupName}</span>
                    <div className={styles.itemActions}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOptionGroup(index);
                        }}
                      >
                        <DeleteIcon className={styles.deleteButton} />
                      </div>

                      <button>{group.isOpen ? <UpArrayIcon /> : <DownArrayIcon />}</button>
                    </div>
                  </div>

                  {group.isOpen &&
                    group.options.map((opt, i) => (
                      <div key={i} className={styles.subOptionItem}>
                        <span>{opt.name}</span>
                        <span>{opt.price.toLocaleString()}원</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            <div className={styles.addGroup}>
              <input
                type="text"
                placeholder="옵션 그룹명"
                value={optionGroupName}
                onChange={(e) => setOptionGroupName(e.target.value)}
              />
              <button className={styles.addBtn} onClick={addOptionGroup}>
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
          <button
            onClick={() => {
              console.log("저장할 옵션 그룹:", optionGroups);
              onSave(optionGroups); // 부모에게 저장
              onClose();
            }}
            className={styles.addBtn}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}


