import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface BaseFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  grow?: boolean;
  leftIcon?: ReactNode;
}

export interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseFieldProps {}

export interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    BaseFieldProps {
  options: Array<{ label: string; value: string | number }>;
}

export function TextField({
  label,
  error,
  hint,
  grow = false,
  leftIcon,
  id,
  className = "",
  required,
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className={`form-field ${grow ? "form-field--grow" : ""} ${error ? "form-field--error" : ""}`}>
      {label ? (
        <label className="form-label" htmlFor={inputId}>
          {label}
          {required ? <span className="form-label__required">*</span> : null}
        </label>
      ) : null}
      <div className="form-input-wrap">
        {leftIcon ? <span className="form-input__icon">{leftIcon}</span> : null}
        <input
          id={inputId}
          className={`form-input ${leftIcon ? "form-input--has-icon" : ""} ${className}`.trim()}
          required={required}
          {...props}
        />
      </div>
      {error ? <span className="form-error">{error}</span> : null}
      {hint && !error ? <span className="form-hint">{hint}</span> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  id,
  className = "",
  required,
  ...props
}: TextAreaFieldProps) {
  const textareaId = id ?? props.name;

  return (
    <div className={`form-field ${error ? "form-field--error" : ""}`}>
      {label ? (
        <label className="form-label" htmlFor={textareaId}>
          {label}
          {required ? <span className="form-label__required">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={`form-textarea ${className}`.trim()}
        required={required}
        {...props}
      />
      {error ? <span className="form-error">{error}</span> : null}
      {hint && !error ? <span className="form-hint">{hint}</span> : null}
    </div>
  );
}

export function SelectField({
  label,
  error,
  hint,
  options,
  id,
  className = "",
  required,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name;

  return (
    <div className={`form-field ${error ? "form-field--error" : ""}`}>
      {label ? (
        <label className="form-label" htmlFor={selectId}>
          {label}
          {required ? <span className="form-label__required">*</span> : null}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`form-select ${className}`.trim()}
        required={required}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <span className="form-error">{error}</span> : null}
      {hint && !error ? <span className="form-hint">{hint}</span> : null}
    </div>
  );
}
