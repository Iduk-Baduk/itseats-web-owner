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
    menuPrice: 0,
    menuStatus: "ONSALE",
    menuDescription: "",
  });
  const [optionGroupModal, setOptionGroupModal] = useState(false);
  const [optionGroups, setOptionGroups] = useState([]);
  const [groupOpenStates, setGroupOpenStates] = useState({});
  const [isEditMode] = useState(!!id);

  useEffect(() => {
    dispatch(fetchMenuByIdAsync());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && menus && menus.length > 0) {
      const menuToEdit = menus.find(menu => menu.id === id || menu.menuId === Number(id));
      if (menuToEdit) {
        setMenuData({
          menuGroupName: menuToEdit.menuGroupName || "",
          menuName: menuToEdit.menuName || "",
          menuPrice: menuToEdit.menuPrice || 0,
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
      }
    }
  }, [isEditMode, id, menus]);

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

  const validateMenuData = (payload) => {
    if (!payload.menuName) {
      alert("메뉴명을 입력해주세요.");
      return false;
    }
    if (!payload.menuPrice) {
      alert("메뉴 가격을 입력해주세요.");
      return false;
    }
    if (!payload.menuStatus) {
      alert("메뉴 상태를 선택해주세요.");
      return false;
    }
    if (!payload.menuGroupName || payload.menuGroupName === "선택") {
      alert("메뉴 그룹을 선택해주세요.");
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
            optionPrice: opt.price,
            optionStatus: opt.optionStatus,
          })),
        })),
      };

      if (!validateMenuData(payload)) return;

      if (isEditMode) {
        const menuToEdit = menus.find(menu => menu.id === id || menu.menuId === Number(id));
        const menuId = menuToEdit?.id || id;
        await menuAPI.updateMenu(menuId, payload);
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
                  groupNames={groupNames}
                  onChange={handleMenuInputChange}
                  selectedState={menuData.menuStatus}
                  onSelectState={(value) => setMenuData((prev) => ({ ...prev, menuStatus: value }))}
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
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.actions}>
          <button onClick={() => setOptionGroupModal(true)}>옵션 그룹 추가</button>
          <button onClick={handleSaveMenu}>{isEditMode ? "수정" : "추가"}</button>
        </div>
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


