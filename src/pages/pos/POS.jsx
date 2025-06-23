import PostMetricItem from "../../components/pos/PosMetricItem";
import PosQuickAccess from "../../components/pos/PosQuickAccess";

import styles from "./Pos.module.css";

export default function Pos() {
  return (
    <div>
      <PostMetricItem
        metricName={dummyData.storeName}
        metricValue={dummyData.metrics}
        className={styles.posMetricItem}
      />
      <PosQuickAccess className={styles.posQuickAccess} />
    </div>
  );
}

const dummyData = {
  storeName: "스타벅스 커피",
  metrics: {
    customerRating: 2.0,
    avgCookTime: "20분",
    cookTimeAccuracy: "98%",
    pickupTime: "43초",
    orderAcceptanceRate: "100%",
  },
};
