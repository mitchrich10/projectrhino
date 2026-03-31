import { FC, useState } from "react";
import { TECH_CATEGORIES, FounderOnboardingData, TechStack } from "./types";

interface Props {
  data: FounderOnboardingData;
  onChange: (patch: Partial<FounderOnboardingData>) => void;
}

const TechStackStep: FC<Props> = ({ data, onChange }) => {
  const stack = (data.tech_stack ?? {}) as TechStack;
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});

  const toggleOption = (categoryKey: keyof TechStack, option: string) => {
    const current = stack[categoryKey] ?? [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    onChange({ tech_stack: { ...stack, [categoryKey]: updated } });
  };

  const addOther = (categoryKey: keyof TechStack) => {
    const val = otherInputs[categoryKey]?.trim();
    if (!val) return;
    const current = stack[categoryKey] ?? [];
    if (!current.includes(val)) {
      onChange({ tech_stack: { ...stack, [categoryKey]: [...current, val] } });
    }
    setOtherInputs((p) => ({ ...p, [categoryKey]: "" }));
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h3 className="text-lg font-semibold text-[#173660] mb-1">Current Tech Stack</h3>
        <p className="text-sm text-[#173660]/60">
          This helps Rhino recommend relevant partnerships, credits, and integrations for your company.
        </p>
      </div>

      <div className="space-y-6">
        {TECH_CATEGORIES.map(({ key, label, options }) => {
          const selected = stack[key] ?? [];
          const customItems = selected.filter((s) => !options.includes(s));

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-[#173660] mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleOption(key, opt)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all border
                      ${selected.includes(opt)
                        ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                        : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"}
                    `}
                  >
                    {opt}
                  </button>
                ))}
                {customItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleOption(key, item)}
                    className="px-3 py-2 rounded-lg text-sm bg-[#1A7EC8] text-white border border-[#1A7EC8] transition-all"
                  >
                    {item} ×
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={otherInputs[key] ?? ""}
                  onChange={(e) => setOtherInputs((p) => ({ ...p, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addOther(key)}
                  placeholder="Other…"
                  className="h-9 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660] placeholder:text-[#173660]/30 flex-1 max-w-[200px]"
                />
                {(otherInputs[key] ?? "").trim() && (
                  <button
                    onClick={() => addOther(key)}
                    className="text-xs font-semibold text-[#1A7EC8] hover:text-[#173660] transition-colors"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* General other tools */}
      <div className="border-t border-[#CDD8E3] pt-6">
        <label className="block text-sm font-medium text-[#173660] mb-2">
          Any other tools or platforms you use that we haven't listed?
        </label>
        <textarea
          value={(stack as any).other_tools_notes ?? ""}
          onChange={(e) => onChange({ tech_stack: { ...stack, other_tools_notes: e.target.value } as any })}
          rows={3}
          placeholder="e.g. Linear for project management, Retool for internal tools, Segment for analytics…"
          className="w-full border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm bg-white text-[#173660] placeholder:text-[#173660]/30 resize-none"
        />
      </div>
    </div>
  );
};

export default TechStackStep;
