import { Outlet } from "react-router-dom";
import styles from "./PosLayout.module.css";
import PosHeader from "../components/common/PosHeader";

export default function PosLayout() {

  return (
    <>
      <div className={styles.app}>
        <PosHeader
          isReceivingOrders={true}
          onToggle={() => setIsReceivingOrders((prev) => !prev)}
        />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}