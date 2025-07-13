import { useState } from "react";
import styles from "./MenuList.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { menuAPI } from "../../services/menuAPI";

const MenuItem = ({
  item,
  selectedMenuId,
  onMenuClick,
  menuStatuses,
  onStatusChange,
}) => {
  const handleClick = (e) => {
    if (e.target.tagName.toLowerCase() === "select") {
      return;
    }
    onMenuClick(item.menuId || item.id);
  };

  return (
    <li
      className={`${styles.menuItem} ${
        selectedMenuId === (item.menuId || item.id) ? styles.selected : ""
      }`}
      onClick={handleClick}
    >
      <div className={styles.imageBox}>
        {item?.images[0] && (
          <img
            src={item.images[0]}
            alt={item.menuName}
            className={styles.menuImage}
          />
        )}
      </div>
      <span className={styles.menuName}>{item.menuName}</span>
      <select
        className={styles.statusSelect}
        value={menuStatuses[item.menuId || item.id] || item.menuStatus}
        onChange={(e) => {
          e.stopPropagation();
          onStatusChange(item.menuId || item.id, e.target.value);
        }}
      >
        <option value="ON_SALE">판매중</option>
        <option value="OUT_OF_STOCK">오늘만 품절</option>
        <option value="HIDDEN">메뉴숨김</option>
      </select>
    </li>
  );
};

export default function MenuList({ menu, onMenuSelect }) {
  const { currentUser } = useAuth();
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuStatuses, setMenuStatuses] = useState({});
  const groupNames = [...new Set(menu.menus.map(item => item.menuGroupName))];

  const handleStatusChange = async (menuId, status) => {
    const previousStatus = menuStatuses[menuId] || menu.menus.find(m => (m.menuId || m.id) === menuId)?.menuStatus;
    try {
      setMenuStatuses((prev) => ({ ...prev, [menuId]: status }));
      await menuAPI.updateMenuStatus(currentUser.storeId, menuId, status);
      alert("상태 업데이트에 성공하였습니다.");
    } catch (error) {
      // 에러 발생 시 이전 상태로 롤백
      setMenuStatuses((prev) => ({ ...prev, [menuId]: previousStatus }));
      alert("상태 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleMenuClick = (menuId) => {
    console.log("Menu clicked:", menuId);
    const newSelectedId = selectedMenuId === menuId ? null : menuId;
    setSelectedMenuId(newSelectedId);
    onMenuSelect(newSelectedId);
  };

  return (
    <div>
      {menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 ? (
        groupNames.map(
          (groupName) => (
              <div key={`group-${groupName}`}>
                <h2 className={styles.groupTitle}>{groupName}</h2>
                <ul className={styles.menuList}>
                  {menu.menus
                    .filter((item) => item.menuGroupName === groupName)
                    .map((item) => (
                      <MenuItem
                      key={`menu-${item.menuId || item.id}`}
                      item={item}
                      selectedMenuId={selectedMenuId}
                      onMenuClick={handleMenuClick}
                      menuStatuses={menuStatuses}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </ul>
              </div>
            )
        )
      ) : (
        <div>메뉴가 없습니다.</div>
      )}
    </div>
  );
}
