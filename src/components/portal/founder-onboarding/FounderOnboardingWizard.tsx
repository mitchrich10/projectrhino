import { FC, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackPortalEvent } from "@/lib/portalAnalytics";
import { Loader2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";
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
  primary_color: "",
  secondary_color: "",
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
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [showStepError, setShowStepError] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Per-step minimum-input validation. A step is "valid" once at least one
  // meaningful input has been provided.
  const isStepValid = (step: number, d: FounderOnboardingData): boolean => {
    switch (step) {
      case 1:
        return !!d.logo_path || !!d.brand_guidelines_path;
      case 2:
        return (d.additional_contacts ?? []).some(
          (c) => c.name?.trim() && c.email?.trim() && c.role?.trim()
        );
      case 3:
        return Object.entries(d.tech_stack ?? {}).some(
          ([, v]) => Array.isArray(v) && v.length > 0
        );
      case 4:
        return (d.priorities ?? []).length > 0;
      default:
        return false;
    }
  };

  const STEP_REQUIREMENTS: Record<number, string> = {
    1: "Upload your logo or a brand guidelines document, or choose Skip.",
    2: "Add at least one contact (name, email, and role), or choose Skip.",
    3: "Select at least one tool, or choose Skip.",
    4: "Select at least one short-term need, or choose Skip.",
  };

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
          primary_color: d.primary_color ?? "",
          secondary_color: d.secondary_color ?? "",
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

      const storedSkipped = localStorage.getItem(`onboarding-skipped-${batchId}`);
      if (storedSkipped) {
        try {
          const arr = JSON.parse(storedSkipped) as number[];
          if (Array.isArray(arr)) setSkippedSteps(new Set(arr));
        } catch { /* ignore malformed */ }
      }

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

  const persistSkipped = (next: Set<number>) => {
    setSkippedSteps(next);
    localStorage.setItem(`onboarding-skipped-${batchId}`, JSON.stringify([...next]));
  };

  // Navigate without changing completion/skip state (used by step indicator + Back).
  const goToStep = (step: number) => {
    saveData(data);
    setShowStepError(false);
    setCurrentStep(step);
  };

  const advance = (step: number) => {
    saveData(data);
    setShowStepError(false);
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (!isStepValid(currentStep, data)) { setShowStepError(true); return; }
    markStepComplete(currentStep);
    const next = new Set(skippedSteps); next.delete(currentStep); persistSkipped(next);
    if (currentStep < 4) advance(currentStep + 1);
  };

  const handleSkip = () => {
    const next = new Set(skippedSteps); next.add(currentStep); persistSkipped(next);
    if (currentStep < 4) advance(currentStep + 1);
  };

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
          tertiaryColor: finalData.tertiary_color,
          accentColor: finalData.accent_color,
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
    if (!isStepValid(currentStep, data) && !skippedSteps.has(currentStep)) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    await markStepComplete(currentStep);
    const next = new Set(skippedSteps); next.delete(currentStep); persistSkipped(next);
    const newData = { ...data, completed: true };
    setData(newData);
    await saveData(newData);
    await Promise.all([sendCompletionEmail(newData), pushToDrive(newData)]);
    trackPortalEvent("onboarding_completed", companyName);
    setCollapsed(true);
    localStorage.setItem(`onboarding-collapsed-${batchId}`, "true");
  };

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (!next && !data.completed) {
      trackPortalEvent("onboarding_started", companyName);
    }
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Onboarding</p>
          <h2 className="text-white text-lg font-semibold">Welcome to The Crash{companyName && companyName !== "Your Company" ? `, ${companyName}` : ""}</h2>
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
          skippedSteps={skippedSteps}
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

        {showStepError && STEP_REQUIREMENTS[currentStep] && (
          <div className="mt-6 flex items-start gap-2 text-sm text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{STEP_REQUIREMENTS[currentStep]}</span>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="px-6 py-4 border-t border-[#CDD8E3]/50 flex items-center justify-end gap-3">
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
              onClick={handleSkip}
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

      {/* Share / invite CTA — dedicated section */}
      <div className="px-6 py-5 border-t border-[#CDD8E3]/50 bg-[#F4F7FA]/50">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#173660]/50 mb-1">Collaborate</p>
        <p className="text-sm text-[#173660]/70 mb-3">
          Need a teammate to fill in part of this? Invite them or share portal access.
        </p>
        <ShareButton batchId={batchId} userId={userId} userEmail={userEmail} companyName={companyName} />
      </div>
    </div>
  );
};

export default FounderOnboardingWizard;
