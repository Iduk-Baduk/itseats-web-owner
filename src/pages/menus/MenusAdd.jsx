import Header from "../../components/common/Header";
import MenuInput from "../../components/menu/MenuInput";
import MenuOptionGroupModal from "../../components/menu/MenuOptionGroupModal";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuByIdAsync } from "../../store/menuSlice";

import styles from "./MenusAdd.module.css";

export default function MenusAdd() {
  const dispatch = useDispatch();
  const groupNames = useSelector((state) => state.menu.groupNames);
  const status = useSelector((state) => state.menu.status);
  const [menuData, setMenuData] = useState({
    menuGroupName: "",
    menuName: "",
    menuPrice: 0,
    menuStatus: "",
    menuDescription: "",
    // menuPriority
  });
  const [optionGroupModal, setMenuGroupModal] = useState(false);

  useEffect(() => {
    // 처음 로딩 시 메뉴 데이터를 가져옵니다.
    if (status !== "idle") {
      return;
    }

    dispatch(fetchMenuByIdAsync());
  }, [status, dispatch]);

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "failed") {
    return <div>데이터 로드 실패</div>;
  }

  const handleMenuInputChange = (field, value) => {
    setMenuData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.container}>
      <Header
        nickname="홍길동"
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div className={styles.main}>
        <h1 className={styles.title}>메뉴 관리</h1>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>메뉴 정보</th>
              <th>
                <input type="checkbox" id="selectAll" />
                <label htmlFor="selectAll">전체 선택</label>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <MenuInput
                  groupNames={groupNames}
                  onChange={handleMenuInputChange}
                  selectedState={menuData.state}
                  onSelectState={(value) => setMenuData((prev) => ({ ...prev, state: value }))}
                />
              </td>
              <td
                style={{ color: "green" }}
                onClick={() => {
                  setMenuGroupModal(true);
                }}
              >
                옵션 그룹 관리
              </td>
            </tr>
          </tbody>
        </table>

        {/* 하단 */}
        <footer>
          <div className={styles.actionButtons}>
            <button
              onClick={() => {
                console.log(menuData);
              }}
              className={styles.cancelButton}
            >
              취소
            </button>
            <button
              onClick={() => {
                console.log(menuData);
              }}
              className={styles.addButton}
            >
              추가
            </button>
          </div>
          <div className={styles.deleteText}>삭제하기</div>
        </footer>
      </div>
      {optionGroupModal && <MenuOptionGroupModal onClose={() => setMenuGroupModal(false)} />}
    </div>
  );
}
