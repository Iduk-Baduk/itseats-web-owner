import { useState } from "react";
import { Outlet } from "react-router-dom";

import PosHeader from "../components/common/PosHeader";
import PosSelectModal from "../components/common/PosSelectModal";

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
        <PosSelectModal
          title="주문 일시 정지"
          description="일시 정지할 시간을 선택해 주세요"
          subDescription="일시 정지는 언제든지 해체할 수 있어요"
          options={[5, 10, 15]}
          optionUnit="분"
          onSelect={handlePause}
          onClose={() => setShowPauseModal(false)}
        />
      )}
    </>
  );
}
