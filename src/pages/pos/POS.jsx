import PostMetricItem from "../../components/pos/PosMetricItem";

export default function Pos() {
  return (
    <div>
      <PostMetricItem metricName={dummyData.storeName} metricValue={dummyData.metrics} />
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
