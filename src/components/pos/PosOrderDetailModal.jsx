import { useEffect, useState } from "react";
import styles from "./PosOrderDetailModal.module.css";

export default function PosOrderDetailModal({ orderId, onClose, onAccept, onReject }) {
  const [order, setOrder] = useState(null);

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
      orderStatus: "wating",
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
            <b>{order.orderNumber}</b> {order.customerName}
            <span className={styles.time}>
              {new Date(order.time).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {order.memo && <div className={styles.memo}>{order.memo}</div>}
          <table className={styles.table}>
            <thead>
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
                      {item.name}
                      {item.options && (
                        <div className={styles.options}>
                          {item.options.map((opt, i) => (
                            <div key={i}>{opt}</div>
                          ))}
                        </div>
                      )}
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
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.reject} onClick={onReject}>
            주문 거절
          </button>
          <button className={styles.accept} onClick={onAccept}>
            주문 수락
          </button>
        </div>
      </div>
    </div>
  );
}
