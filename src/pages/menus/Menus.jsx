import Header from "../../components/common/Header";
import styles from "./Menus.module.css";

export default function Menus() {
  return (
    <>
      <Header
        nickname="홍길동"
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div className={styles.container}>
        <h1>메뉴 관리</h1>
        <p style={{ height: "2300px" }}>Manage your Menus here.</p>
      </div>
    </>
  );
}
