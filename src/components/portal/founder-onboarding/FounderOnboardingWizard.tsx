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
  companyName: string;
  targetStep?: number | null;
}

const EMPTY_DATA: FounderOnboardingData = {
  batch_id: "",
  logo_path: null,
  primary_color: "#173660",
  secondary_color: "#1A7EC8",
  tertiary_color: "",
  accent_color: "",
  brand_guidelines_path: null,
  tagline: null,
  additional_contacts: [],
  tech_stack: {},
  priorities: [],
  priorities_other: null,
  priorities_notes: null,
  priority_context: {},
  rhino_assistance: null,
  feature_company: null,
  announcing_raise: null,
  completed: false,
};

const FounderOnboardingWizard: FC<Props> = ({ userId, userEmail, userName, batchId, companyName, targetStep }) => {
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
          tertiary_color: d.tertiary_color ?? "",
          accent_color: d.accent_color ?? "",
          brand_guidelines_path: d.brand_guidelines_path,
          tagline: d.tagline,
          additional_contacts: d.additional_contacts ?? [],
          tech_stack: d.tech_stack ?? {},
          priorities: d.priorities ?? [],
          priorities_other: d.priorities_other,
          priorities_notes: d.priorities_notes,
          priority_context: d.priority_context ?? {},
          rhino_assistance: d.rhino_assistance,
          feature_company: d.feature_company,
          announcing_raise: d.announcing_raise,
          completed: d.completed ?? false,
        });
        if (d.completed) setCollapsed(true);
      } else {
        await supabase.from("founder_onboarding" as any).insert({ batch_id: batchId } as any);
      }

      setCompletions((compData as any[]) ?? []);

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
        tertiary_color: rest.tertiary_color || null,
        accent_color: rest.accent_color || null,
        brand_guidelines_path: rest.brand_guidelines_path,
        tagline: rest.tagline,
        additional_contacts: rest.additional_contacts,
        tech_stack: rest.tech_stack,
        priorities: rest.priorities,
        priorities_other: rest.priorities_other,
        priorities_notes: rest.priorities_notes,
        priority_context: rest.priority_context,
        rhino_assistance: rest.rhino_assistance,
        feature_company: rest.feature_company,
        announcing_raise: rest.announcing_raise,
        completed: rest.completed,
      } as any)
      .eq("batch_id", batchId);
    setSaving(false);
  }, [batchId]);

  const handleChange = (patch: Partial<FounderOnboardingData>) => {
    const newData = { ...data, ...patch };
    setData(newData);
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
    saveData(data);
    markStepComplete(currentStep);
    setCurrentStep(step);
  };

  const handleNext = () => { if (currentStep < 4) goToStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) goToStep(currentStep - 1); };

  const sendCompletionEmail = async (finalData: FounderOnboardingData) => {
    try {
      await supabase.functions.invoke("send-onboarding-submission", {
        body: {
          companyName,
          userEmail,
          teamMembers: finalData.additional_contacts ?? [],
          needs: finalData.priorities ?? [],
          additionalNotes: finalData.priorities_notes,
          logoPermission: finalData.feature_company,
          announcingRaise: finalData.announcing_raise,
          wantsRhinoSupport: finalData.rhino_assistance,
          techStack: finalData.tech_stack,
          priorityContext: finalData.priority_context,
          logoPath: finalData.logo_path,
          primaryColor: finalData.primary_color,
          secondaryColor: finalData.secondary_color,
          brandGuidelinesPath: finalData.brand_guidelines_path,
          prioritiesOther: finalData.priorities_other,
        },
      });
    } catch (e) {
      console.error("Failed to send completion email", e);
    }
  };

  const pushToDrive = async (finalData: FounderOnboardingData) => {
    try {
      const filePaths = [finalData.logo_path, finalData.brand_guidelines_path].filter(Boolean);
      await supabase.functions.invoke("push-onboarding-to-drive", {
        body: { companyName, submissionHtml: "", filePaths },
      });
    } catch (e) {
      console.error("Drive push failed (non-blocking)", e);
    }
  };

  const handleComplete = async () => {
    await markStepComplete(currentStep);
    const newData = { ...data, completed: true };
    setData(newData);
    await saveData(newData);
    await Promise.all([sendCompletionEmail(newData), pushToDrive(newData)]);
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
      <div className="border border-[#CDD8E3] rounded-xl bg-white p-8 flex items-center justify-center shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A7EC8]" />
      </div>
    );
  }

  if (collapsed) {
    return (
      <div
        className="border border-[#a3d7c2] rounded-xl bg-[#a3d7c2]/10 p-4 flex items-center justify-between cursor-pointer hover:bg-[#a3d7c2]/15 transition-colors shadow-sm"
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
      className="border-l-4 border-l-[#1A7EC8] border border-[#CDD8E3] rounded-xl bg-white overflow-hidden shadow-sm"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="bg-[#173660] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Get set up</p>
          <h2 className="text-white text-lg font-semibold">Tell us about {companyName}</h2>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving
            </span>
          )}
          {data.completed && (
            <button onClick={toggleCollapse} className="text-white/40 hover:text-white transition-colors">
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
        <ShareButton batchId={batchId} userId={userId} userEmail={userEmail} companyName={companyName} />

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
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FounderOnboardingWizard;
