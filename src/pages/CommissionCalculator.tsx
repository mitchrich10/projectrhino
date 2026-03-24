import { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCAD(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    const n = abs / 1_000_000_000;
    return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const n = abs / 1_000;
    return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanInputs {
  role: string;
  territory: string;
  planPeriod: string;
  annualQuota: string;
  baseSalary: string;
  targetBonus: string;
  equity: string;
  monthlyWeight: string;
  quarterlyWeight: string;
  annualWeight: string;
  cliffThreshold: string;
  acceleratorThreshold: string;
  acceleratorMultiplier: string;
  psRate: string;
}

const DEFAULT_PLAN: PlanInputs = {
  role: "",
  territory: "",
  planPeriod: "Calendar Year 2026",
  annualQuota: "500000",
  baseSalary: "120000",
  targetBonus: "60000",
  equity: "",
  monthlyWeight: "25",
  quarterlyWeight: "25",
  annualWeight: "50",
  cliffThreshold: "85",
  acceleratorThreshold: "110",
  acceleratorMultiplier: "2",
  psRate: "4",
};

type PeriodType = "monthly" | "quarterly" | "annual";

interface RepCalc {
  periodType: PeriodType;
  periodQuota: string;
  actualOrders: string;
  psCollected: string;
}

// ── Calculation helpers ───────────────────────────────────────────────────────

function calcBonusPart(
  targetBonus: number,
  weight: number, // 0–1
  attainmentPct: number, // e.g. 0.90 = 90%
  cliff: number, // 0–1
  accelThresh: number, // 0–1
  accelMult: number
): number {
  if (attainmentPct < cliff) return 0;
  if (attainmentPct >= accelThresh) return targetBonus * weight * accelMult;
  return targetBonus * weight * attainmentPct;
}

// ── Section components ────────────────────────────────────────────────────────

const SectionHeader: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[10px] font-black uppercase tracking-ultra text-muted-foreground mb-4 border-b border-border pb-2">
    {children}
  </h2>
);

const FieldLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-[10px] font-black uppercase tracking-ultra text-muted-foreground block mb-1">
    {children}
  </label>
);

const TextInput: FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  type?: string;
}> = ({ value, onChange, placeholder, prefix, suffix, type = "text" }) => (
  <div className="flex items-center border border-border bg-card h-9 text-sm">
    {prefix && (
      <span className="px-2 text-muted-foreground text-xs font-bold border-r border-border h-full flex items-center">
        {prefix}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-2 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
    />
    {suffix && (
      <span className="px-2 text-muted-foreground text-xs border-l border-border h-full flex items-center">
        {suffix}
      </span>
    )}
  </div>
);

const ReadOnlyField: FC<{ label: string; value: string; large?: boolean; highlight?: boolean }> = ({
  label,
  value,
  large,
  highlight,
}) => (
  <div className={`border border-border ${highlight ? "bg-primary" : "bg-card"} px-3 py-2`}>
    <div className={`text-[9px] font-black uppercase tracking-ultra ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
      {label}
    </div>
    <div
      className={`font-black ${highlight ? "text-primary-foreground" : "text-foreground"} ${large ? "text-xl mt-0.5" : "text-sm"}`}
    >
      {value}
    </div>
  </div>
);

// ── ATTAINMENT TABLE ──────────────────────────────────────────────────────────

const ATTAINMENT_LEVELS = [70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130];

interface AttainmentRow {
  attainment: number;
  monthlyBonus: number;
  quarterlyBonus: number;
  annualBonus: number;
  totalBonus: number;
  baseBonus: number;
  vsOTE: number;
}

function useAttainmentTable(plan: PlanInputs, ote: number) {
  return useMemo<AttainmentRow[]>(() => {
    const target = parseNum(plan.targetBonus);
    const base = parseNum(plan.baseSalary);
    const mw = parseNum(plan.monthlyWeight) / 100;
    const qw = parseNum(plan.quarterlyWeight) / 100;
    const aw = parseNum(plan.annualWeight) / 100;
    const cliff = parseNum(plan.cliffThreshold) / 100;
    const accel = parseNum(plan.acceleratorThreshold) / 100;
    const mult = parseNum(plan.acceleratorMultiplier);

    return ATTAINMENT_LEVELS.map((pct) => {
      const a = pct / 100;
      const monthly = calcBonusPart(target, mw, a, cliff, accel, mult);
      const quarterly = calcBonusPart(target, qw, a, cliff, accel, mult);
      const annual = calcBonusPart(target, aw, a, cliff, accel, mult);
      const total = monthly * 12 + quarterly * 4 + annual;
      const baseBonus = base + total;
      const vsOTE = ote > 0 ? (baseBonus / ote) * 100 : 0;
      return { attainment: pct, monthlyBonus: monthly, quarterlyBonus: quarterly, annualBonus: annual, totalBonus: total, baseBonus, vsOTE };
    });
  }, [plan, ote]);
}

// ── Row colour ────────────────────────────────────────────────────────────────

function rowStyle(pct: number, cliff: number, accel: number): { bg: string; text: string } {
  if (pct / 100 < cliff) return { bg: "#FBEAE8", text: "#A33222" };
  if (pct / 100 >= accel) return { bg: "#D6F0E0", text: "#1A6B3C" };
  if (pct === 100) return { bg: "#F4F7FA", text: "#1A6B3C" };
  return { bg: "transparent", text: "#1A6B3C" };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CommissionCalculator: FC = () => {
  const [plan, setPlan] = useState<PlanInputs>(DEFAULT_PLAN);
  const [rep, setRep] = useState<RepCalc>({
    periodType: "monthly",
    periodQuota: "",
    actualOrders: "",
    psCollected: "",
  });

  const updatePlan = (field: keyof PlanInputs, value: string) =>
    setPlan((p) => ({ ...p, [field]: value }));

  const updateRep = (field: keyof RepCalc, value: string | PeriodType) =>
    setRep((r) => ({ ...r, [field]: value }));

  // Derived
  const base = parseNum(plan.baseSalary);
  const targetBonus = parseNum(plan.targetBonus);
  const equity = parseNum(plan.equity);
  const annualQuota = parseNum(plan.annualQuota);
  const ote = base + targetBonus;
  const totalPkg = ote + equity;

  const mw = parseNum(plan.monthlyWeight);
  const qw = parseNum(plan.quarterlyWeight);
  const aw = parseNum(plan.annualWeight);
  const weightsSum = mw + qw + aw;
  const weightsOk = Math.abs(weightsSum - 100) < 0.01;

  const cliff = parseNum(plan.cliffThreshold) / 100;
  const accel = parseNum(plan.acceleratorThreshold) / 100;
  const mult = parseNum(plan.acceleratorMultiplier);
  const psRate = parseNum(plan.psRate) / 100;

  const rows = useAttainmentTable(plan, ote);

  // Rep calculator
  const periodQuota = useMemo(() => {
    if (rep.periodQuota) return parseNum(rep.periodQuota);
    if (rep.periodType === "monthly") return annualQuota / 12;
    if (rep.periodType === "quarterly") return annualQuota / 4;
    return annualQuota;
  }, [rep.periodQuota, rep.periodType, annualQuota]);

  const actual = parseNum(rep.actualOrders);
  const attainmentPct = periodQuota > 0 ? actual / periodQuota : 0;

  const bonusWeight = useMemo(() => {
    if (rep.periodType === "monthly") return (mw / 100) * (targetBonus / 12);
    if (rep.periodType === "quarterly") return (qw / 100) * (targetBonus / 4);
    return aw / 100 * targetBonus;
  }, [rep.periodType, mw, qw, aw, targetBonus]);

  const periodBonus = useMemo(() => {
    if (rep.periodType === "monthly") {
      return calcBonusPart(targetBonus, mw / 100, attainmentPct, cliff, accel, mult);
    }
    if (rep.periodType === "quarterly") {
      return calcBonusPart(targetBonus, qw / 100, attainmentPct, cliff, accel, mult);
    }
    return calcBonusPart(targetBonus, aw / 100, attainmentPct, cliff, accel, mult);
  }, [rep.periodType, targetBonus, mw, qw, aw, attainmentPct, cliff, accel, mult]);

  const psEarned = parseNum(rep.psCollected) * psRate;

  const proRatedBase = useMemo(() => {
    if (rep.periodType === "monthly") return base / 12;
    if (rep.periodType === "quarterly") return base / 4;
    return base;
  }, [rep.periodType, base]);

  const totalPeriodEarnings = proRatedBase + periodBonus + psEarned;

  const repStatus = useMemo<{ label: string; icon: React.ReactNode; color: string }>(() => {
    if (attainmentPct < cliff)
      return { label: "Below cliff — no bonus", icon: <TrendingDown className="w-4 h-4" />, color: "#A33222" };
    if (attainmentPct >= accel)
      return { label: `Above accelerator threshold — ${mult}x rate`, icon: <TrendingUp className="w-4 h-4" />, color: "#1A6B3C" };
    if (attainmentPct >= 1)
      return { label: "At or above target", icon: <TrendingUp className="w-4 h-4" />, color: "#1A6B3C" };
    return { label: "Below target — partial bonus", icon: <Minus className="w-4 h-4" />, color: "#5C6B7A" };
  }, [attainmentPct, cliff, accel, mult]);

  const aboveBelow = actual - periodQuota;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-sm font-black uppercase tracking-ultra text-foreground">
            Commission Calculator
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Rhino Ventures · Sales Compensation</p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* ── SECTION 1 — PLAN INPUTS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Rep details */}
          <div className="bg-card border border-border p-5 space-y-4">
            <SectionHeader>Rep Details</SectionHeader>
            <div className="space-y-3">
              <div>
                <FieldLabel>Role / Title</FieldLabel>
                <TextInput value={plan.role} onChange={(v) => updatePlan("role", v)} placeholder="e.g. Account Executive" />
              </div>
              <div>
                <FieldLabel>Territory</FieldLabel>
                <TextInput value={plan.territory} onChange={(v) => updatePlan("territory", v)} placeholder="e.g. Ontario" />
              </div>
              <div>
                <FieldLabel>Plan Period</FieldLabel>
                <TextInput value={plan.planPeriod} onChange={(v) => updatePlan("planPeriod", v)} placeholder="e.g. Calendar Year 2026" />
              </div>
              <div>
                <FieldLabel>Annual Quota</FieldLabel>
                <TextInput value={plan.annualQuota} onChange={(v) => updatePlan("annualQuota", v)} prefix="CAD $" type="number" />
              </div>
              <div>
                <FieldLabel>Base Salary</FieldLabel>
                <TextInput value={plan.baseSalary} onChange={(v) => updatePlan("baseSalary", v)} prefix="CAD $" type="number" />
              </div>
              <div>
                <FieldLabel>Target Bonus at 100%</FieldLabel>
                <TextInput value={plan.targetBonus} onChange={(v) => updatePlan("targetBonus", v)} prefix="CAD $" type="number" />
              </div>
              <div>
                <FieldLabel>Equity Value (optional)</FieldLabel>
                <TextInput value={plan.equity} onChange={(v) => updatePlan("equity", v)} prefix="CAD $" type="number" placeholder="0" />
              </div>
            </div>
          </div>

          {/* Middle: Package summary + Bonus weights */}
          <div className="space-y-4">
            {/* Package summary */}
            <div className="bg-card border border-border p-5 space-y-3">
              <SectionHeader>Package Summary</SectionHeader>
              <ReadOnlyField label="OTE at 100% (Base + Target Bonus)" value={fmtCAD(ote)} large highlight />
              <div className="grid grid-cols-2 gap-3">
                <ReadOnlyField label="Base Salary" value={fmtCAD(base)} />
                <ReadOnlyField label="Target Bonus" value={fmtCAD(targetBonus)} />
              </div>
              {equity > 0 && (
                <ReadOnlyField label="Total Annual Package (OTE + Equity)" value={fmtCAD(totalPkg)} />
              )}
            </div>

            {/* Bonus structure */}
            <div className="bg-card border border-border p-5 space-y-3">
              <SectionHeader>Bonus Structure</SectionHeader>
              <p className="text-[10px] text-muted-foreground -mt-2 mb-1">Weights must sum to 100%</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <FieldLabel>Monthly</FieldLabel>
                  <TextInput value={plan.monthlyWeight} onChange={(v) => updatePlan("monthlyWeight", v)} suffix="%" type="number" />
                </div>
                <div>
                  <FieldLabel>Quarterly</FieldLabel>
                  <TextInput value={plan.quarterlyWeight} onChange={(v) => updatePlan("quarterlyWeight", v)} suffix="%" type="number" />
                </div>
                <div>
                  <FieldLabel>Annual</FieldLabel>
                  <TextInput value={plan.annualWeight} onChange={(v) => updatePlan("annualWeight", v)} suffix="%" type="number" />
                </div>
              </div>
              {!weightsOk && (
                <div className="flex items-center gap-2 text-[11px] font-semibold border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Weights sum to {weightsSum.toFixed(0)}% — must equal 100%
                </div>
              )}
              {weightsOk && (
                <div className="text-[10px] text-muted-foreground">
                  Monthly target: {fmtCAD(targetBonus * mw / 100 / 12)}/mo · Quarterly target: {fmtCAD(targetBonus * qw / 100 / 4)}/qtr · Annual: {fmtCAD(targetBonus * aw / 100)}/yr
                </div>
              )}
            </div>
          </div>

          {/* Right: Cliff & accelerator */}
          <div className="bg-card border border-border p-5 space-y-3">
            <SectionHeader>Cliff & Accelerator Settings</SectionHeader>
            <div>
              <FieldLabel>Cliff Threshold — no bonus below this %</FieldLabel>
              <TextInput value={plan.cliffThreshold} onChange={(v) => updatePlan("cliffThreshold", v)} suffix="%" type="number" />
              <p className="text-[10px] text-muted-foreground mt-1">
                Reps at &lt;{plan.cliffThreshold || "85"}% attainment receive $0 bonus
              </p>
            </div>
            <div>
              <FieldLabel>Accelerator Threshold</FieldLabel>
              <TextInput value={plan.acceleratorThreshold} onChange={(v) => updatePlan("acceleratorThreshold", v)} suffix="%" type="number" />
            </div>
            <div>
              <FieldLabel>Accelerator Multiplier</FieldLabel>
              <TextInput value={plan.acceleratorMultiplier} onChange={(v) => updatePlan("acceleratorMultiplier", v)} suffix="x" type="number" />
              <p className="text-[10px] text-muted-foreground mt-1">
                At ≥{plan.acceleratorThreshold || "110"}% attainment, bonus rate multiplied by {plan.acceleratorMultiplier || "2"}x
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <FieldLabel>Professional Services Commission Rate</FieldLabel>
              <TextInput value={plan.psRate} onChange={(v) => updatePlan("psRate", v)} suffix="%" type="number" />
              <p className="text-[10px] text-muted-foreground mt-1">
                Applied to PS revenue collected in the Rep Calculator
              </p>
            </div>

            {/* Visual guide */}
            <div className="pt-2 border-t border-border space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-ultra text-muted-foreground">At 100% Quota</p>
              <div className="grid grid-cols-2 gap-2">
                <ReadOnlyField label="Monthly bonus" value={fmtCAD(targetBonus * mw / 100)} />
                <ReadOnlyField label="Quarterly bonus" value={fmtCAD(targetBonus * qw / 100)} />
                <ReadOnlyField label="Annual bonus" value={fmtCAD(targetBonus * aw / 100)} />
                <ReadOnlyField label="Total annual bonus" value={fmtCAD(targetBonus)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2 — ATTAINMENT TABLE ────────────────────────────────────── */}
        <div className="bg-card border border-border">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-baseline justify-between">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-ultra text-muted-foreground">
                Section 2 — Attainment Table
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Updates live as inputs change · Rows 70–130% in 5% increments
                {plan.planPeriod && <span className="ml-2 text-foreground font-semibold">{plan.planPeriod}</span>}
              </p>
            </div>
            {plan.role && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-ultra">
                {plan.role}{plan.territory && ` · ${plan.territory}`}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Attainment",
                    "Monthly bonus",
                    "Quarterly bonus",
                    "Annual bonus",
                    "Total bonus",
                    "Base + bonus",
                    "vs. OTE",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-ultra text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const { bg, text } = rowStyle(r.attainment, cliff, accel);
                  const isZero = r.totalBonus === 0;
                  return (
                    <tr
                      key={r.attainment}
                      style={{ backgroundColor: bg }}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-4 py-2.5 font-bold text-foreground whitespace-nowrap">
                        {r.attainment}%
                        {r.attainment === 100 && (
                          <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 font-black uppercase tracking-wide">
                            Target
                          </span>
                        )}
                        {r.attainment / 100 >= accel && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 font-black uppercase tracking-wide" style={{ background: "#D6F0E0", color: "#1A6B3C" }}>
                            Accel
                          </span>
                        )}
                        {r.attainment / 100 < cliff && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 font-black uppercase tracking-wide" style={{ background: "#FBEAE8", color: "#A33222" }}>
                            Cliff
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: isZero ? "#5C6B7A" : text }}>
                        {isZero ? "$0" : fmtCAD(r.monthlyBonus)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: isZero ? "#5C6B7A" : text }}>
                        {isZero ? "$0" : fmtCAD(r.quarterlyBonus)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: isZero ? "#5C6B7A" : text }}>
                        {isZero ? "$0" : fmtCAD(r.annualBonus)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: isZero ? "#5C6B7A" : text }}>
                        {isZero ? "$0" : fmtCAD(r.totalBonus)}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-foreground whitespace-nowrap">
                        {fmtCAD(r.baseBonus)}
                      </td>
                      <td
                        className="px-4 py-2.5 font-bold whitespace-nowrap"
                        style={{ color: r.vsOTE >= 100 ? "#1A6B3C" : r.vsOTE === 0 ? "#A33222" : "#5C6B7A" }}
                      >
                        {r.vsOTE.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            <span>
              <span className="inline-block w-3 h-3 mr-1 align-middle" style={{ background: "#FBEAE8" }} />
              Below cliff ({plan.cliffThreshold || 85}%) — no bonus
            </span>
            <span>
              <span className="inline-block w-3 h-3 mr-1 align-middle" style={{ background: "#F4F7FA" }} />
              Between cliff and target
            </span>
            <span>
              <span className="inline-block w-3 h-3 mr-1 align-middle" style={{ background: "#D6F0E0" }} />
              At/above accelerator ({plan.acceleratorThreshold || 110}%) — {plan.acceleratorMultiplier || 2}x rate
            </span>
          </div>
        </div>

        {/* ── SECTION 3 — REP CALCULATOR ──────────────────────────────────────── */}
        <div className="bg-card border border-border p-5">
          <SectionHeader>Section 3 — Rep Calculator: What did I earn this period?</SectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-ultra text-muted-foreground">Inputs</h3>

              {/* Period type toggle */}
              <div>
                <FieldLabel>Period Type</FieldLabel>
                <div className="flex border border-border">
                  {(["monthly", "quarterly", "annual"] as PeriodType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        updateRep("periodType", t);
                        updateRep("periodQuota", "");
                      }}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-ultra transition-colors ${
                        rep.periodType === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>
                  Period Quota{" "}
                  <span className="text-[9px] font-normal normal-case tracking-normal text-muted-foreground">
                    (default: {fmtCAD(
                      rep.periodType === "monthly" ? annualQuota / 12 :
                      rep.periodType === "quarterly" ? annualQuota / 4 :
                      annualQuota
                    )})
                  </span>
                </FieldLabel>
                <TextInput
                  value={rep.periodQuota}
                  onChange={(v) => updateRep("periodQuota", v)}
                  prefix="CAD $"
                  type="number"
                  placeholder={String(
                    rep.periodType === "monthly" ? Math.round(annualQuota / 12) :
                    rep.periodType === "quarterly" ? Math.round(annualQuota / 4) :
                    annualQuota
                  )}
                />
              </div>

              <div>
                <FieldLabel>Actual Orders / Revenue</FieldLabel>
                <TextInput value={rep.actualOrders} onChange={(v) => updateRep("actualOrders", v)} prefix="CAD $" type="number" placeholder="0" />
              </div>

              <div>
                <FieldLabel>Professional Services Collected (optional)</FieldLabel>
                <TextInput value={rep.psCollected} onChange={(v) => updateRep("psCollected", v)} prefix="CAD $" type="number" placeholder="0" />
                {parseNum(rep.psCollected) > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    PS commission at {plan.psRate || 4}%: {fmtCAD(psEarned)}
                  </p>
                )}
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-ultra text-muted-foreground">Earnings Breakdown</h3>

              {/* Status badge */}
              <div
                className="flex items-center gap-2 px-3 py-3 border font-semibold text-sm"
                style={{
                  borderColor: repStatus.color,
                  color: repStatus.color,
                  background: repStatus.color === "#A33222" ? "#FBEAE8" : repStatus.color === "#1A6B3C" ? "#D6F0E0" : "#F4F7FA",
                }}
              >
                {repStatus.icon}
                {repStatus.label}
              </div>

              {/* Attainment + delta */}
              <div className="grid grid-cols-2 gap-3">
                <ReadOnlyField
                  label={`Attainment (${rep.periodType})`}
                  value={`${(attainmentPct * 100).toFixed(1)}%`}
                />
                <ReadOnlyField
                  label={aboveBelow >= 0 ? "Above target" : "Below target"}
                  value={(aboveBelow >= 0 ? "+" : "") + fmtCAD(aboveBelow)}
                />
              </div>

              {/* Earnings */}
              <div className="grid grid-cols-2 gap-3">
                <ReadOnlyField label={`Pro-rated base (${rep.periodType})`} value={fmtCAD(proRatedBase)} />
                <ReadOnlyField label="Bonus earned this period" value={fmtCAD(periodBonus)} />
                {parseNum(rep.psCollected) > 0 && (
                  <ReadOnlyField label="PS commission" value={fmtCAD(psEarned)} />
                )}
              </div>

              <ReadOnlyField
                label="Total period earnings (base + bonus + PS)"
                value={fmtCAD(totalPeriodEarnings)}
                large
                highlight
              />

              {/* Annualised projection note */}
              {rep.periodType !== "annual" && (
                <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
                  Annualised run-rate:{" "}
                  <strong className="text-foreground">
                    {fmtCAD(totalPeriodEarnings * (rep.periodType === "monthly" ? 12 : 4))}
                  </strong>{" "}
                  if this attainment is maintained all year
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-muted-foreground pb-4">
          Rhino Ventures · Commission Calculator · All figures in CAD
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculator;
