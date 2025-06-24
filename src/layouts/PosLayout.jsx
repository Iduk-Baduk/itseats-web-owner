import { useState } from "react";
import PosHeader from "../components/common/PosHeader";
import PosOrderModal from "../components/pos/PosOrderModal";
import { Outlet } from "react-router-dom";

export default function PosLayout() {
  const [isReceivingOrders, setIsReceivingOrders] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // 주문 접수 상태와 모달 표시 상태 관리
  const handleToggle = () => {
    if (isReceivingOrders) {
      setShowPauseModal(true);
    } else {
      setIsReceivingOrders(true);
    }
  };

  const handlePause = (minutes) => {
    setIsReceivingOrders(false);
    setShowPauseModal(false);
    // 정지 시간 처리 로직 추가
    console.log(`🕰️접수 일시 중지: ${minutes}분`);
  };

  return (
    <>
      <PosHeader isReceivingOrders={isReceivingOrders} onToggle={handleToggle} />
      <Outlet />
      {showPauseModal && (
        <PosOrderModal onSelect={handlePause} onClose={() => setShowPauseModal(false)} />
      )}
    </>
  );
}
