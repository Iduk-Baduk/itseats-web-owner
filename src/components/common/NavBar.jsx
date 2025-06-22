import { useLocation } from "react-router-dom";
import styles from "./NavBar.module.css";

export default function NavBar() {
  return (
    <ul>
      <div className={styles.logo}>
        <h1>잇츠잇츠 Portal</h1>
      </div>
      <NavButton
        href="/pos"
        icon={<GetIcon name="pos" />}
        label="주문 접수"
      ></NavButton>
      <NavButton
        href="/sales"
        icon={<GetIcon name="sale" />}
        label="매출 관리"
      />
      <NavButton
        href="/settlements"
        icon={<GetIcon name="settlement" />}
        label="정산 관리"
      />
      <NavButton
        href="/stores"
        icon={<GetIcon name="store" />}
        label="매장 관리"
      />
      <NavButton
        href="/accounts"
        icon={<GetIcon name="account" />}
        label="계정 관리"
      />
      <NavButton
        href="/menus"
        icon={<GetIcon name="menu" />}
        label="메뉴 관리"
      />
      <NavButton
        href="/reviews"
        icon={<GetIcon name="review" />}
        label="리뷰 관리"
      />
    </ul>
  );
}

function NavButton({ href, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(href);

  return (
    <li className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
      <a href={href} className={styles.link}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
      </a>
    </li>
  );
}

function GetIcon({ name }) {
  switch (name) {
    case "pos":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M17 9H8V7h9zM7 7H5v2h2zm0-3H5v2h2zm3 0H8v2h2zm3 13v2h1c.55 0 1 .45 1 1h7v2h-7c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1H2v-2h7c0-.55.45-1 1-1h1v-2H4c-1.11 0-2-.89-2-2V3a2 2 0 0 1 2-2h16c1.11 0 2 .89 2 2v12c0 1.11-.89 2-2 2zm7-2V3H4v12zm-9-9h8V4h-8zm-6 6h6v-2H5zm8 2h6v-2h-6z"
          />
        </svg>
      );
    case "sale":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="m16 11.78l4.24-7.33l1.73 1l-5.23 9.05l-6.51-3.75L5.46 19H22v2H2V3h2v14.54L9.5 8z"
          />
        </svg>
      );
    case "settlement":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M22 17H2a1 1 0 0 0 0 2h20a1 1 0 0 0 0-2m0 4H2a1 1 0 0 0 0 2h20a1 1 0 0 0 0-2M6 7a1 1 0 1 0 1 1a1 1 0 0 0-1-1m14-6H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3m1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1Zm-9-7a3 3 0 1 0 3 3a3 3 0 0 0-3-3m0 4a1 1 0 1 1 1-1a1 1 0 0 1-1 1m6-2a1 1 0 1 0 1 1a1 1 0 0 0-1-1"
          />
        </svg>
      );
    case "store":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M22 5H2a1 1 0 0 0-1 1v4a3 3 0 0 0 2 2.82V22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9.18A3 3 0 0 0 23 10V6a1 1 0 0 0-1-1m-7 2h2v3a1 1 0 0 1-2 0Zm-4 0h2v3a1 1 0 0 1-2 0ZM7 7h2v3a1 1 0 0 1-2 0Zm-3 4a1 1 0 0 1-1-1V7h2v3a1 1 0 0 1-1 1m10 10h-4v-2a2 2 0 0 1 4 0Zm5 0h-3v-2a4 4 0 0 0-8 0v2H5v-8.18a3.2 3.2 0 0 0 1-.6a3 3 0 0 0 4 0a3 3 0 0 0 4 0a3 3 0 0 0 4 0a3.2 3.2 0 0 0 1 .6Zm2-11a1 1 0 0 1-2 0V7h2ZM4.3 3H20a1 1 0 0 0 0-2H4.3a1 1 0 0 0 0 2"
          />
        </svg>
      );
    case "account":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 48 48"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            d="M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14m25-9l-6 6l6 6M4 40.8V42h30v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C27.92 28 25.68 28 21.2 28h-4.4c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C4 34.08 4 36.32 4 40.8"
          />
        </svg>
      );
    case "menu":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M1 22c0 .54.45 1 1 1h13c.56 0 1-.46 1-1v-1H1zM8.5 9C4.75 9 1 11 1 15h15c0-4-3.75-6-7.5-6m-4.88 4c1.11-1.55 3.47-2 4.88-2s3.77.45 4.88 2zM1 17h15v2H1zM18 5V1h-2v4h-5l.23 2h9.56l-1.4 14H18v2h1.72c.84 0 1.53-.65 1.63-1.47L23 5z"
          />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="m12 12.475l1.9 1.15q.275.175.55-.012t.2-.513l-.5-2.175l1.7-1.475q.25-.225.15-.537t-.45-.338L13.325 8.4l-.875-2.05q-.125-.3-.45-.3t-.45.3l-.875 2.05l-2.225.175Q8.1 8.6 8 8.913t.15.537l1.7 1.475l-.5 2.175q-.075.325.2.513t.55.012zM6 18l-2.3 2.3q-.475.475-1.088.213T2 19.575V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm-.85-2H20V4H4v13.125zM4 16V4z"
          />
        </svg>
      );
  }
}
