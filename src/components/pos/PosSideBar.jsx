import styles from "./PosSideBar.module.css";

export default function PostSideBar({ currentTab, onSelect }) {
  const tabs = ["접수대기", "진행중", "주문내역"];

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
