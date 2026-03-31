import { FC } from "react";
import { PRIORITY_OPTIONS, FounderOnboardingData } from "./types";
import { Check } from "lucide-react";

interface Props {
  data: FounderOnboardingData;
  onChange: (patch: Partial<FounderOnboardingData>) => void;
}

const PrioritiesStep: FC<Props> = ({ data, onChange }) => {
  const selected = data.priorities ?? [];
  const context = data.priority_context ?? {};

  const toggle = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];
    onChange({ priorities: updated });
  };

  const updateContext = (option: string, value: string) => {
    onChange({ priority_context: { ...context, [option]: value } });
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Short-term needs</p>
        <h3 className="text-lg font-semibold text-[#173660] mb-1">Immediate Priorities</h3>
        <p className="text-sm text-[#173660]/60">
          Select the areas where you need the most support right now. This helps Rhino prioritize how to help.
        </p>
      </div>

      <div className="space-y-2">
        {PRIORITY_OPTIONS.map(({ value: option, contextPrompt }) => {
          const isSelected = selected.includes(option);
          return (
            <div key={option}>
              <button
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
              {isSelected && (
                <div className="ml-8 mt-2 mb-3">
                  <input
                    type="text"
                    value={context[option] ?? ""}
                    onChange={(e) => updateContext(option, e.target.value)}
                    placeholder={contextPrompt}
                    className="w-full h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-[#F4F7FA] text-[#173660] placeholder:text-[#173660]/40"
                  />
                </div>
              )}
            </div>
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

      {/* Rhino assistance */}
      <div className="border-t border-[#CDD8E3] pt-6">
        <label className="block text-sm font-semibold text-[#173660] mb-3">
          Would you like Rhino's assistance with any of your short-term needs?
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Not sure", value: "not_sure" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ rhino_assistance: value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                data.rhino_assistance === value
                  ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                  : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature company */}
      <div className="border-t border-[#CDD8E3] pt-6">
        <label className="block text-sm font-semibold text-[#173660] mb-3">
          Can we feature your company on the Rhino site?
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Yes, go for it", value: true },
            { label: "Not yet", value: false },
          ].map(({ label, value }) => (
            <button
              key={String(value)}
              onClick={() => onChange({ feature_company: value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                data.feature_company === value
                  ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                  : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcing raise */}
      <div className="border-t border-[#CDD8E3] pt-6">
        <label className="block text-sm font-semibold text-[#173660] mb-3">
          Are you planning to announce your raise?
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Not yet decided", value: "not_yet" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ announcing_raise: value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                data.announcing_raise === value
                  ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                  : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Free text */}
      <div className="border-t border-[#CDD8E3] pt-6">
        <label className="block text-sm font-semibold text-[#173660] mb-2">
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
