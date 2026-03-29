import React from "react";

const colorVariants = {
  green: "bg-green-100 text-eco-primary",
  blue: "bg-blue-100 text-eco-secondary",
  yellow: "bg-amber-100 text-amber-700",
  default: "bg-eco-pale text-eco-primary",
};

export default function IconBox({ children, color = "green", size = "md", className = "" }) {
  const sizes = { sm: "p-2", md: "p-3", lg: "p-4" };
  return (
    <div
      className={`
        rounded-xl inline-flex items-center justify-center
        ${colorVariants[color] || colorVariants.default}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
