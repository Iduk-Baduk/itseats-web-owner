import { useState, useEffect } from "react";
import styles from "./MenuInput.module.css";
import MenuGroupModal from "./MenuGroupModal";
import { useSelector } from "react-redux";

export default function MenuInput({ onChange, selectedState, onSelectState, initialData }) {
  const [menuGroupModal, setMenuGroupModal] = useState(false); // 메뉴 그룹 관리 모달
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [formData, setFormData] = useState({
    menuGroupName: "",
    menuName: "",
    menuPrice: "",
    menuDescription: "",
  });
  const reduxGroupNames = useSelector((state) => state.menu.groupNames);

  useEffect(() => {
    if (initialData) {
      setFormData({
        menuGroupName: initialData.menuGroupName || "",
        menuName: initialData.menuName || "",
        menuPrice: initialData.menuPrice || "",
        menuDescription: initialData.menuDescription || "",
      });
      setDescriptionLength(initialData.menuDescription?.length || 0);
    }
  }, [initialData]);

  // 메뉴 그룹이 없는 경우 기본값 설정
  useEffect(() => {
    if (initialData && !initialData.menuGroupName && reduxGroupNames.length > 0) {
      onChange("menuGroupName", reduxGroupNames[0]);
    }
  }, [initialData, reduxGroupNames, onChange]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    onChange(field, value);
  };

  return (
    <div className={styles.form}>
      <div className={styles.formGroup}>
        <div className={styles.menuGroupController} onClick={() => setMenuGroupModal(true)}>
          메뉴 그룹 관리
        </div>
        <MenuGroupModal
          groupNames={reduxGroupNames}
          modalState={menuGroupModal}
          setModalState={setMenuGroupModal}
          setGroupNames={(newGroups) => onChange("groupNames", newGroups)}
          onclose={() => setMenuGroupModal(false)}
        />

        {/* 1. 그룹 선택 */}
        <select
          value={formData.menuGroupName}
          className={styles.select}
          onChange={(e) => handleChange("menuGroupName", e.target.value)}
        >
          <option value="" disabled>메뉴 그룹 선택</option>
          {reduxGroupNames.map((groupName, index) => (
            <option key={index} value={groupName}>
              {groupName}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 메뉴명 선택 */}
      <div className={styles.formGroup}>
        <input
          placeholder="메뉴명"
          value={formData.menuName}
          onChange={(e) => handleChange("menuName", e.target.value)}
          className={styles.input}
        />
      </div>

      {/* 3. 가격 */}
      <div className={styles.formGroup}>
        <input
          placeholder="금액 입력"
          value={formData.menuPrice}
          onChange={(e) => handleChange("menuPrice", e.target.value)}
          type="number"
          className={styles.input}
          min="0"
        />
      </div>

      {/* 4. 상태 선택 */}
      <div className={styles.buttonGroup}>
        <button
          onClick={(e) => {
            onChange("menuStatus", e.currentTarget.value);
            onSelectState(e.currentTarget.value);
          }}
          value="ON_SALE"
          className={`${styles.grayButton} ${selectedState === "ON_SALE" ? styles.selected : ""}`}
        >
          판매중
        </button>
        <button
          onClick={(e) => {
            onChange("menuStatus", e.currentTarget.value);
            onSelectState(e.currentTarget.value);
          }}
          value="OUT_OF_STOCK"
          className={`${styles.grayButton} ${
            selectedState === "OUT_OF_STOCK" ? styles.selected : ""
          }`}
        >
          오늘만 품절
        </button>
        <button
          onClick={(e) => {
            onChange("menuStatus", e.currentTarget.value);
            onSelectState(e.currentTarget.value);
          }}
          value="HIDDEN"
          className={`${styles.grayButton} ${selectedState === "HIDDEN" ? styles.selected : ""}`}
        >
          메뉴 숨김
        </button>
      </div>

      {/* 4. 설명 입력(선택) */}
      <div className={styles.formGroup}>
        <textarea
          maxLength={60}
          className={styles.textarea}
          placeholder="메뉴 구성 또는 설명글 입력 (선택사항)"
          value={formData.menuDescription}
          onChange={(e) => {
            handleChange("menuDescription", e.target.value);
            setDescriptionLength(e.target.value.length);
          }}
        />
        <div className={styles.charCount}>{descriptionLength}/60</div>
      </div>

      <div className={styles.helpBox}>
        <div className={styles.helpTitle}>이 메뉴의 주문률을 높이고 싶다면?</div>
        <div>아래 예시처럼 써보세요.</div>
        <ul>
          <li>
            <b>상세 설명 타입:</b> 뿌셔닭 단위 독특 간장소스를 입힌 치킨
          </li>
          <li>
            <b>구성 안내 타입:</b> 양념 반 + 후라이드 반
          </li>
        </ul>
      </div>
    </div>
  );
}
