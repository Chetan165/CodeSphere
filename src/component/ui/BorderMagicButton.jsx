import React from "react";

/**
 * BorderMagicButton - Animated border button, for step circles and next buttons
 * Props:
 *   children: content inside the button
 *   className: extra classes
 *   size: diameter in px (default 48)
 *   onClick: click handler
 *   active: whether to animate border
 */
export const BorderMagicButton = ({
  children,
  className = "",
  size = 48,
  onClick,
  active = false,
  ...props
}) => (
  <button
    className={`relative inline-flex overflow-hidden rounded-full p-[1px] focus:outline-none ${className}`}
    style={{ width: size, height: size, minWidth: size, minHeight: size }}
    onClick={onClick}
    {...props}
  >
    {active ? (
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
    ) : (
      <span className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#22223b_0%,#393BB2_50%,#22223b_100%)]" />
    )}
    <span
      className={`inline-flex h-full w-full items-center justify-center rounded-full bg-slate-950 ${active ? "text-white" : "text-slate-400"} text-lg font-bold backdrop-blur-3xl relative z-10`}
    >
      {children}
    </span>
  </button>
);
