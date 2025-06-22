import { Outlet } from "react-router-dom";
import styles from "./PosLayout.module.css";
import PosHeader from "../components/common/PosHeader";
import { useState } from "react";

export default function PosLayout() {

  const [isReceivingOrders, setIsReceivingOrders] = useState(false);

  return (
    <>
      <div className={styles.app}>
        <PosHeader
          isReceivingOrders={isReceivingOrders}
          onToggle={() => setIsReceivingOrders((prev) => !prev)}
        />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}