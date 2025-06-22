import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import NavBar from "../components/common/NavBar";

export default function Layout() {
  return (
    <>
      <div className={styles.app}>
        <nav>
          <NavBar />
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}