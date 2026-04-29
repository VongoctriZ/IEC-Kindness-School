import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size    = 'medium',
  icon,
  iconRight,
  disabled = false,
  type     = 'button',
  className = '',
  onClick,
}) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  )
}
