import { useSelector } from "react-redux";
import { useState } from "react";
import PosOrderItem from "../../components/pos/PosOrderCard";
import PostSideBar from "../../components/pos/PosSideBar";
import styles from "./PosOrders.module.css";

export default function PosOrders() {
  const orders = useSelector((state) => state.order);
  const [currentTab, setCurrentTab] = useState("접수대기");

  // 탭별로 주문 필터링
  const filteredOrders = orders.filter((order) => {
    if (currentTab === "접수대기") return order.deliveryStatus === "COKING";
    if (currentTab === "진행중") return order.deliveryStatus === "DELIVERING";
    if (currentTab === "주문내역") return order.deliveryStatus === "COMPLETED";
    return true;
  });

  return (
    <div className={styles.container}>
      <PostSideBar currentTab={currentTab} onSelect={setCurrentTab} />
      <div className={styles.content}>
        {filteredOrders.map((order) => (
          <PosOrderItem key={order.orderNumber} order={order} />
        ))}
      </div>
    </div>
  );
}
