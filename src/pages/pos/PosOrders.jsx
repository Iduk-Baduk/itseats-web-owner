import { useSelector } from "react-redux";
import { useState } from "react";
import PosOrderItem from "../../components/pos/PosOrderCard";
import PosSideBar from "../../components/pos/PosSideBar";
import PosOrderDetailModal from "../../components/pos/PosOrderDetailModal";

import styles from "./PosOrders.module.css";

export default function PosOrders() {
  const orders = useSelector((state) => state.order);
  const [currentTab, setCurrentTab] = useState("접수대기");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 탭별로 주문 필터링
  const filteredOrders = orders.filter((order) => {
    if (currentTab === "접수대기") return order.deliveryStatus === "COOKING";
    if (currentTab === "진행중") return order.deliveryStatus === "DELIVERING";
    if (currentTab === "주문내역") return order.deliveryStatus === "COMPLETED";
    return true;
  });

  // 주문 카드 클릭 시 모달 오픈
  const handleOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
  };

  // 모달 닫기
  const handleCloseModal = () => setSelectedOrderId(null);

  // 주문 수락/거절 예시 핸들러
  const handleAccept = () => {
    // 주문 수락 로직
    setSelectedOrderId(null);
  };
  const handleReject = () => {
    // 주문 거절 로직
    setSelectedOrderId(null);
  };

  return (
    <div className={styles.container}>
      <PosSideBar currentTab={currentTab} onSelect={setCurrentTab} />
      <div className={styles.content}>
        {filteredOrders.map((order) => (
          <PosOrderItem
            key={order.orderNumber}
            order={order}
            onClick={() => handleOrderClick(order.orderId)}
          />
        ))}
      </div>
      {selectedOrderId && (
        <PosOrderDetailModal
          order={orders.orderId}
          onClose={handleCloseModal}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
