import styles from "./MenuActions.module.css";
import { PencilIcon, PlusIcon } from "../../components/common/Icons";

export default function MenuAction({ handleAddMenu, handleManageMenuGroup, className, selectedMenuId }) {
  return (
    <div className={className}>
      <div className={styles.menuActions}>
        <div 
          onClick={handleAddMenu}
          className={styles.actionLink}
        >
          {selectedMenuId ? (
            <>
              <PencilIcon className={styles.icon} />
              메뉴 수정
            </>
          ) : (
            <>
              <PlusIcon className={styles.icon} />
              메뉴 추가
            </>
          )}
        </div>
        <div 
          onClick={handleManageMenuGroup}
          className={styles.actionLink}
        >
          메뉴 그룹 관리
        </div>
      </div>
    </div>
  );
}
