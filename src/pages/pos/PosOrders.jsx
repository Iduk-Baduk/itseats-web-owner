import { useSelector } from "react-redux";
import PosOrderItem from "../../components/pos/PosOrderCard";
import PostSideBar from "../../components/pos/PosSideBar";
import styles from "./PosOrders.module.css";

export default function PosOrders() {
  const order = useSelector((state) => state.order);

  return (
    <div className={styles.container}>
      <PostSideBar />
      <div className={styles.content}>
        {order.map((order) => (
          <PosOrderItem key={order.orderNumber} order={order} />
        ))}
      </div>
    </div>
  );
}
