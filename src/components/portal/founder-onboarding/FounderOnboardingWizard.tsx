import { FC, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import StepIndicator from "./StepIndicator";
import BrandAssetsStep from "./BrandAssetsStep";
import KeyContactsStep from "./KeyContactsStep";
import TechStackStep from "./TechStackStep";
import PrioritiesStep from "./PrioritiesStep";
import ShareButton from "./ShareButton";
import { FounderOnboardingData, StepCompletion, STEP_LABELS } from "./types";

interface Props {
  userId: string;
  userEmail: string;
  userName: string;
  batchId: string;
  targetStep?: number | null;
}

const EMPTY_DATA: FounderOnboardingData = {
  batch_id: "",
  logo_path: null,
  primary_color: "#173660",
  secondary_color: "#1A7EC8",
  brand_guidelines_path: null,
  tagline: null,
  additional_contacts: [],
  tech_stack: {},
  priorities: [],
  priorities_other: null,
  priorities_notes: null,
  completed: false,
};

const FounderOnboardingWizard: FC<Props> = ({ userId, userEmail, userName, batchId, targetStep }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FounderOnboardingData>({ ...EMPTY_DATA, batch_id: batchId });
  const [completions, setCompletions] = useState<StepCompletion[]>([]);
  const [currentStep, setCurrentStep] = useState(targetStep ?? 1);
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: onbData }, { data: compData }] = await Promise.all([
        supabase.from("founder_onboarding" as any).select("*").eq("batch_id", batchId).maybeSingle(),
        supabase.from("founder_onboarding_step_completions" as any).select("*").eq("batch_id", batchId),
      ]);

      if (onbData) {
        const d = onbData as any;
        setData({
          id: d.id,
          batch_id: d.batch_id,
          logo_path: d.logo_path,
          primary_color: d.primary_color ?? "#173660",
          secondary_color: d.secondary_color ?? "#1A7EC8",
          brand_guidelines_path: d.brand_guidelines_path,
          tagline: d.tagline,
          additional_contacts: d.additional_contacts ?? [],
          tech_stack: d.tech_stack ?? {},
          priorities: d.priorities ?? [],
          priorities_other: d.priorities_other,
          priorities_notes: d.priorities_notes,
          completed: d.completed ?? false,
        });
        if (d.completed) setCollapsed(true);
      } else {
        // Create initial record
        await supabase.from("founder_onboarding" as any).insert({ batch_id: batchId } as any);
      }

      setCompletions((compData as any[]) ?? []);

      // Check localStorage for collapsed state
      const storedCollapsed = localStorage.getItem(`onboarding-collapsed-${batchId}`);
      if (storedCollapsed === "true") setCollapsed(true);

      setLoading(false);
    };
    load();
  }, [batchId]);

  const saveData = useCallback(async (newData: FounderOnboardingData) => {
    setSaving(true);
    const { id, ...rest } = newData;
    await supabase
      .from("founder_onboarding" as any)
      .update({
        logo_path: rest.logo_path,
        primary_color: rest.primary_color,
        secondary_color: rest.secondary_color,
        brand_guidelines_path: rest.brand_guidelines_path,
        tagline: rest.tagline,
        additional_contacts: rest.additional_contacts,
        tech_stack: rest.tech_stack,
        priorities: rest.priorities,
        priorities_other: rest.priorities_other,
        priorities_notes: rest.priorities_notes,
        completed: rest.completed,
      } as any)
      .eq("batch_id", batchId);
    setSaving(false);
  }, [batchId]);

  const handleChange = (patch: Partial<FounderOnboardingData>) => {
    const newData = { ...data, ...patch };
    setData(newData);
    // Debounced save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveData(newData), 800);
  };

  const markStepComplete = async (stepNum: number) => {
    const existing = completions.find((c) => c.step_number === stepNum && c.user_id === userId);
    if (existing) return;
    const completion: any = {
      batch_id: batchId,
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      step_number: stepNum,
    };
    await supabase.from("founder_onboarding_step_completions" as any).insert(completion);
    setCompletions((prev) => [...prev, { ...completion, completed_at: new Date().toISOString() }]);
  };

  const goToStep = (step: number) => {
    // Save + mark current step complete before leaving
    saveData(data);
    markStepComplete(currentStep);
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < 4) goToStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  const handleComplete = async () => {
    await markStepComplete(currentStep);
    const newData = { ...data, completed: true };
    setData(newData);
    await saveData(newData);
    setCollapsed(true);
    localStorage.setItem(`onboarding-collapsed-${batchId}`, "true");
  };

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(`onboarding-collapsed-${batchId}`, String(next));
  };

  const completedSteps = new Set(completions.map((c) => c.step_number));

  if (loading) {
    return (
      <div className="border border-[#CDD8E3] rounded-xl bg-white p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A7EC8]" />
      </div>
    );
  }

  // Collapsed state
  if (collapsed) {
    return (
      <div
        className="border border-[#a3d7c2] rounded-xl bg-[#a3d7c2]/10 p-4 flex items-center justify-between cursor-pointer hover:bg-[#a3d7c2]/15 transition-colors"
        onClick={toggleCollapse}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#a3d7c2]" />
          <span className="text-sm font-semibold text-[#173660]">
            Onboarding complete — expand to review or update
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-[#173660]/40" />
      </div>
    );
  }

  return (
    <div
      className="border border-[#CDD8E3] rounded-xl bg-white overflow-hidden shadow-sm"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="bg-[#173660] px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold">Welcome to Rhino</h2>
          <p className="text-white/60 text-sm mt-0.5">
            Complete these steps to get started with your portfolio support.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving
            </span>
          )}
          {data.completed && (
            <button
              onClick={toggleCollapse}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#CDD8E3]">
        <div
          className="h-full bg-[#1A7EC8] transition-all duration-500"
          style={{ width: `${(currentStep / STEP_LABELS.length) * 100}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 pt-4 pb-2 border-b border-[#CDD8E3]/50">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          completions={completions}
          onStepClick={(step) => goToStep(step)}
        />
      </div>

      {/* Step content */}
      <div className="px-6 py-8 min-h-[320px]">
        {currentStep === 1 && <BrandAssetsStep data={data} onChange={handleChange} batchId={batchId} />}
        {currentStep === 2 && (
          <KeyContactsStep data={data} onChange={handleChange} founderEmail={userEmail} founderName={userName} />
        )}
        {currentStep === 3 && <TechStackStep data={data} onChange={handleChange} />}
        {currentStep === 4 && <PrioritiesStep data={data} onChange={handleChange} />}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#CDD8E3]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <ShareButton batchId={batchId} userId={userId} />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="h-10 px-5 text-sm font-semibold text-[#173660] border border-[#CDD8E3] rounded-lg hover:bg-[#F4F7FA] transition-colors"
            >
              Back
            </button>
          )}
          {currentStep < 4 ? (
            <>
              <button
                onClick={handleNext}
                className="h-10 px-5 text-sm font-semibold text-[#173660]/50 hover:text-[#173660] transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="h-10 px-6 text-sm font-semibold text-white bg-[#1A7EC8] rounded-lg hover:bg-[#173660] transition-colors"
              >
                Next
              </button>
            </>
          ) : (
            <button
              onClick={handleComplete}
              className="h-10 px-6 text-sm font-semibold text-white bg-[#1A7EC8] rounded-lg hover:bg-[#173660] transition-colors"
            >
              Complete Onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FounderOnboardingWizard;
