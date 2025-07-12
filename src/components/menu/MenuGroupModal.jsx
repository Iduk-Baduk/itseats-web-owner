import Button from "../basic/Button";
import { useEffect, useState } from "react";
import { addGroupName, setAllGroupNames, fetchMenuByIdAsync } from "../../store/menuSlice";
import styles from "./MenuGroupModal.module.css";
import { useDispatch } from "react-redux";
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
import SortableGroupItem from "./SortableGroupItem";

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

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTempGroups((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 추가 핸들러
  const handleAddGroup = () => {
    const trimmed = newGroup.trim();
    if (!trimmed) {
      return;
    }
    if (tempGroups.includes(trimmed)) {
      alert("이미 존재하는 그룹명입니다.");
      return;
    }
    setTempGroups([...tempGroups, trimmed]);
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
  const handleApply = async () => {
    // 만약 임시 그룹과 기존 그룹이 동일하다면 아무 작업도 하지 않습니다.
    const areEqual =
      tempGroups.length === groupNames.length &&
      tempGroups.every((group, index) => group === groupNames[index]);

    if (areEqual) {
      return;
    }

    // 목록 전체를 교체하는 올바른 액션을 사용합니다.
    dispatch(setAllGroupNames(tempGroups));
    setGroupNames(tempGroups);
    
    // 메뉴 데이터를 다시 불러옵니다.
    await dispatch(fetchMenuByIdAsync());
    
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tempGroups}
                  strategy={verticalListSortingStrategy}
                >
                  {tempGroups.map((group) => (
                    <SortableGroupItem
                      key={group}
                      id={group}
                      group={group}
                      onDelete={() => handleDeleteGroup(tempGroups.indexOf(group))}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
