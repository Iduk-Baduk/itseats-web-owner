import { useState } from "react";
import styles from "./MenuList.module.css";
import { groupMenusByCategory } from "../../utils/groupMenus";
import { useSelector } from "react-redux";

const MenuItem = ({ item, selectedMenuId, onMenuClick, menuStatuses, onStatusChange }) => {
  const handleClick = (e) => {
    if (e.target.tagName.toLowerCase() === 'select') {
      return;
    }
    onMenuClick(item.menuId || item.id);
  };

  return (
    <li
      className={`${styles.menuItem} ${selectedMenuId === (item.menuId || item.id) ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <div className={styles.imageBox}></div>
      <span className={styles.menuName}>{item.menuName}</span>
      <select
        className={styles.statusSelect}
        value={menuStatuses[item.menuId || item.id] || item.menuStatus}
        onChange={(e) => {
          e.stopPropagation();
          onStatusChange(item.menuId || item.id, e.target.value);
        }}
      >
        <option value="ONSALE">판매중</option>
        <option value="OUT_OF_STOCK">오늘만 품절</option>
        <option value="HIDDEN">메뉴숨김</option>
      </select>
    </li>
  );
};

export default function MenuList({ menu, onMenuSelect }) {
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuStatuses, setMenuStatuses] = useState({});
  const groupNames = useSelector((state) => state.menu.groupNames);

  const handleStatusChange = (menuId, status) => {
    setMenuStatuses(prev => ({ ...prev, [menuId]: status }));
  };

  const handleMenuClick = (menuId) => {
    console.log("Menu clicked:", menuId);
    const newSelectedId = selectedMenuId === menuId ? null : menuId;
    setSelectedMenuId(newSelectedId);
    onMenuSelect(newSelectedId);
  };

  const groupedMenus = menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 
    ? groupMenusByCategory(menu.menus) 
    : {};

  return (
    <div>
      {menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 ? (
        groupNames.map((groupName) => (
          groupedMenus[groupName] && (
            <div key={`group-${groupName}`}>
              <h2 className={styles.groupTitle}>{groupName}</h2>
              <ul className={styles.menuList}>
                {groupedMenus[groupName].map((item) => (
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
        ))
      ) : (
        <div>메뉴가 없습니다.</div>
      )}
    </div>
  );
}
