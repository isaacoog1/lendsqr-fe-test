import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils'
import styles from './Input.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** Keeps the label for assistive technology while hiding it visually. */
  hideLabel?: boolean
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hideLabel, error, type = 'text', className, id, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    // Falls back to a generated id: deriving it from the label alone left
    // unlabelled fields sharing `id="undefined-error"`, so two invalid inputs
    // pointed their aria-describedby at the same element.
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className={cn(styles.wrapper, className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(styles.label, hideLabel && styles.labelHidden)}
          >
            {label}
          </label>
        )}
        <div className={styles.inputContainer}>
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(styles.input, error && styles.inputError)}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          )}
        </div>
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
