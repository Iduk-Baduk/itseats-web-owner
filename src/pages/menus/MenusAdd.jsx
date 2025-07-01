import Header from "../../components/common/Header";
import MenuInput from "../../components/menu/MenuInput";
import MenuOptionGroupModal from "../../components/menu/MenuOptionGroupModal";
import { UpArrayIcon, DownArrayIcon } from "../../components/common/Icons";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMenuByIdAsync } from "../../store/menuSlice";
import { menuAPI } from "../../services/menuAPI";

import styles from "./MenusAdd.module.css";

// ID 처리를 위한 헬퍼 함수 재사용
const getMenuId = (menu) => menu?.id || menu?.menuId;

const findMenuById = (menus, targetId) => {
  return menus.find(menu => {
    const menuId = getMenuId(menu);
    return String(menuId) === String(targetId);
  });
};

export default function MenusAdd() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const groupNames = useSelector((state) => state.menu.groupNames);
  const status = useSelector((state) => state.menu.status);
  const menus = useSelector((state) => state.menu.menu.menus);
  const [menuData, setMenuData] = useState({
    menuGroupName: "",
    menuName: "",
    menuPrice: "",
    menuStatus: "ONSALE",
    menuDescription: "",
  });
  const [optionGroupModal, setOptionGroupModal] = useState(false);
  const [optionGroups, setOptionGroups] = useState([]);
  const [groupOpenStates, setGroupOpenStates] = useState({});
  const [isEditMode] = useState(!!id);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchMenuByIdAsync());
    }
  }, [dispatch, isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      // 먼저 전체 메뉴 목록을 가져와서 실제 ID를 찾습니다
      const fetchMenuData = async () => {
        try {
          const menusResponse = await menuAPI.getMenus();
          const menuToEdit = menusResponse.find(menu => String(menu.menuId) === String(id));
          
          if (!menuToEdit) {
            throw new Error('메뉴를 찾을 수 없습니다.');
          }

          console.log("Found menu to edit:", menuToEdit);
          setMenuData({
            menuGroupName: menuToEdit.menuGroupName || "",
            menuName: menuToEdit.menuName || "",
            menuPrice: menuToEdit.menuPrice || "",
            menuStatus: menuToEdit.menuStatus || "ONSALE",
            menuDescription: menuToEdit.menuDescription || "",
          });
          
          if (menuToEdit.optionGroups) {
            setOptionGroups(menuToEdit.optionGroups.map(group => ({
              groupName: group.optionGroupName,
              isRequired: group.isRequired || false,
              options: group.options ? group.options.map(opt => ({
                name: opt.optionName,
                price: opt.optionPrice || 0,
                optionStatus: opt.optionStatus || "ONSALE",
              })) : []
            })));
          } else {
            setOptionGroups([]);
          }
        } catch (error) {
          console.error("Failed to fetch menu data:", error);
          alert("메뉴 데이터를 불러오는데 실패했습니다.");
          navigate("/menus"); // 실패 시 메뉴 목록으로 이동
        }
      };

      fetchMenuData();
    }
  }, [isEditMode, id, navigate]);

  const handleMenuInputChange = (field, value) => {
    console.log("Changing field:", field, "to value:", value);
    setMenuData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      console.log("New menu data:", newData);
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
        optionGroups: optionGroups.map((group) => ({
          optionGroupName: group.groupName,
          isRequired: group.isRequired,
          options: group.options.map((opt) => ({
            optionName: opt.name,
            optionPrice: String(opt.price),
            optionStatus: opt.optionStatus,
          })),
        })),
      };

      console.log("Saving menu with payload:", payload);

      if (!validateMenuData(payload)) return;

      if (isEditMode) {
        // 전체 메뉴 목록을 가져와서 실제 ID를 찾습니다
        const menusResponse = await menuAPI.getMenus();
        const menuToEdit = menusResponse.find(menu => String(menu.menuId) === String(id));
        
        if (!menuToEdit) {
          throw new Error('메뉴를 찾을 수 없습니다.');
        }

        console.log("Updating menu with ID:", menuToEdit.id, "Payload:", payload);
        await menuAPI.updateMenu(menuToEdit.id, payload);
        alert("메뉴가 성공적으로 수정되었습니다.");
      } else {
        await menuAPI.addMenu(payload);
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
      // 전체 메뉴 목록을 가져와서 실제 ID를 찾습니다
      const menusResponse = await menuAPI.getMenus();
      const menuToEdit = menusResponse.find(menu => String(menu.menuId) === String(id));
      
      if (!menuToEdit) {
        throw new Error('메뉴를 찾을 수 없습니다.');
      }

      await menuAPI.deleteMenu(menuToEdit.id);
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
        nickname="홍길동"
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


