import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

interface TextInputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface TextareaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

interface SelectProps extends BaseInputProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select';
  children: ReactNode;
}

type InputProps = TextInputProps | TextareaProps | SelectProps;

export function Input(props: InputProps) {
  const { label, error, helperText, as = 'input', className = '', ...rest } = props;

  const wrapperClass = [styles.wrapper, error ? styles.error : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {as === 'textarea' ? (
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : as === 'select' ? (
          <select
            className={`${styles.input} ${styles.select}`}
            {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {(props as SelectProps).children}
          </select>
        ) : (
          <input
            className={styles.input}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
      {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}
