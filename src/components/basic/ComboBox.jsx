import styles from "./ComboBox.module.css";

export default function ComboBox({
  name,
  value,
  onChange,
  options,
  placeholder,
  className,
}) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={styles.select}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className={styles.icon}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"
          />
        </svg>
      </span>
    </div>
  );
}
