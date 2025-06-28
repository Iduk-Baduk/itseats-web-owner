import styles from "./MenuInput.module.css";

export default function MenuInput({ groupNames }) {
  return (
    <div className={styles.form}>
      <div className={styles.formGroup}>
        <select defaultValue="선택" className={styles.select}>
          <option value="선택">선택</option>
          {groupNames.map((groupName, index) => (
            <option key={index} value={groupName}>
              {groupName}
            </option>
          ))}
          <option value="기타">기타</option>
        </select>
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
        <button className={styles.grayButton}>메뉴 숨김</button>
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
    </div>
  );
}
