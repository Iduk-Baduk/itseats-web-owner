import Header from "../../components/common/Header";
import styles from "./Sales.module.css";

export default function Sales() {
  return (
    <>
      <Header
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div className={styles.container}>
        <h1>매출 관리</h1>
        <p style={{ height: "2300px" }}>Manage your sales here.</p>
      </div>
    </>
  );
}
