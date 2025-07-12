import styles from "./Button.module.css";

export default function Button({ children, onClick, className = "", disabled = false, variant = "primary" }) {
  const variantClass = styles[variant] || styles.primary;
  return (
    <button className={`${styles.button} ${variantClass} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
