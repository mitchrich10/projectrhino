import { FC, useState, useRef } from "react";
import { Upload, X, FileText, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FounderOnboardingData } from "./types";

interface Props {
  data: FounderOnboardingData;
  onChange: (patch: Partial<FounderOnboardingData>) => void;
  batchId: string;
}

interface BrandColour {
  id: string;
  label: string;
  value: string;
}

const COLOUR_KEYS = ["primary_color", "secondary_color", "tertiary_color", "accent_color"] as const;
const COLOUR_LABELS = ["Primary", "Secondary", "Tertiary", "Accent"];

const BrandAssetsStep: FC<Props> = ({ data, onChange, batchId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingGuidelines, setUploadingGuidelines] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const guidelinesInputRef = useRef<HTMLInputElement>(null);

  // Determine if "skip colours" is active — all colour fields empty and no colours set
  const allColoursEmpty = COLOUR_KEYS.every((k) => !data[k]);
  const [skipColours, setSkipColours] = useState(false);

  // Build dynamic colour list from data
  const getActiveColours = (): { key: typeof COLOUR_KEYS[number]; label: string; value: string }[] => {
    const colours: { key: typeof COLOUR_KEYS[number]; label: string; value: string }[] = [];
    COLOUR_KEYS.forEach((key, i) => {
      if (data[key]) {
        colours.push({ key, label: COLOUR_LABELS[i], value: data[key] });
      }
    });
    // If no colours set and not skipping, show 2 empty slots
    if (colours.length === 0 && !skipColours) {
      return [
        { key: "primary_color", label: "Primary", value: "" },
        { key: "secondary_color", label: "Secondary", value: "" },
      ];
    }
    return colours;
  };

  const [colours, setColours] = useState(getActiveColours);

  const handleAddColour = () => {
    // Find next unused key
    const usedKeys = new Set(colours.map((c) => c.key));
    const nextIdx = COLOUR_KEYS.findIndex((k) => !usedKeys.has(k));
    if (nextIdx === -1) return; // max 4
    const newColours = [...colours, { key: COLOUR_KEYS[nextIdx], label: COLOUR_LABELS[nextIdx], value: "" }];
    setColours(newColours);
  };

  const handleRemoveColour = (idx: number) => {
    const removed = colours[idx];
    const newColours = colours.filter((_, i) => i !== idx);
    setColours(newColours);
    onChange({ [removed.key]: "" });
  };

  const handleColourChange = (idx: number, value: string) => {
    const updated = [...colours];
    updated[idx] = { ...updated[idx], value };
    setColours(updated);
    onChange({ [updated[idx].key]: value });
  };

  const handleSkipToggle = (checked: boolean) => {
    setSkipColours(checked);
    if (checked) {
      // Clear all colours
      const patch: Partial<FounderOnboardingData> = {};
      COLOUR_KEYS.forEach((k) => { (patch as any)[k] = ""; });
      onChange(patch);
      setColours([]);
    } else {
      // Restore 2 default empty slots
      setColours([
        { key: "primary_color", label: "Primary", value: "" },
        { key: "secondary_color", label: "Secondary", value: "" },
      ]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${batchId}/logo.${ext}`;
    await supabase.storage.from("brand-assets").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("brand-assets").getPublicUrl(path);
    onChange({ logo_path: urlData.publicUrl });
    setUploading(false);
  };

  const handleGuidelinesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGuidelines(true);
    const ext = file.name.split(".").pop();
    const path = `${batchId}/brand-guidelines.${ext}`;
    await supabase.storage.from("brand-assets").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("brand-assets").getPublicUrl(path);
    onChange({ brand_guidelines_path: urlData.publicUrl });
    setUploadingGuidelines(false);
  };

  const canAddMore = colours.length < COLOUR_KEYS.length;

  return (
    <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h3 className="text-lg font-semibold text-[#173660] mb-1">Brand Assets</h3>
        <p className="text-sm text-[#173660]/60">
          Upload your logo and brand elements so Rhino can represent your company accurately across materials.
        </p>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-[#173660] mb-2">Company Logo</label>
        <p className="text-xs text-[#173660]/50 mb-3">SVG, PNG, AI, or EPS</p>
        {data.logo_path ? (
          <div className="flex items-center gap-3 p-3 border border-[#CDD8E3] rounded-lg bg-[#F4F7FA]">
            <img src={data.logo_path} alt="Logo" className="h-10 w-auto object-contain" />
            <button
              onClick={() => onChange({ logo_path: null })}
              className="ml-auto text-[#173660]/40 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-[#CDD8E3] rounded-lg p-8 flex flex-col items-center gap-2 hover:border-[#1A7EC8] transition-colors"
          >
            <Upload className="w-5 h-5 text-[#1A7EC8]" />
            <span className="text-sm text-[#173660]/60">
              {uploading ? "Uploading…" : "Click to upload logo"}
            </span>
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept=".svg,.png,.ai,.eps,.jpg,.jpeg"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Brand colours */}
      <div>
        <label className="block text-sm font-medium text-[#173660] mb-3">Brand Colours</label>

        {/* Skip toggle */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={skipColours}
            onChange={(e) => handleSkipToggle(e.target.checked)}
            className="w-4 h-4 rounded border-[#CDD8E3] text-[#1A7EC8] focus:ring-[#1A7EC8]"
          />
          <span className="text-sm text-[#173660]/60">We don't have brand colours yet</span>
        </label>

        {!skipColours && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colours.map((colour, idx) => (
                <div key={colour.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[#173660]/60">{colour.label}</label>
                    {colours.length > 1 && (
                      <button
                        onClick={() => handleRemoveColour(idx)}
                        className="text-[#173660]/30 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colour.value || "#ffffff"}
                      onChange={(e) => handleColourChange(idx, e.target.value)}
                      className="w-10 h-10 rounded border border-[#CDD8E3] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colour.value}
                      onChange={(e) => handleColourChange(idx, e.target.value)}
                      placeholder="#000000"
                      className="flex-1 h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660]"
                    />
                  </div>
                </div>
              ))}
            </div>
            {canAddMore && (
              <button
                onClick={handleAddColour}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#1A7EC8] hover:opacity-70 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add another colour
              </button>
            )}
          </>
        )}
      </div>

      {/* Brand guidelines */}
      <div>
        <label className="block text-sm font-medium text-[#173660] mb-2">
          Brand Guidelines Document <span className="text-[#173660]/40 font-normal">(optional)</span>
        </label>
        {data.brand_guidelines_path ? (
          <div className="flex items-center gap-3 p-3 border border-[#CDD8E3] rounded-lg bg-[#F4F7FA]">
            <FileText className="w-5 h-5 text-[#1A7EC8]" />
            <span className="text-sm text-[#173660] truncate flex-1">Brand guidelines uploaded</span>
            <button
              onClick={() => onChange({ brand_guidelines_path: null })}
              className="text-[#173660]/40 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => guidelinesInputRef.current?.click()}
            disabled={uploadingGuidelines}
            className="w-full border-2 border-dashed border-[#CDD8E3] rounded-lg p-6 flex items-center justify-center gap-2 hover:border-[#1A7EC8] transition-colors"
          >
            <Upload className="w-4 h-4 text-[#1A7EC8]" />
            <span className="text-sm text-[#173660]/60">
              {uploadingGuidelines ? "Uploading…" : "Upload guidelines"}
            </span>
          </button>
        )}
        <input
          ref={guidelinesInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg"
          onChange={handleGuidelinesUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default BrandAssetsStep;
