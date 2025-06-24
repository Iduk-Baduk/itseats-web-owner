import { useSelector } from "react-redux";
import PosOrderItem from "../../components/pos/PosOrderCard";

export default function PosOrders() {
  const order = useSelector((state) => state.order);

  console.log("Current Orders:", order);

  return (
    <div>
      {order.map((order) => (
        <PosOrderItem key={order.orderNumber} order={order} />
      ))}
    </div>
  );
}
