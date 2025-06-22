import styles from "./UpperTextInput.module.css";

export default function UpperTextInput({
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  className,
}) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <p className={styles.label}>{placeholder}</p>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={styles.input}
      />
    </div>
  );
}