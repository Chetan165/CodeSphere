import React from "react";

export default function CircularSpinner({
  size = 32,
  color = "#fffffa",
  thickness = 3,
  className = "",
}) {
  return (
    <span
      className={"inline-block animate-spin " + className}
      style={{ width: size, height: size }}
      aria-label="Loading"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - thickness) / 2}
          stroke="#e5e7eb"
          strokeWidth={thickness}
          opacity="0.2"
        />
        <path
          d={`M${size / 2},${thickness / 2} 
            a${(size - thickness) / 2},${(size - thickness) / 2} 0 1,1 0,${size - thickness}
          `}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
