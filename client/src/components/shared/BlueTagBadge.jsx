import React from "react";

/**
 * BlueTagBadge Component
 * Premium verified badge with official blue scalloped seal and crisp white checkmark.
 * Awarded exclusively by Super Admin or authorized Admins.
 */
export default function BlueTagBadge({
  size = "sm",
  className = "",
  showTooltip = true,
  tooltipText = "Verified Blue Tag",
}) {
  const sizeMap = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 align-middle select-none transition-transform hover:scale-110 ${className}`}
      title={showTooltip ? tooltipText : undefined}
      aria-label="Verified Blue Tag"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize} drop-shadow-[0_1px_3px_rgba(29,155,240,0.45)]`}
      >
        <defs>
          <linearGradient id="blueTagGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.45" stopColor="#1D9BF0" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        {/* Official 12-point scalloped seal */}
        <path
          d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
          fill="url(#blueTagGradient)"
        />
        {/* Crisp checkmark */}
        <path
          d="M7.8 12.2l2.8 2.8 5.8-5.8"
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
