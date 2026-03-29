import React from "react";

const baseInput =
  "w-full px-4 py-3.5 rounded-2xl border bg-white/65 backdrop-blur-md font-body text-[#2D332F] placeholder:text-gray-400 outline-none transition-all duration-300 ease-out";

const normalBorder = "border-emerald-100/80 shadow-sm";
const focusRing =
  "focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/30 focus:ring-offset-2 focus:ring-offset-white/50";
const errorBorder =
  "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-200/50 focus:ring-offset-2";

export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className={`${baseInput} ${normalBorder} ${focusRing} ${error ? errorBorder : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthSelect({ id, label, value, onChange, children, error, required }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`${baseInput} ${normalBorder} ${focusRing} cursor-pointer pr-10 appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${error ? errorBorder : ""}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
