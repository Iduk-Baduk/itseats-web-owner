import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/common/Header";
import styles from "./MenusAdd.module.css";
import { useEffect } from "react";
import { fetchMenuByIdAsync } from "../../store/menuSlice";

export default function MenusAdd() {
  const dispatch = useDispatch();
  const groupNames = useSelector((state) => state.menu.groupNames);
  const status = useSelector((state) => state.menu.status);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMenuByIdAsync());
    }
  }, [status, dispatch]); // status와 dispatch를 의존성 배열에 추가

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
      <main className={styles.main}>
        <h1 className={styles.title}>메뉴 관리</h1>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>카테고리</label>
            <select className={styles.input}>
              {groupNames.map((groupName, index) => (
                <option key={index} value={groupName}>
                  {groupName}
                </option>
              ))}
              <option value="기타">기타</option>
            </select>
            <div className={styles.editOption}>옵션 그룹 편집</div>
          </div>

          <div className={styles.formGroup}>
            <label>메뉴명</label>
            <input className={styles.input} placeholder="메뉴명 입력" />
          </div>

          <div className={styles.formGroup}>
            <label>가격(원)</label>
            <input type="number" className={styles.input} defaultValue={0} />
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.grayButton}>판매중</button>
            <button className={styles.grayButton}>오늘만 품절</button>
            <button className={styles.greenButton}>메뉴 숨김</button>
          </div>

          <div className={styles.formGroup}>
            <textarea
              maxLength={60}
              className={styles.textarea}
              placeholder="메뉴 구성 또는 설명글 입력 (선택사항)"
            />
            <div className={styles.charCount}>0/60</div>
          </div>

          <div className={styles.helpBox}>
            <div className={styles.helpTitle}>이 메뉴의 주문률을 높이고 싶다면?</div>
            <div>아래 예시처럼 써보세요.</div>
            <ul>
              <li>
                <b>상세 설명 타입:</b> 뿌셔닭 단위 독특 간장소스를 입힌 치킨
              </li>
              <li>
                <b>구성 안내 타입:</b> 양념 반 + 후라이드 반
              </li>
            </ul>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.cancelButton}>취소</button>
            <button className={styles.addButton}>추가</button>
          </div>

          <div className={styles.deleteText}>삭제하기</div>
        </div>
      </main>
    </div>
  );
}
