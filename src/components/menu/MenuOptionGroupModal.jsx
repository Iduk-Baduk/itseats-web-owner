import { useState, useEffect } from "react";
import styles from "./MenuOptionGroupModal.module.css";
import { UpArrayIcon, DownArrayIcon, DeleteIcon } from "../common/Icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableOptionGroup from "./SortableOptionGroup";

export default function MenuOptionGroupModal({ onClose, onSave, optionGroups: initialGroups, setOptionGroups, modalState }) {
  const [optionGroups, setLocalOptionGroups] = useState(initialGroups || []);
  const [optionGroupName, setOptionGroupName] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLocalOptionGroups(initialGroups || []);
  }, [initialGroups]);

  const handleClose = () => {
    setOptionGroupName("");
    setSelectedGroupIndex("");
    setOptionName("");
    setOptionPrice("");
    setIsRequired(false);
    onClose();
  };

  const handleSave = () => {
    onSave(optionGroups);
    handleClose();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setLocalOptionGroups((items) => {
        const oldIndex = items.findIndex((item) => item.groupName === active.id);
        const newIndex = items.findIndex((item) => item.groupName === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        setOptionGroups(newItems);
        return newItems;
      });
    }
  };

  const addOptionGroup = () => {
    if (!optionGroupName.trim()) {
      return;
    }
    const newGroups = [...optionGroups, {
        groupName: optionGroupName,
        isOpen: true,
      isRequired: false,
        options: [],
    }];
    setLocalOptionGroups(newGroups);
    setOptionGroups(newGroups);
    setOptionGroupName("");
    setSelectedGroupIndex(optionGroups.length);
  };

  const addOptionToGroup = () => {
    if (!optionName.trim() || selectedGroupIndex === "") {
      return;
    }

    const updatedGroups = [...optionGroups];
    const targetGroup = updatedGroups[selectedGroupIndex];

    if (!targetGroup) {
      return;
    }

    targetGroup.options.push({ 
      name: optionName, 
      price: optionPrice === "" ? 0 : Number(optionPrice),
      optionStatus: "ONSALE" 
    });

    setLocalOptionGroups(updatedGroups);
    setOptionGroups(updatedGroups);
    setOptionName("");
    setOptionPrice("");
  };

  const toggleGroup = (index) => {
    const updated = [...optionGroups];
    updated[index].isOpen = !updated[index].isOpen;
    setLocalOptionGroups(updated);
    setOptionGroups(updated);
  };

  const deleteOptionGroup = (index) => {
    const groupToDelete = optionGroups[index];
    const optionCount = groupToDelete.options.length;
    
    const confirmMessage = optionCount > 0
      ? `"${groupToDelete.groupName}" 그룹과 포함된 ${optionCount}개의 옵션을 모두 삭제하시겠습니까?`
      : `"${groupToDelete.groupName}" 그룹을 삭제하시겠습니까?`;

    if (window.confirm(confirmMessage)) {
      const updatedGroups = optionGroups.filter((_, i) => i !== index);
      setLocalOptionGroups(updatedGroups);
      setOptionGroups(updatedGroups);

      // 삭제된 그룹이 현재 선택된 그룹이면 선택 초기화
      if (selectedGroupIndex === index) {
        setSelectedGroupIndex("");
        setOptionName("");
        setOptionPrice("");
      } else if (selectedGroupIndex > index) {
        // 삭제된 그룹 이후의 그룹이 선택되어 있었다면 인덱스 조정
        setSelectedGroupIndex(prev => prev - 1);
      }
    }
  };

  const handleRequiredChange = (index, checked) => {
    const updatedGroups = [...optionGroups];
    updatedGroups[index].isRequired = checked;
    setLocalOptionGroups(updatedGroups);
    setOptionGroups(updatedGroups);
  };

  const deleteOption = (groupIndex, optionIndex) => {
    const updatedGroups = [...optionGroups];
    updatedGroups[groupIndex].options.splice(optionIndex, 1);
    setLocalOptionGroups(updatedGroups);
    setOptionGroups(updatedGroups);
  };

  if (!modalState) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            옵션 그룹 관리
          </div>
          <div onClick={handleClose} className={styles.modalClose}>✕</div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.leftPanel}>
            <div className={styles.formGroup}>
              <select
                value={selectedGroupIndex}
                onChange={(e) => setSelectedGroupIndex(e.target.value === "" ? "" : Number(e.target.value))}
                className={selectedGroupIndex === "" ? styles.placeholder : ""}
              >
                <option value="">옵션 그룹 선택</option>
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
                onChange={(e) => setOptionName(e.target.value)}
                disabled={selectedGroupIndex === ""}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                placeholder="추가금액"
                type="number"
                min="0"
                value={optionPrice}
                onChange={(e) => setOptionPrice(e.target.value)}
                disabled={selectedGroupIndex === ""}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.addBtn} 
                onClick={addOptionToGroup}
                disabled={selectedGroupIndex === ""}
              >
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
                checked={true}
                readOnly
              />
              <label htmlFor="required">표시 시 필수 옵션으로 변환됩니다.</label>
            </div>

            <div className={styles.optionGroupList}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={optionGroups.map(group => group.groupName)}
                  strategy={verticalListSortingStrategy}
                >
                  {optionGroups.map((group, index) => (
                    <SortableOptionGroup
                      key={group.groupName}
                      group={group}
                      index={index}
                      onToggle={toggleGroup}
                      onDelete={deleteOptionGroup}
                      onRequiredChange={handleRequiredChange}
                      onDeleteOption={deleteOption}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
          <button onClick={handleClose} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}


