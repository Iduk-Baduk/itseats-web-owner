import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PosHeader.module.css";

export default function PosHeader({ isReceivingOrders, onToggle }) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>ItsEats POS</div>

      <nav className={styles.navBar}>
        <div className={styles.left}>
          <NavButton
            label="홈"
            href={"/pos"}
            onClick={() => {
              navigate("/pos");
            }}
          />
          <NavButton
            label="주문 접수"
            href={"/pos/orders"}
            onClick={() => {
              navigate("/pos/orders");
            }}
          />
        </div>

        <div className={styles.right}>
          <span className={styles.orderStatus}>
            {isReceivingOrders ? "신규 주문 받는 중" : "신규 주문 정지"}
          </span>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={isReceivingOrders}
              onChange={onToggle}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </nav>
    </header>
  );
}

function NavButton({ label, href, onClick }) {
  const location = useLocation();
  let isActive = false;
  if (href == "/pos") isActive = location.pathname === href;
  else isActive = location.pathname.startsWith(href);

  return (
    <button
      className={`${styles.navButton} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
