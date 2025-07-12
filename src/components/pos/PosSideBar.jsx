import styles from "./PosSideBar.module.css";

const TABS = ["접수대기", "진행중", "주문내역"];

export default function PosSideBar({ currentTab, onSelect }) {
  const tabs = TABS;

  return (
    <div className={styles.menuWrapper}>
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`${styles.tab} ${currentTab === tab ? styles.active : ""}`}
          onClick={() => onSelect(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
