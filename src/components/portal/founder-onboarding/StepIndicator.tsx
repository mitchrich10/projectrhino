import { FC } from "react";
import { Check } from "lucide-react";
import { STEP_LABELS, StepCompletion } from "./types";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: Set<number>;
  completions: StepCompletion[];
  onStepClick: (step: number) => void;
}

const StepIndicator: FC<StepIndicatorProps> = ({ currentStep, completedSteps, completions, onStepClick }) => {
  const getInitials = (stepNumber: number) => {
    const stepCompletions = completions.filter((c) => c.step_number === stepNumber);
    return stepCompletions.map((c) => {
      const name = c.user_name || c.user_email;
      const parts = name.split(/[@\s]/);
      return parts[0]?.[0]?.toUpperCase() ?? "?";
    });
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full overflow-x-auto pb-2">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = completedSteps.has(stepNum);
        const initials = getInitials(stepNum);

        return (
          <button
            key={stepNum}
            onClick={() => onStepClick(stepNum)}
            className={`
              flex-1 min-w-0 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-all text-center
              ${isActive ? "bg-[#1A7EC8]/10" : "hover:bg-[#F4F7FA]"}
            `}
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all flex-shrink-0
                ${isDone ? "bg-[#a3d7c2] text-[#173660]" : isActive ? "bg-[#1A7EC8] text-white" : "bg-[#CDD8E3] text-[#173660]"}
              `}
            >
              {isDone ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            <span
              className={`text-[11px] font-medium leading-tight truncate w-full ${
                isActive ? "text-[#1A7EC8]" : "text-[#173660]/70"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {label}
            </span>
            {initials.length > 0 && (
              <div className="flex -space-x-1">
                {initials.map((initial, idx) => (
                  <span
                    key={idx}
                    className="w-5 h-5 rounded-full bg-[#173660] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white"
                  >
                    {initial}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StepIndicator;
