import React from "react";
import { BorderMagicButton } from "./BorderMagicButton";

/**
 * NeonStepTimeline - A modern, animated stepper/timeline for multi-step workflows.
 * Props:
 *   steps: [{ title: string, description?: string }]
 *   currentStep: number
 *   onStepClick?: (idx: number) => void
 */
const NeonStepTimeline = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex w-full justify-between items-center gap-0 md:gap-4">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        return (
          <React.Fragment key={step.title}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <BorderMagicButton
                size={48}
                active={isActive}
                onClick={() => onStepClick && onStepClick(idx)}
                aria-label={step.title}
                className={
                  isActive
                    ? "scale-110 shadow-[0_0_16px_4px_rgba(57,59,178,0.15)]"
                    : isCompleted
                      ? "opacity-90 text-blue-400"
                      : "text-slate-400"
                }
              >
                {idx + 1}
              </BorderMagicButton>
              <span
                className={`mt-3 text-base font-semibold transition-colors duration-300 ${isActive ? "text-blue-400" : isCompleted ? "text-blue-300" : "text-slate-400"}`}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="text-xs text-slate-500 mt-1 text-center max-w-[120px]">
                  {step.description}
                </span>
              )}
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-1 relative flex items-center">
                <div
                  className={`origin-left w-full h-0.5 rounded-full bg-slate-700 transition-transform duration-500 ${isCompleted ? "scale-x-100 bg-gradient-to-r from-white to-blue-400" : "scale-x-0"}`}
                  style={{
                    transform: isCompleted ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 0.7s cubic-bezier(.4,0,.2,1)",
                  }}
                ></div>
                {isActive && (
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 via-blue-400 to-white blur-sm animate-pulse" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default NeonStepTimeline;
