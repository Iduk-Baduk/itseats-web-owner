import Header from "../../components/common/Header";
import styles from "./Stores.module.css";

export default function Stores() {
  return (
    <>
      <Header
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div className={styles.container}>
        <h1>매장 관리</h1>
        <p style={{ height: "2300px" }}>Manage your Stores here.</p>
      </div>
    </>
  );
}
