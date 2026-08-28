import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  grow?: boolean;
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextField({ label, grow = false, id, ...props }: TextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className={`field ${grow ? "field--grow" : ""}`.trim()}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...props} />
    </div>
  );
}

export function TextAreaField({ label, id, ...props }: TextAreaFieldProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="field">
      <label htmlFor={textareaId}>{label}</label>
      <textarea id={textareaId} {...props} />
    </div>
  );
}
