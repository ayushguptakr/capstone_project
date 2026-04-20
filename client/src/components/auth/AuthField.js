import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const incomingType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={incomingType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className={`${baseInput} ${normalBorder} ${focusRing} ${error ? errorBorder : ""} ${isPassword ? "pr-12" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 font-medium mt-1">
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
