import { useEffect, useState } from "react";
import PosSelectModal from "../common/PosSelectModal";

import styles from "./PosOrderDetailModal.module.css";

export default function PosOrderDetailModal({ orderId, onClose, onAccept, onReject }) {
  const [order, setOrder] = useState(null);
  const [showCookTimeModal, setShowCookTimeModal] = useState(false);

  // 예상 조리시간 선택 시
  const handleCookTimeSelect = (minute) => {
    setShowCookTimeModal(false);
    console.log("🕰️ 선택된 조리 시간:", minute, "분");
    onAccept(minute); // 실제 주문 수락 처리
  };

  // TODO: 실제 API 호출로 주문 상세 정보 가져오기
  useEffect(() => {
    // 임시 데이터 (API 대신) -> orderId로 fetch
    // 예시: setOrder(fetchOrderById(orderId));
    // 여기서는 하드코딩된 데이터를 사용합니다.
    // 실제로는 API 호출을 통해 주문 정보를 가져와야 합니다.
    setOrder({
      orderId: 3,
      orderNumber: "GRMT0N",
      customerName: "구름톤",
      orderStatus: "waiting",
      time: "2025-05-05T00:00:00",
      totalPrice: 34000,
      items: [
        {
          menuId: 11,
          name: "아메리카노",
          qty: 2,
          price: 4000,
          options: ["샷추가", "샷추가", "사이즈업"],
        },
        {
          menuId: 12,
          name: "에스프레소",
          qty: 1,
          price: 1500,
          options: [],
        },
      ],
      memo: "크림 적게 주세요~",
    });
  }, [orderId]);

  if (!order) {
    return <div>로딩중..</div>;
  }

  console.log("주문 상세 정보:", order);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span>주문 상세</span>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.orderInfo}>
            <div className={styles.orderNumber}>
              <span style={{ fontSize: "1.4rem", marginRight: "0.5rem" }}>{order.orderNumber}</span>
              {order.customerName}
            </div>
            <span className={styles.time}>
              {new Date(order.time).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {order.memo && <div className={styles.memo}>{order.memo}</div>}
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>메뉴</th>
                <th>수량</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {order.items &&
                order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={styles.mainTitle}>
                        {item.name}
                        {item.options && (
                          <div className={styles.options}>
                            {item.options.map((opt, i) => (
                              <div className={styles.option} key={i}>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </span>
                    </td>
                    <td>{item.qty}</td>
                    <td>{item.price.toLocaleString()}원</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className={styles.total}>
            합계{" "}
            <b>
              {order.items &&
                order.items.reduce((sum, i) => sum + i.price * i.qty, 0).toLocaleString()}
              원
            </b>
            <span style={{ marginLeft: "1rem", fontWeight: 400, color: "#888" }}>
              ({order.items ? order.items.reduce((sum, i) => sum + i.qty, 0) : 0}개)
            </span>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.reject} onClick={onReject}>
            주문 거절
          </button>
          <button className={styles.accept} onClick={() => setShowCookTimeModal(true)}>
            주문 수락
          </button>
          {showCookTimeModal && (
            <PosSelectModal
              title="예상 조리 시간"
              description="‘최대한 짧고 정확한’ 조리시간을 선택해 주세요."
              options={[5, 10, 15]}
              optionUnit="분"
              onSelect={handleCookTimeSelect}
              onClose={() => setShowCookTimeModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
