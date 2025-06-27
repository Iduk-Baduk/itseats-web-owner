import styles from "./MenuList.module.css";

export default function MenuList({ menu }) {
  return (
    <div>
      {menu.menus && menu.menus.length > 0 ? (
        Object.entries(
          menu.menus.reduce((acc, item) => {
            const group = item.menuGroupName || "기타";
            if (!acc[group]) {
              // 그룹이 없으면 초기화
              acc[group] = [];
            }
            acc[group].push(item);
            return acc;
          }, {})
        ).map(([groupName, items]) => (
          <div key={groupName}>
            <h2 className={styles.groupTitle}>{groupName}</h2>
            <ul className={styles.menuList}>
              {items.map((item) => (
                <li key={item.menuId} className={styles.menuItem}>
                  <input type="checkbox" />
                  <div className={styles.imageBox}></div>
                  <span className={styles.menuName}>{item.menuName}</span>
                  <select className={styles.statusSelect} defaultValue={item.menuStatus}>
                    <option value="ONSALE">판매중</option>
                    <option value="OUT_OF_STOCK">오늘만 품절</option>
                    <option value="HIDDEN">메뉴숨김</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div>메뉴가 없습니다.</div>
      )}
    </div>
  );
}
