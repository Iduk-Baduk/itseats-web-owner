import { useState } from "react";
import styles from "./MenuList.module.css";
import { groupMenusByCategory } from "../../utils/groupMenus";
import { useSelector } from "react-redux";

export default function MenuList({ menu }) {
  const [selectedMenus, setSelectedMenus] = useState(new Set());
  const [menuStatuses, setMenuStatuses] = useState({});
  const groupNames = useSelector((state) => state.menu.groupNames);

  const handleCheckboxChange = (menuId, checked) => {
    const newSelected = new Set(selectedMenus);
    if (checked) {
      newSelected.add(menuId);
    } else {
      newSelected.delete(menuId);
    }
    setSelectedMenus(newSelected);
  };

  const handleStatusChange = (menuId, status) => {
    setMenuStatuses(prev => ({ ...prev, [menuId]: status }));
  };

  const groupedMenus = menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 
    ? groupMenusByCategory(menu.menus) 
    : {};

  return (
    <div>
      {menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 ? (
        groupNames.map((groupName) => (
          groupedMenus[groupName] && (
            <div key={groupName}>
              <h2 className={styles.groupTitle}>{groupName}</h2>
              <ul className={styles.menuList}>
                {groupedMenus[groupName].map((item) => (
                  <li key={item.menuId} className={styles.menuItem}>
                    <input 
                      type="checkbox" 
                      checked={selectedMenus.has(item.menuId)}
                      onChange={(e) => handleCheckboxChange(item.menuId, e.target.checked)}
                    />
                    <div className={styles.imageBox}></div>
                    <span className={styles.menuName}>{item.menuName}</span>
                    <select 
                      className={styles.statusSelect} 
                      value={menuStatuses[item.menuId] || item.menuStatus}
                      onChange={(e) => handleStatusChange(item.menuId, e.target.value)}
                    >
                      <option value="ONSALE">판매중</option>
                      <option value="OUT_OF_STOCK">오늘만 품절</option>
                      <option value="HIDDEN">메뉴숨김</option>
                    </select>
                  </li>
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
