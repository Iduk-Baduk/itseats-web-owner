import styles from "./PosMetricItem.module.css";

export default function PosMetricItem({ metricName, metricValue, className }) {
  return (
    <div className={className}>
      <div className={styles.storeName}>{metricName}</div>
      <div className={styles.container}>
        {/* 고객 별점 */}
        <div className={`${styles.item} ${styles.itemWithDivider}`}>
          <div className={styles.ratingContainer}>
            <p className={styles.title}>고객 별점</p>
            <div>{checkRating(metricValue.customerRating)}</div>
            <p className={styles.subTitle}>
              {(() => {
                const rating = Number(metricValue.customerRating);
                return isNaN(rating) ? "N/A" : rating.toFixed(1);
              })()}
            </p>
          </div>
        </div>

        {/* 조리시간 */}
        <div className={`${styles.item} ${styles.itemWithDivider}`}>
          <div className={styles.cookTimeContainer}>
            <p className={styles.title}>조리시간</p>
            <div>{checkCookTime(metricValue.avgCookTime)}</div>
            <p className={styles.subTitle}>{metricValue.avgCookTime}</p>
          </div>
        </div>

        {/* 조리시간 정확도 */}
        <div className={`${styles.item} ${styles.itemWithDivider}`}>
          <div className={styles.ratingContainer}>
            <p className={styles.title}>조리시간 정확도</p>
            <div>{checkAccuracy(metricValue.cookTimeAccuracy)}</div>
            <p className={styles.subTitle}>{metricValue.cookTimeAccuracy}</p>
          </div>
        </div>

        {/* 조리 수락 시간 */}
        <div className={`${styles.item} ${styles.itemWithDivider}`}>
          <div className={styles.ratingContainer}>
            <p className={styles.title}>조리 수락 시간</p>
            <div>{checkPickupTime(metricValue.pickupTime)}</div>
            <p className={styles.subTitle}>{metricValue.pickupTime}</p>
          </div>
        </div>

        {/* 주문 수락률 */}
        <div className={`${styles.item} ${styles.itemWithDivider}`}>
          <div className={styles.ratingContainer}>
            <p className={styles.title}>주문 수락률</p>
            <div>{checkOrderAcceptanceRate(metricValue.orderAcceptanceRate)}</div>
            <p className={styles.subTitle}>{metricValue.orderAcceptanceRate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const parseMetricValue = (value, unit) => {
  if (!value) {
    return null;
  }

  const regex = new RegExp(`(\\d+)\\s*${unit}`);
  const match = value.match(regex);
  if (!match) {
    return null;
  }

  const parsedValue = parseInt(match[1], 10);
  return isNaN(parsedValue) ? null : parsedValue;
};

const checkRating = (rating) => {
  if (!rating) {
    return;
  }

  const numericRating = typeof rating === "string" ? parseFloat(rating) : rating;

  if (isNaN(numericRating)) {
    console.warn("Invalid rating value:", rating);
    return;
  }

  if (numericRating >= 4.0) {
    return goodCheckIcon();
  } else if (numericRating >= 3.0) {
    return midCheckIcon();
  } else {
    return badCheckIcon();
  }
};

const checkCookTime = (cookTime) => {
  if (!cookTime) {
    return;
  }

  const timeInMinutes = parseMetricValue(cookTime, "분");
  if (timeInMinutes === null) {
    return;
  }

  if (timeInMinutes <= 20) {
    return goodCheckIcon();
  } else if (timeInMinutes <= 30) {
    return midCheckIcon();
  } else {
    return badCheckIcon();
  }
};

const checkAccuracy = (accuracy) => {
  if (!accuracy) {
    return;
  }

  const accuracyInPercentage = parseMetricValue(accuracy, "%");
  if (accuracyInPercentage === null) {
    return;
  }

  if (accuracyInPercentage >= 85) {
    return goodCheckIcon();
  } else if (accuracyInPercentage >= 60) {
    return midCheckIcon();
  } else {
    return badCheckIcon();
  }
};

const checkPickupTime = (pickupTime) => {
  if (!pickupTime) {
    return;
  }
  const timeInSeconds = parseMetricValue(pickupTime, "초");
  if (timeInSeconds === null) {
    return;
  }

  if (timeInSeconds <= 30) {
    return goodCheckIcon();
  } else if (timeInSeconds <= 60) {
    return midCheckIcon();
  } else {
    return badCheckIcon();
  }
};

const checkOrderAcceptanceRate = (orderAcceptanceRate) => {
  if (!orderAcceptanceRate) {
    return;
  }
  const rateInPercentage = parseMetricValue(orderAcceptanceRate, "%");
  if (rateInPercentage === null) {
    return;
  }

  if (rateInPercentage >= 90) {
    return goodCheckIcon();
  } else if (rateInPercentage >= 70) {
    return midCheckIcon();
  } else {
    return badCheckIcon();
  }
};

const ICON_COLORS = {
  good: "#0BC757",
  mid: "#FAC40E",
  bad: "#FC4351",
};

const checkIcon = (type) => {
  const color = ICON_COLORS[type];
  const isGoodOrMid = type === "good" || type === "mid";

  return (
    <div className={styles.icon}>
      <svg
        width={isGoodOrMid ? "25" : "24"}
        height="24"
        viewBox={isGoodOrMid ? "0 0 25 24" : "0 0 24 24"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x={isGoodOrMid ? "0.65625" : "0"} width="24" height="24" rx="12" fill={color} />
        <path
          d={
            isGoodOrMid
              ? "M10.656 14.7801L8.34269 12.4667C8.21804 12.3421 8.04897 12.272 7.87269 12.272C7.6964 12.272 7.52734 12.3421 7.40269 12.4667C7.27804 12.5914 7.20801 12.7604 7.20801 12.9367C7.20801 13.024 7.2252 13.1104 7.2586 13.1911C7.29201 13.2717 7.34097 13.345 7.40269 13.4067L10.1894 16.1934C10.4494 16.4534 10.8694 16.4534 11.1294 16.1934L18.1827 9.14005C18.3073 9.0154 18.3774 8.84634 18.3774 8.67005C18.3774 8.49377 18.3073 8.3247 18.1827 8.20005C18.058 8.0754 17.889 8.00537 17.7127 8.00537C17.5364 8.00537 17.3673 8.0754 17.2427 8.20005L10.656 14.7801Z"
              : "M9.99977 14.7801L7.68644 12.4667C7.56179 12.3421 7.39272 12.272 7.21644 12.272C7.04015 12.272 6.87109 12.3421 6.74644 12.4667C6.62179 12.5914 6.55176 12.7604 6.55176 12.9367C6.55176 13.024 6.56895 13.1104 6.60235 13.1911C6.63576 13.2717 6.68472 13.345 6.74644 13.4067L9.53311 16.1934C9.79311 16.4534 10.2131 16.4534 10.4731 16.1934L17.5264 9.14005C17.6511 9.0154 17.7211 8.84634 17.7211 8.67005C17.7211 8.49377 17.6511 8.3247 17.5264 8.20005C17.4018 8.0754 17.2327 8.00537 17.0564 8.00537C16.8802 8.00537 16.7111 8.0754 16.5864 8.20005L9.99977 14.7801Z"
          }
          fill="white"
        />
      </svg>
    </div>
  );
};

const badCheckIcon = () => checkIcon("bad");
const goodCheckIcon = () => checkIcon("good");
const midCheckIcon = () => checkIcon("mid");
