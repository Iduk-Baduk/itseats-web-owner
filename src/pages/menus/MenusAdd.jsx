import Header from "../../components/common/Header";
import MenuInput from "../../components/menu/MenuInput";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMenuByIdAsync } from "../../store/menuSlice";

import styles from "./MenusAdd.module.css";

export default function MenusAdd() {
  const dispatch = useDispatch();
  const groupNames = useSelector((state) => state.menu.groupNames);
  const status = useSelector((state) => state.menu.status);

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
              <label>
                <input type="checkbox" /> 전체 선택
              </label>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <MenuInput groupNames={groupNames} className={styles.MenuInput} />
              </td>
              <td style={{ color: "green" }}>옵션 그룹 관리</td>
            </tr>
          </tbody>
        </table>

        {/* 하단 */}
        <footer>
          <div className={styles.actionButtons}>
            <button className={styles.cancelButton}>취소</button>
            <button className={styles.addButton}>추가</button>
          </div>
          <div className={styles.deleteText}>삭제하기</div>
        </footer>
      </div>
    </div>
  );
}
