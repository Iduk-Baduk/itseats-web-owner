import styles from "./MenuActions.module.css";

export default function MenuAction({ handleAddMenu, handleManageMenuGroup, className }) {
  return (
    <div className={className}>
      <div className={styles.menuActions}>
        <div onClick={handleAddMenu}>
          <span className={styles.plus}>+</span>메뉴 추가
        </div>
        <div onClick={handleManageMenuGroup}>메뉴 그룹 관리</div>
      </div>
    </div>
  );
}
