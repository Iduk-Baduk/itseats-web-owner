import Header from "../../components/common/Header";
import styles from "./Settlements.module.css";

export default function Settlements() {
  return (
    <>
      <Header
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div className={styles.container}>
        <h1>정산 관리</h1>
        <p style={{ height: "2300px" }}>Manage your Settlements here.</p>
      </div>
    </>
  );
}
