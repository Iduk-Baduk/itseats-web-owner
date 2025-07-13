import Header from "../../components/common/Header";
import MenuInput from "../../components/menu/MenuInput";
import MenuOptionGroupModal from "../../components/menu/MenuOptionGroupModal";
import { UpArrayIcon, DownArrayIcon } from "../../components/common/Icons";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMenuDetailByMenuIdAsync } from "../../store/menuSlice";
import { menuAPI } from "../../services/menuAPI";
import { useAuth } from "../../contexts/AuthContext";

import styles from "./MenusAdd.module.css";

export default function MenusAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const storeId = currentUser.storeId;
  const { menuId } = useParams();

  const status = useSelector((state) => state.menu.status);
  const menuDetail = useSelector((state) => state.menu.menuDetail);
  const [menuData, setMenuData] = useState({
    menuGroupName: "",
    menuName: "",
    menuPrice: "",
    menuStatus: "ON_SALE",
    menuDescription: "",
  });
  const [optionGroupModal, setOptionGroupModal] = useState(false);
  const [optionGroups, setOptionGroups] = useState([]);
  const [groupOpenStates, setGroupOpenStates] = useState({});
  const [isEditMode] = useState(!!menuId);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchMenuDetailByMenuIdAsync({ storeId, menuId }));
    }
  }, [dispatch, storeId, menuId, isEditMode]);

  useEffect(() => {
    if (isEditMode && menuDetail) {
      setMenuData({
        menuGroupName: menuDetail.menuGroupName || "",
        menuName: menuDetail.menuName || "",
        menuPrice: menuDetail.menuPrice ? Number(menuDetail.menuPrice) : 0,
        menuStatus: menuDetail.menuStatus || "ON_SALE",
        menuDescription: menuDetail.menuDescription || "",
        menuPriority: menuDetail.menuPriority || -1,
      });
      setOptionGroups(menuDetail.optionGroups || []);
    }
  }, [isEditMode, menuDetail]);

  const handleMenuInputChange = (field, value) => {
    setMenuData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      return newData;
    });
  };

  const toggleGroupOpen = (index) => {
    setGroupOpenStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const validateMenuData = (payload) => {
    const errors = [];
    
    if (!payload.menuName?.trim()) {
      errors.push("메뉴명을 입력해주세요.");
    }
    if (!payload.menuPrice || isNaN(Number(payload.menuPrice))) {
      errors.push("올바른 메뉴 가격을 입력해주세요.");
    }
    if (!payload.menuStatus) {
      errors.push("메뉴 상태를 선택해주세요.");
    }
    if (!payload.menuGroupName?.trim()) {
      errors.push("메뉴 그룹을 선택해주세요.");
    }
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }
    return true;
  };

  const handleSaveMenu = async () => {
    try {
      const payload = {
        menuName: menuData.menuName,
        menuDescription: menuData.menuDescription,
        menuPrice: String(menuData.menuPrice),
        menuStatus: menuData.menuStatus,
        menuGroupName: menuData.menuGroupName,
        menuPriority: menuData.menuPriority,
        optionGroups: optionGroups.map((group) => ({
          optionGroupName: group.optionGroupName,
          isRequired: (group.minSelect > 0),
          maxSelect: group.maxSelect,
          minSelect: group.minSelect,
          priority: group.priority,
          options: group.options.map((opt) => ({
            optionName: opt.optionName,
            optionPrice: String(opt.optionPrice),
            optionStatus: opt.optionStatus,
            optionPriority: opt.optionPriority,
          })),
        })),
      };


      if (!validateMenuData(payload)) return;

      if (isEditMode) {
        await menuAPI.updateMenu(storeId, menuId, payload);
        alert("메뉴가 성공적으로 수정되었습니다.");
      } else {
        await menuAPI.addMenu(storeId, payload);
        alert("메뉴가 성공적으로 추가되었습니다.");
      }
      
      navigate("/menus");
    } catch (error) {
      console.error(isEditMode ? "메뉴 수정 실패:" : "메뉴 추가 실패:", error);
      alert(isEditMode ? "메뉴 수정에 실패했습니다." : "메뉴 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteMenu = async () => {
    if (!window.confirm("메뉴를 삭제하시겠습니까?")) return;
    
    try {
      await menuAPI.deleteMenu(storeId, menuId);
      alert("메뉴가 성공적으로 삭제되었습니다.");
      navigate("/menus");
    } catch (error) {
      console.error("메뉴 삭제 실패:", error);
      alert("메뉴 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "failed") {
    return <div>데이터 로드 실패</div>;
  }

  return (
    <div className={styles.container}>
      <Header
        nickname=""
        showBackButton={true}
        onLeftClick={() => navigate("/menus")}
      />
      <div className={styles.main}>
        <h1 className={styles.title}>{isEditMode ? "메뉴 수정" : "메뉴 추가"}</h1>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>메뉴 정보</th>
              <th>옵션 그룹</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <MenuInput
                  onChange={handleMenuInputChange}
                  selectedState={menuData.menuStatus}
                  onSelectState={(value) => handleMenuInputChange("menuStatus", value)}
                  initialData={menuData}
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
                          {group.optionGroupName}
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
                              <span>{option.optionName}</span>
                            </div>
                            <div className={styles.optionItemRight}>
                              <span>{option.optionPrice.toLocaleString()}원</span>
                              <select
                                value={option.optionStatus}
                                className={styles.optionStatus}
                                onChange={(e) => {
                                  setOptionGroups(prev => {
                                    const updatedGroups = [...prev];
                                    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex] };
                                    updatedGroups[groupIndex].options = [...updatedGroups[groupIndex].options];
                                    updatedGroups[groupIndex].options[optionIndex] = {
                                      ...updatedGroups[groupIndex].options[optionIndex],
                                      optionStatus: e.target.value,
                                    };
                                    return updatedGroups;
                                  });
                                }}
                              >
                                <option value="ON_SALE">판매중</option>
                                <option value="OUT_OF_STOCK">오늘만 품절</option>
                                <option value="HIDDEN">메뉴 숨김</option>
                              </select>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
                <div className={styles.optionManageButton} onClick={() => setOptionGroupModal(true)}>
                  옵션 그룹 관리
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.actionButtons}>
          <button onClick={() => navigate("/menus")} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={handleSaveMenu} className={styles.saveButton}>
            {isEditMode ? "수정" : "추가"}
          </button>
        </div>
        {isEditMode && (
          <div className={styles.deleteText} onClick={handleDeleteMenu}>
            메뉴 삭제
          </div>
        )}
      </div>

      <MenuOptionGroupModal
        onClose={() => setOptionGroupModal(false)}
        onSave={(groups) => {
          setOptionGroups(groups);
          setOptionGroupModal(false);
        }}
        optionGroups={optionGroups}
        setOptionGroups={setOptionGroups}
        modalState={optionGroupModal}
      />
    </div>
  );
}


