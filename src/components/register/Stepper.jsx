import styles from "./Stepper.module.css";

const steps = ["step 1", "step 2", "step 3", "step 4"];

export default function Stepper({ currentStep }) {
  return (
    <div className={styles.stepper}>
      {steps.map((label, index) => (
        <div className={styles.stepWrapper} key={index}>
          <div className={`${styles.circle} ${index <= currentStep ? styles.active : ""}`} />
          {index < steps.length - 1 && (
            <div className={`${styles.line} ${index < currentStep ? styles.active : ""}`} />
          )}
          {index === currentStep && (
            <div className={styles.label}>
              {label}
              <div className={styles.arrow} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
