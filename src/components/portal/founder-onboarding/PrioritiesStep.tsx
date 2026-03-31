import { FC } from "react";
import { PRIORITY_OPTIONS, FounderOnboardingData } from "./types";
import { Check } from "lucide-react";

interface Props {
  data: FounderOnboardingData;
  onChange: (patch: Partial<FounderOnboardingData>) => void;
}

const PrioritiesStep: FC<Props> = ({ data, onChange }) => {
  const selected = data.priorities ?? [];

  const toggle = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];
    onChange({ priorities: updated });
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h3 className="text-lg font-semibold text-[#173660] mb-1">Immediate Priorities</h3>
        <p className="text-sm text-[#173660]/60">
          Select the areas where you need the most support right now. This helps Rhino prioritize how to help.
        </p>
      </div>

      <div className="space-y-2">
        {PRIORITY_OPTIONS.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={`
                w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all text-sm
                ${isSelected
                  ? "bg-[#1A7EC8]/5 border-[#1A7EC8] text-[#173660]"
                  : "bg-white border-[#CDD8E3] text-[#173660] hover:border-[#1A7EC8]/50"}
              `}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? "bg-[#1A7EC8] text-white" : "border-2 border-[#CDD8E3]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
              {option}
            </button>
          );
        })}
      </div>

      {/* Other */}
      <div>
        <label className="block text-sm font-medium text-[#173660] mb-2">Other</label>
        <input
          type="text"
          value={data.priorities_other ?? ""}
          onChange={(e) => onChange({ priorities_other: e.target.value })}
          placeholder="Anything else?"
          className="w-full h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660] placeholder:text-[#173660]/30"
        />
      </div>

      {/* Free text */}
      <div>
        <label className="block text-sm font-medium text-[#173660] mb-2">
          Anything else Rhino should know right away?
        </label>
        <textarea
          value={data.priorities_notes ?? ""}
          onChange={(e) => onChange({ priorities_notes: e.target.value })}
          rows={3}
          placeholder="e.g. We're planning a rebrand in Q2, or we need help finding a CFO…"
          className="w-full border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm bg-white text-[#173660] placeholder:text-[#173660]/30 resize-none"
        />
      </div>
    </div>
  );
};

export default PrioritiesStep;
