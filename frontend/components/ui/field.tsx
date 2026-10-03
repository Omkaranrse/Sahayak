import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  id: string;
}

export function FieldShell({ label, hint, error, children, id }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-title-md text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-amber-600 flex items-center gap-1">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, id, className, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} id={id!}>
      <input
        id={id}
        className={clsx(
          "h-12 rounded-sm border-[1.5px] bg-surface px-4 text-body-lg text-ink placeholder:text-ink-faint",
          "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition-colors",
          error ? "border-amber-500" : "border-outline",
          className
        )}
        {...props}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  id,
  options,
  placeholder,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} id={id!}>
      <select
        id={id}
        className={clsx(
          "h-12 rounded-sm border-[1.5px] bg-surface px-4 text-body-lg text-ink appearance-none",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235A564F%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_0.9rem_center]",
          "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition-colors",
          error ? "border-amber-500" : "border-outline",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "flex w-full items-center justify-between gap-4 rounded-md border-[1.5px] px-4 py-3.5 text-left transition-colors min-h-[48px]",
        checked ? "border-primary-500 bg-primary-50" : "border-outline bg-surface"
      )}
    >
      <span>
        <span className="block text-title-md text-ink">{label}</span>
        {description && <span className="block text-body-md text-ink-soft">{description}</span>}
      </span>
      <span
        className={clsx(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary-700" : "bg-outline"
        )}
      >
        <span
          className={clsx(
            "inline-block h-5.5 w-5.5 h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}
