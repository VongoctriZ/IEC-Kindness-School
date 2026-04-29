import styles from './Input.module.css'

export default function Input({
  label,
  placeholder,
  helperText,
  error,
  maxLength,
  disabled  = false,
  type      = 'text',
  icon,
  value,
  onChange,
  name,
  id,
}) {
  const inputId = id ?? name ?? label

  return (
    <div className={styles.group}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}

      <div className={styles.inputWrap}>
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className={`${styles.input} ${error ? styles.hasError : ''}`}
        />
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      <div className={styles.foot}>
        {error
          ? <span className={styles.error}>{error}</span>
          : helperText
            ? <span className={styles.helper}>{helperText}</span>
            : null
        }
        {maxLength && value !== undefined && (
          <span className={styles.count}>{value.length}/{maxLength}</span>
        )}
      </div>
    </div>
  )
}
