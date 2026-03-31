import { FC, useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FounderOnboardingData } from "./types";

interface Props {
  data: FounderOnboardingData;
  onChange: (patch: Partial<FounderOnboardingData>) => void;
  batchId: string;
}

const BrandAssetsStep: FC<Props> = ({ data, onChange, batchId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingGuidelines, setUploadingGuidelines] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const guidelinesInputRef = useRef<HTMLInputElement>(null);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#173660]/60 mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.primary_color}
                onChange={(e) => onChange({ primary_color: e.target.value })}
                className="w-10 h-10 rounded border border-[#CDD8E3] cursor-pointer"
              />
              <input
                type="text"
                value={data.primary_color}
                onChange={(e) => onChange({ primary_color: e.target.value })}
                placeholder="#173660"
                className="flex-1 h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#173660]/60 mb-1">Secondary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.secondary_color}
                onChange={(e) => onChange({ secondary_color: e.target.value })}
                className="w-10 h-10 rounded border border-[#CDD8E3] cursor-pointer"
              />
              <input
                type="text"
                value={data.secondary_color}
                onChange={(e) => onChange({ secondary_color: e.target.value })}
                placeholder="#1A7EC8"
                className="flex-1 h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660]"
              />
            </div>
          </div>
        </div>
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
