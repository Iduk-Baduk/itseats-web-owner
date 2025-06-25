import styles from "./PosOrderCard.module.css";

const STATUS_CONFIG = {
  COOKING: { color: "orange", text: "진행중" },
  DELIVERING: { color: "red", text: "배달중" },
  COMPLETED: { color: "rgb(25, 193, 77)", text: "배달완료", showIcon: true },
};

export default function PosOrderCard({ order, onClick }) {
  const getStatusConfig = (status) => STATUS_CONFIG[status] || { color: "inherit", text: status };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.leftSection}>
        <span className={styles.left}>
          <strong className={styles.number}>{order.orderNumber}</strong>
          <div className={styles.time}>
            {new Date(order.orderTime).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </span>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.header}>
          <span className={styles.menuSummary}>
            [메뉴 {order.menuCount}개] 합계 {order.totalPrice}원
          </span>
          <span
            className={styles.status}
            style={{ color: getStatusConfig(order.deliveryStatus).color }}
          >
            {getStatusConfig(order.deliveryStatus).showIcon ? (
              <span className={styles.completedStatus}>
                <DeliveryCompletedIcon />
                {getStatusConfig(order.deliveryStatus).text}
              </span>
            ) : (
              getStatusConfig(order.deliveryStatus).text
            )}
          </span>
        </div>

        <div className={styles.menuItems}>
          {order.menuItems?.map((item, index) => (
            <span key={index} className={styles.menuItem}>
              {item.menuName}
              {item.options.length > 0 && `[${item.options.join(", ")}]`}x{item.quantity}
            </span>
          ))}
        </div>

        <div className={styles.partner}>
          <span className={styles.partnerBtn}>🛵 배달파트너</span>
          {order.riderPhone && <span className={styles.callBtn}>📞 연락처</span>}
        </div>

        {order.customerRequest && <div className={styles.request}>{order.customerRequest}</div>}
      </div>
    </div>
  );
}

const DeliveryCompletedIcon = () => {
  return (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.65625" width="24" height="24" rx="12" fill="#0BC757" />
      <path
        d="M10.656 14.7801L8.34269 12.4667C8.21804 12.3421 8.04897 12.272 7.87269 12.272C7.6964 12.272 7.52734 12.3421 7.40269 12.4667C7.27804 12.5914 7.20801 12.7604 7.20801 12.9367C7.20801 13.024 7.2252 13.1104 7.2586 13.1911C7.29201 13.2717 7.34097 13.345 7.40269 13.4067L10.1894 16.1934C10.4494 16.4534 10.8694 16.4534 11.1294 16.1934L18.1827 9.14005C18.3073 9.0154 18.3774 8.84634 18.3774 8.67005C18.3774 8.49377 18.3073 8.3247 18.1827 8.20005C18.058 8.0754 17.889 8.00537 17.7127 8.00537C17.5364 8.00537 17.3673 8.0754 17.2427 8.20005L10.656 14.7801Z"
        fill="white"
      />
    </svg>
  );
};
