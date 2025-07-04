import { useState, useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { POS_STATUS } from "../constants/posStatus";
import posAPI from "../services/posAPI";

import PosHeader from "../components/common/PosHeader";
import PosSelectModal from "../components/common/PosSelectModal";

export default function PosLayout() {
  const { currentUser } = useAuth();
  const [isReceivingOrders, setIsReceivingOrders] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [posStatus, setPosStatus] = useState(POS_STATUS.CLOSED);

  // POS 상태 로드
  useEffect(() => {
    const loadPosStatus = async () => {
      try {
        const status = await posAPI.getPosStatus(currentUser?.posId);
        setPosStatus(status);
        setIsReceivingOrders(status === POS_STATUS.OPEN);
      } catch (err) {
        console.error('Failed to load POS status:', err);
      }
    };

    if (currentUser?.posId) {
      loadPosStatus();
    }
  }, [currentUser]);

  // 주문 접수 상태와 모달 표시 상태 관리
  const handleToggle = async () => {
    if (isReceivingOrders) {
      setShowPauseModal(true);
    } else {
      try {
        await posAPI.updatePosStatusWithNotification(currentUser?.posId, {
          status: POS_STATUS.OPEN,
          reason: '수동으로 주문 접수 시작',
          userId: currentUser?.userId,
          userName: currentUser?.userName,
          category: 'MANUAL'
        });
        setPosStatus(POS_STATUS.OPEN);
        setIsReceivingOrders(true);
      } catch (err) {
        console.error('Failed to update POS status:', err);
      }
    }
  };

  const handlePause = async (minutes) => {
    try {
      await posAPI.updatePosStatusWithNotification(currentUser?.posId, {
        status: POS_STATUS.BREAK,
        reason: `${minutes}분 동안 주문 접수 일시 정지`,
        userId: currentUser?.userId,
        userName: currentUser?.userName,
        category: 'MANUAL'
      });
      setPosStatus(POS_STATUS.BREAK);
      setIsReceivingOrders(false);
      setShowPauseModal(false);
      
      // minutes 후에 자동으로 주문 접수 상태로 변경
      setTimeout(async () => {
        try {
          await posAPI.updatePosStatusWithNotification(currentUser?.posId, {
            status: POS_STATUS.OPEN,
            reason: '일시 정지 시간 종료',
            userId: currentUser?.userId,
            userName: currentUser?.userName,
            category: 'MANUAL'
          });
          setPosStatus(POS_STATUS.OPEN);
          setIsReceivingOrders(true);
        } catch (err) {
          console.error('Failed to resume POS status:', err);
        }
      }, minutes * 60 * 1000);
    } catch (err) {
      console.error('Failed to pause POS status:', err);
    }
  };

  return (
    <>
      <PosHeader isReceivingOrders={isReceivingOrders} onToggle={handleToggle} />
      <Outlet context={{ posStatus, setPosStatus, setIsReceivingOrders }} />
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
