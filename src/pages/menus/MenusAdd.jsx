import Header from "../../components/common/Header";
import MenuInput from "../../components/menu/MenuInput";
import MenuOptionGroupModal from "../../components/menu/MenuOptionGroupModal";
import { UpArrayIcon, DownArrayIcon } from "../../components/common/Icons";

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
  const [optionGroups, setOptionGroups] = useState([]);
  const [groupOpenStates, setGroupOpenStates] = useState({});

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
                const payload = {
                  menuName: menuData.menuName,
                  menuDescription: menuData.menuDescription,
                  menuPrice: String(menuData.menuPrice),
                  menuStatus: menuData.menuStatus,
                  menuGroupName: menuData.menuGroupName,
                  optionGroups: optionGroups.map((group, groupIndex) => ({
                    optionGroupName: group.groupName,
                    isRequired: group.isRequired,
                    options: group.options.map((opt, optIndex) => ({
                      optionName: opt.name,
                      optionPrice: opt.price,
                      optionStatus: opt.optionStatus,
                    })),
                  })),
                };

                console.log(JSON.stringify(payload, null, 2));
              }}
              className={styles.addButton}
            >
              추가
            </button>
          </div>
          <div className={styles.deleteText}>삭제하기</div>
        </footer>
      </div>
      {optionGroupModal && (
        <MenuOptionGroupModal
          onClose={() => setMenuGroupModal(false)}
          onSave={(data) => setOptionGroups((prev) => [...prev, ...data])}
        />
      )}
    </div>
  );
}


