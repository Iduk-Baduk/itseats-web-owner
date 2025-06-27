import styles from "./MenuStore.module.css";
export default function MenuStore({ menu }) {
  return (
    <>
      {/* TODO: 추후 여러 매장 API 고려 */}
      <div className={styles.storeSelector}>
        <select>
          <option value="잠실 커피 로스터리">잠실 커피 로스터리</option>
          <option value="강남 커피 로스터리">강남 커피 로스터리</option>
          <option value="홍대 커피 로스터리">홍대 커피 로스터리</option>
        </select>
      </div>
    </>
  );
}
