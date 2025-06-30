import Header from "../../components/common/Header";
import MenuInput from "../../components/menu/MenuInput";
import MenuOptionGroupModal from "../../components/menu/MenuOptionGroupModal";
import { UpArrayIcon, DownArrayIcon } from "../../components/common/Icons";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMenuByIdAsync } from "../../store/menuSlice";
import { menuAPI } from "../../services/menuAPI";

import styles from "./MenusAdd.module.css";

export default function MenusAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [optionGroups, setOptionGroups] = useState([]);
  const [groupOpenStates, setGroupOpenStates] = useState({});
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    console.log(optionGroups);
  }, [optionGroups]);

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

  const toggleGroupOpen = (index) => {
    setGroupOpenStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddMenu = async () => {
    try {
      const payload = {
        menuName: menuData.menuName,
        menuDescription: menuData.menuDescription,
        menuPrice: String(menuData.menuPrice),
        menuStatus: menuData.menuStatus,
        menuGroupName: menuData.menuGroupName,
        optionGroups: optionGroups.map((group) => ({
          optionGroupName: group.groupName,
          isRequired: group.isRequired,
          options: group.options.map((opt) => ({
            optionName: opt.name,
            optionPrice: opt.price,
            optionStatus: opt.optionStatus,
          })),
        })),
      };

      // 필수 필드 검증
      if (!payload.menuName) {
        alert("메뉴명을 입력해주세요.");
        return;
      }
      if (!payload.menuPrice) {
        alert("메뉴 가격을 입력해주세요.");
        return;
      }
      if (!payload.menuStatus) {
        alert("메뉴 상태를 선택해주세요.");
        return;
      }
      if (!payload.menuGroupName || payload.menuGroupName === "선택") {
        alert("메뉴 그룹을 선택해주세요.");
        return;
      }

      // API 호출
      await menuAPI.addMenu(payload);
      
      alert("메뉴가 성공적으로 추가되었습니다.");
      navigate("/menus");
    } catch (error) {
      console.error("메뉴 추가 실패:", error);
      alert("메뉴 추가에 실패했습니다. 다시 시도해주세요.");
    }
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
                <input 
                  type="checkbox" 
                  id="selectAll"
                  checked={allSelected}
                  onChange={(e) => {
                    setAllSelected(e.target.checked);
                  }}
                />
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
                  selectedState={menuData.menuStatus}
                  onSelectState={(value) => setMenuData((prev) => ({ ...prev, menuStatus: value }))}
                />
              </td>
              <td>
                {optionGroups.map((group, groupIndex) => {
                  const isOpen = groupOpenStates[groupIndex] ?? true;
                  return (
                    <div
                      key={groupIndex}
                      className={styles.optionGroup}
                    >
                      <div
                        className={styles.optionGroupHeader}
                        onClick={() => toggleGroupOpen(groupIndex)}
                      >
                        <span>
                          {group.isRequired ? "필수 " : ""}
                          {group.groupName}
                        </span>
                        <span>{isOpen ? <UpArrayIcon /> : <DownArrayIcon />}</span>
                      </div>
                      {isOpen &&
                        group.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={styles.optionItem}
                          >
                            <div className={styles.optionItemLeft}>
                              <span>{option.name}</span>
                            </div>
                            <div className={styles.optionItemRight}>
                              <span>{option.price.toLocaleString()}원</span>
                              <select
                                value={option.optionStatus}
                                className={styles.optionStatus}
                                onChange={(e) => {
                                  const updatedGroups = [...optionGroups];
                                  updatedGroups[groupIndex].options[optionIndex].optionStatus = e.target.value;
                                  setOptionGroups(updatedGroups);
                                }}
                              >
                                <option value="ONSALE">판매중</option>
                                <option value="OUT_OF_STOCK">오늘만 품절</option>
                                <option value="HIDDEN">메뉴 숨김</option>
                              </select>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
                <div
                  className={styles.optionManageButton}
                  onClick={() => {
                    setMenuGroupModal(true);
                  }}
                >
                  옵션 그룹 관리
                </div>

                {/* 옵션 그룹 관리 모달 */}
                {optionGroupModal && (
                  <MenuOptionGroupModal
                    onClose={() => setMenuGroupModal(false)}
                    onSave={(updatedGroups) => {
                      setOptionGroups(updatedGroups);
                      setMenuGroupModal(false);
                    }}
                    optionGroups={optionGroups}
                    setOptionGroups={setOptionGroups}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 하단 */}
        <footer>
          <div className={styles.actionButtons}>
            <button
              onClick={() => navigate(-1)}
              className={styles.cancelButton}
            >
              취소
            </button>
            <button
              onClick={handleAddMenu}
              className={styles.saveButton}
            >
              저장
            </button>
          </div>
          <div className={styles.deleteText}>삭제하기</div>
        </footer>
      </div>
    </div>
  );
}


