import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";

export default function Header({
  nickname,
  showBackButton = true,
  onLeftClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      {showBackButton ? (
        <button className={styles.backButton} onClick={onLeftClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36px"
            height="36px"
            viewBox="0 0 512 512"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
              d="M249.38 336L170 256l79.38-80m-68.35 80H342"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeMiterlimit="10"
              strokeWidth="32"
              d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192s192-86 192-192Z"
            />
          </svg>
        </button>
      ) : (
        <div className={styles.backButtonPlaceholder} />
      )}

      <div className={styles.profileWrapper} ref={profileRef}>
        <button
          className={styles.profile}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36px"
            height="36px"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M258.9 48C141.92 46.42 46.42 141.92 48 258.9c1.56 112.19 92.91 203.54 205.1 205.1c117 1.6 212.48-93.9 210.88-210.88C462.44 140.91 371.09 49.56 258.9 48m126.42 327.25a4 4 0 0 1-6.14-.32a124.3 124.3 0 0 0-32.35-29.59C321.37 329 289.11 320 256 320s-65.37 9-90.83 25.34a124.2 124.2 0 0 0-32.35 29.58a4 4 0 0 1-6.14.32A175.32 175.32 0 0 1 80 259c-1.63-97.31 78.22-178.76 175.57-179S432 158.81 432 256a175.32 175.32 0 0 1-46.68 119.25"
            />
            <path
              fill="currentColor"
              d="M256 144c-19.72 0-37.55 7.39-50.22 20.82s-19 32-17.57 51.93C191.11 256 221.52 288 256 288s64.83-32 67.79-71.24c1.48-19.74-4.8-38.14-17.68-51.82C293.39 151.44 275.59 144 256 144"
            />
          </svg>
          <span className={styles.nickname}>{nickname}</span>
        </button>
        {menuOpen && (
          <div className={styles.flyout}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setMenuOpen(false);
                alert("로그아웃"); // 실제 로그아웃 함수로 교체
              }}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
