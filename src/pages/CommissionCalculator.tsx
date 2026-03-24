import { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { downloadCommissionXLSX } from "@/lib/exportCommissionCalculator";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const NAVY     = "#173660";
const BLUE     = "#1A7EC8";
const MINT     = "#A3D7C2";
const SLATE    = "#CDD8E3";
const OFFWHITE = "#F4F7FA";
const GREY_MID = "#5C6B7A";

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
  weight: number,
  attainmentPct: number,
  cliff: number,
  accelThresh: number,
  accelMult: number
): number {
  if (attainmentPct < cliff) return 0;
  if (attainmentPct >= accelThresh) return targetBonus * weight * accelMult;
  return targetBonus * weight * attainmentPct;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

/** Navy bar card header */
const CardHeader: FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div
    className="flex items-center justify-between px-5 py-3"
    style={{ background: NAVY }}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">{children}</span>
    {right && <span className="text-[10px] text-white/60">{right}</span>}
  </div>
);

const FieldLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: GREY_MID }}>
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
  <div
    className="flex items-center h-9 text-sm border"
    style={{ borderColor: SLATE, background: "#fff" }}
  >
    {prefix && (
      <span
        className="px-2.5 text-xs font-semibold h-full flex items-center border-r flex-shrink-0"
        style={{ color: GREY_MID, borderColor: SLATE, background: OFFWHITE }}
      >
        {prefix}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-2.5 bg-transparent outline-none text-sm"
      style={{ color: NAVY }}
    />
    {suffix && (
      <span
        className="px-2.5 text-xs font-semibold h-full flex items-center border-l flex-shrink-0"
        style={{ color: GREY_MID, borderColor: SLATE, background: OFFWHITE }}
      >
        {suffix}
      </span>
    )}
  </div>
);

const MetricTile: FC<{
  label: string;
  value: string;
  accent?: boolean;
  navy?: boolean;
  small?: boolean;
}> = ({ label, value, accent, navy, small }) => {
  const bg = navy ? NAVY : accent ? OFFWHITE : "#fff";
  const valColor = navy ? "#fff" : accent ? BLUE : NAVY;
  const lblColor = navy ? "rgba(255,255,255,0.55)" : GREY_MID;
  return (
    <div className="border px-3 py-2.5" style={{ borderColor: SLATE, background: bg }}>
      <div className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: lblColor }}>
        {label}
      </div>
      <div
        className={`font-semibold ${small ? "text-sm" : "text-base"}`}
        style={{ color: valColor }}
      >
        {value}
      </div>
    </div>
  );
};

// ── Attainment logic ──────────────────────────────────────────────────────────
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

function useAttainmentTable(plan: PlanInputs, ote: number): AttainmentRow[] {
  return useMemo(() => {
    const target = parseNum(plan.targetBonus);
    const base   = parseNum(plan.baseSalary);
    const mw     = parseNum(plan.monthlyWeight) / 100;
    const qw     = parseNum(plan.quarterlyWeight) / 100;
    const aw     = parseNum(plan.annualWeight) / 100;
    const cliff  = parseNum(plan.cliffThreshold) / 100;
    const accel  = parseNum(plan.acceleratorThreshold) / 100;
    const mult   = parseNum(plan.acceleratorMultiplier);

    return ATTAINMENT_LEVELS.map((pct) => {
      const a         = pct / 100;
      const monthly   = calcBonusPart(target, mw, a, cliff, accel, mult);
      const quarterly = calcBonusPart(target, qw, a, cliff, accel, mult);
      const annual    = calcBonusPart(target, aw, a, cliff, accel, mult);
      const total     = monthly * 12 + quarterly * 4 + annual;
      const baseBonus = base + total;
      const vsOTE     = ote > 0 ? (baseBonus / ote) * 100 : 0;
      return { attainment: pct, monthlyBonus: monthly, quarterlyBonus: quarterly, annualBonus: annual, totalBonus: total, baseBonus, vsOTE };
    });
  }, [plan, ote]);
}

type RowTier = "below-cliff" | "partial" | "at-target" | "accel";

function getRowTier(pct: number, cliff: number, accel: number): RowTier {
  const a = pct / 100;
  if (a < cliff) return "below-cliff";
  if (a >= accel) return "accel";
  if (a >= 1) return "at-target";
  return "partial";
}

const ROW_STYLES: Record<RowTier, { bg: string; bonusColor: string; isZero: boolean }> = {
  "below-cliff": { bg: "#F4F4F4",  bonusColor: GREY_MID,  isZero: true  },
  "partial":     { bg: "#fff",     bonusColor: NAVY,       isZero: false },
  "at-target":   { bg: "#fff",     bonusColor: BLUE,       isZero: false },
  "accel":       { bg: MINT,       bonusColor: NAVY,       isZero: false },
};

// ── Page ──────────────────────────────────────────────────────────────────────
const CommissionCalculator: FC = () => {
  const [plan, setPlan] = useState<PlanInputs>(DEFAULT_PLAN);
  const [rep,  setRep]  = useState<RepCalc>({ periodType: "monthly", periodQuota: "", actualOrders: "", psCollected: "" });

  const updatePlan = (field: keyof PlanInputs, value: string) => setPlan((p) => ({ ...p, [field]: value }));
  const updateRep  = (field: keyof RepCalc,  value: string | PeriodType) => setRep((r) => ({ ...r, [field]: value }));

  // Derived plan values
  const base        = parseNum(plan.baseSalary);
  const targetBonus = parseNum(plan.targetBonus);
  const equity      = parseNum(plan.equity);
  const annualQuota = parseNum(plan.annualQuota);
  const ote         = base + targetBonus;
  const totalPkg    = ote + equity;
  const mw          = parseNum(plan.monthlyWeight);
  const qw          = parseNum(plan.quarterlyWeight);
  const aw          = parseNum(plan.annualWeight);
  const weightsSum  = mw + qw + aw;
  const weightsOk   = Math.abs(weightsSum - 100) < 0.01;
  const cliff       = parseNum(plan.cliffThreshold) / 100;
  const accel       = parseNum(plan.acceleratorThreshold) / 100;
  const mult        = parseNum(plan.acceleratorMultiplier);
  const psRate      = parseNum(plan.psRate) / 100;

  const rows = useAttainmentTable(plan, ote);

  // Rep calc
  const periodQuota = useMemo(() => {
    if (rep.periodQuota) return parseNum(rep.periodQuota);
    if (rep.periodType === "monthly")   return annualQuota / 12;
    if (rep.periodType === "quarterly") return annualQuota / 4;
    return annualQuota;
  }, [rep.periodQuota, rep.periodType, annualQuota]);

  const actual        = parseNum(rep.actualOrders);
  const attainmentPct = periodQuota > 0 ? actual / periodQuota : 0;

  const periodBonus = useMemo(() => {
    if (rep.periodType === "monthly")   return calcBonusPart(targetBonus, mw / 100, attainmentPct, cliff, accel, mult);
    if (rep.periodType === "quarterly") return calcBonusPart(targetBonus, qw / 100, attainmentPct, cliff, accel, mult);
    return calcBonusPart(targetBonus, aw / 100, attainmentPct, cliff, accel, mult);
  }, [rep.periodType, targetBonus, mw, qw, aw, attainmentPct, cliff, accel, mult]);

  const psEarned          = parseNum(rep.psCollected) * psRate;
  const proRatedBase      = rep.periodType === "monthly" ? base / 12 : rep.periodType === "quarterly" ? base / 4 : base;
  const totalPeriodEarnings = proRatedBase + periodBonus + psEarned;
  const aboveBelow        = actual - periodQuota;

  type StatusKey = "cliff" | "partial" | "target" | "accel";
  const statusKey: StatusKey = attainmentPct < cliff ? "cliff"
    : attainmentPct >= accel ? "accel"
    : attainmentPct >= 1 ? "target"
    : "partial";

  const STATUS_CONFIG: Record<StatusKey, { label: string; icon: React.ReactNode; bg: string; fg: string }> = {
    cliff:   { label: "Below cliff — no bonus",                          icon: <TrendingDown className="w-4 h-4" />, bg: "#A33222", fg: "#fff" },
    partial: { label: "Below target — partial bonus",                    icon: <Minus        className="w-4 h-4" />, bg: "#F5A623", fg: "#fff" },
    target:  { label: "At or above target",                              icon: <TrendingUp   className="w-4 h-4" />, bg: BLUE,      fg: "#fff" },
    accel:   { label: `Above accelerator threshold — ${mult}x rate`,     icon: <TrendingUp   className="w-4 h-4" />, bg: MINT,      fg: NAVY   },
  };
  const status = STATUS_CONFIG[statusKey];

  return (
    <div className="min-h-screen" style={{ background: OFFWHITE, fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Top header bar */}
      <header className="border-b" style={{ background: "#fff", borderColor: SLATE }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="transition-opacity hover:opacity-70" style={{ color: NAVY }}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-5 w-px" style={{ background: SLATE }} />
            <span
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: NAVY }}
            >
              Rhino Ventures
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: GREY_MID }}>
            Commission Calculator
          </span>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-6 space-y-6">

        {/* ── SECTION 1 — PLAN INPUTS ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Card 1 — Rep Details */}
          <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
            <CardHeader>Plan Inputs — Rep Details</CardHeader>
            <div className="p-5 space-y-3">
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
                <FieldLabel>Equity Value <span className="normal-case font-normal tracking-normal text-[9px]">(optional)</span></FieldLabel>
                <TextInput value={plan.equity} onChange={(v) => updatePlan("equity", v)} prefix="CAD $" type="number" placeholder="0" />
              </div>

              {/* OTE prominent block */}
              <div
                className="mt-4 px-4 py-4 border-t-2"
                style={{ background: NAVY, borderColor: BLUE }}
              >
                <div className="text-[9px] font-semibold uppercase tracking-widest text-white/50 mb-1">
                  OTE at 100% — Base + Target Bonus
                </div>
                <div className="text-3xl font-semibold" style={{ color: BLUE }}>
                  {fmtCAD(ote)}
                </div>
                {equity > 0 && (
                  <div className="mt-2 text-[10px] text-white/60">
                    Total package incl. equity:{" "}
                    <span className="text-white font-semibold">{fmtCAD(totalPkg)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2 — Bonus Structure */}
          <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
            <CardHeader>Plan Inputs — Bonus Structure</CardHeader>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: GREY_MID }}>
                  Bonus weights — must sum to 100%
                </div>
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
                  <div
                    className="mt-2 flex items-center gap-2 text-xs font-semibold px-3 py-2 border"
                    style={{ background: "#FFF3CD", borderColor: "#F5A623", color: "#7A4A00" }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Weights sum to {weightsSum.toFixed(0)}% — must equal 100%
                  </div>
                )}
              </div>

              {weightsOk && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: SLATE }}>
                  <MetricTile label="Monthly target" value={fmtCAD(targetBonus * mw / 100 / 12)} small />
                  <MetricTile label="Quarterly target" value={fmtCAD(targetBonus * qw / 100 / 4)} small />
                  <MetricTile label="Annual bonus" value={fmtCAD(targetBonus * aw / 100)} small />
                  <MetricTile label="Total annual bonus" value={fmtCAD(targetBonus)} small />
                </div>
              )}

              <div className="pt-3 border-t space-y-2" style={{ borderColor: SLATE }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: GREY_MID }}>
                  Package breakdown
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetricTile label="Base salary" value={fmtCAD(base)} small />
                  <MetricTile label="Target bonus" value={fmtCAD(targetBonus)} small />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 — Cliff & Accelerator */}
          <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
            <CardHeader>Plan Inputs — Cliff & Accelerator</CardHeader>
            <div className="p-5 space-y-4">
              <div>
                <FieldLabel>Cliff Threshold — no bonus below this attainment</FieldLabel>
                <TextInput value={plan.cliffThreshold} onChange={(v) => updatePlan("cliffThreshold", v)} suffix="%" type="number" />
                <p className="text-[10px] mt-1" style={{ color: GREY_MID }}>
                  Reps below {plan.cliffThreshold || "85"}% attainment earn $0 bonus
                </p>
              </div>
              <div>
                <FieldLabel>Accelerator Threshold</FieldLabel>
                <TextInput value={plan.acceleratorThreshold} onChange={(v) => updatePlan("acceleratorThreshold", v)} suffix="%" type="number" />
              </div>
              <div>
                <FieldLabel>Accelerator Multiplier</FieldLabel>
                <TextInput value={plan.acceleratorMultiplier} onChange={(v) => updatePlan("acceleratorMultiplier", v)} suffix="x" type="number" />
                <p className="text-[10px] mt-1" style={{ color: GREY_MID }}>
                  At ≥{plan.acceleratorThreshold || "110"}% attainment, bonus rate is {plan.acceleratorMultiplier || "2"}×
                </p>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: SLATE }}>
                <FieldLabel>Professional Services Commission Rate</FieldLabel>
                <TextInput value={plan.psRate} onChange={(v) => updatePlan("psRate", v)} suffix="%" type="number" />
                <p className="text-[10px] mt-1" style={{ color: GREY_MID }}>
                  Applied to PS revenue in the Rep Calculator
                </p>
              </div>

              {/* Legend chips */}
              <div className="pt-3 border-t space-y-2" style={{ borderColor: SLATE }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: GREY_MID }}>Row colour key</div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-3 border flex-shrink-0" style={{ background: "#F4F4F4", borderColor: SLATE }} />
                    <span style={{ color: GREY_MID }}>Below cliff — no bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-3 border flex-shrink-0" style={{ background: "#fff", borderColor: SLATE }} />
                    <span style={{ color: GREY_MID }}>Partial / at-target (bonus in <span style={{ color: BLUE }}>blue</span>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-3 border flex-shrink-0" style={{ background: MINT, borderColor: SLATE }} />
                    <span style={{ color: GREY_MID }}>Above accelerator — exceptional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2 — ATTAINMENT TABLE ───────────────────────────────────── */}
        <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
          <CardHeader
            right={plan.role ? `${plan.role}${plan.territory ? ` · ${plan.territory}` : ""}${plan.planPeriod ? ` · ${plan.planPeriod}` : ""}` : plan.planPeriod || undefined}
          >
            Attainment Table — 70% to 130%
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: NAVY }}>
                  {["Attainment", "Monthly bonus", "Quarterly bonus", "Annual bonus", "Total bonus (ann.)", "Base + bonus", "vs. OTE"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const tier    = getRowTier(r.attainment, cliff, accel);
                  const style   = ROW_STYLES[tier];
                  const rowBg   = style.bg === "#fff" && i % 2 === 1 ? OFFWHITE : style.bg;
                  return (
                    <tr
                      key={r.attainment}
                      style={{ background: rowBg }}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                        {r.attainment}%
                        {r.attainment === 100 && (
                          <span
                            className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wide"
                            style={{ background: BLUE, color: "#fff" }}
                          >
                            Target
                          </span>
                        )}
                        {tier === "accel" && (
                          <span
                            className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wide"
                            style={{ background: NAVY, color: MINT }}
                          >
                            Accel
                          </span>
                        )}
                        {tier === "below-cliff" && (
                          <span
                            className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wide"
                            style={{ background: "#A33222", color: "#fff" }}
                          >
                            Cliff
                          </span>
                        )}
                      </td>
                      {[r.monthlyBonus, r.quarterlyBonus, r.annualBonus, r.totalBonus].map((v, idx) => (
                        <td
                          key={idx}
                          className="px-4 py-2.5 font-semibold whitespace-nowrap"
                          style={{ color: style.isZero ? GREY_MID : style.bonusColor }}
                        >
                          {style.isZero ? "$0" : fmtCAD(v)}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                        {fmtCAD(r.baseBonus)}
                      </td>
                      <td
                        className="px-4 py-2.5 font-semibold whitespace-nowrap"
                        style={{
                          color: tier === "accel" ? NAVY : tier === "at-target" ? BLUE : tier === "below-cliff" ? GREY_MID : GREY_MID,
                        }}
                      >
                        {r.vsOTE.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className="px-5 py-2.5 border-t flex flex-wrap gap-5 text-[10px]"
            style={{ borderColor: SLATE, color: GREY_MID, background: OFFWHITE }}
          >
            <span>Updates live as plan inputs change</span>
            <span>·</span>
            <span>Cliff at {plan.cliffThreshold || 85}% · Accelerator at {plan.acceleratorThreshold || 110}% ({plan.acceleratorMultiplier || 2}× rate)</span>
            <span>·</span>
            <span>All figures CAD</span>
          </div>
        </div>

        {/* ── SECTION 3 — REP CALCULATOR ─────────────────────────────────────── */}
        <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
          <CardHeader>Rep Calculator — What did I earn this period?</CardHeader>
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Inputs */}
              <div className="space-y-4">
                <div
                  className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b"
                  style={{ color: NAVY, borderColor: SLATE }}
                >
                  Inputs
                </div>

                {/* Period type toggle */}
                <div>
                  <FieldLabel>Period Type</FieldLabel>
                  <div className="flex border" style={{ borderColor: SLATE }}>
                    {(["monthly", "quarterly", "annual"] as PeriodType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => { updateRep("periodType", t); updateRep("periodQuota", ""); }}
                        className="flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                        style={
                          rep.periodType === t
                            ? { background: NAVY, color: "#fff" }
                            : { background: "#fff", color: GREY_MID }
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>
                    Period Quota{" "}
                    <span className="normal-case font-normal tracking-normal text-[9px]" style={{ color: GREY_MID }}>
                      (default {fmtCAD(rep.periodType === "monthly" ? annualQuota / 12 : rep.periodType === "quarterly" ? annualQuota / 4 : annualQuota)})
                    </span>
                  </FieldLabel>
                  <TextInput
                    value={rep.periodQuota}
                    onChange={(v) => updateRep("periodQuota", v)}
                    prefix="CAD $"
                    type="number"
                    placeholder={String(Math.round(rep.periodType === "monthly" ? annualQuota / 12 : rep.periodType === "quarterly" ? annualQuota / 4 : annualQuota))}
                  />
                </div>

                <div>
                  <FieldLabel>Actual Orders / Revenue</FieldLabel>
                  <TextInput value={rep.actualOrders} onChange={(v) => updateRep("actualOrders", v)} prefix="CAD $" type="number" placeholder="0" />
                </div>

                <div>
                  <FieldLabel>Professional Services Collected <span className="normal-case font-normal tracking-normal text-[9px]">(optional)</span></FieldLabel>
                  <TextInput value={rep.psCollected} onChange={(v) => updateRep("psCollected", v)} prefix="CAD $" type="number" placeholder="0" />
                  {parseNum(rep.psCollected) > 0 && (
                    <p className="text-[10px] mt-1" style={{ color: GREY_MID }}>
                      PS commission at {plan.psRate || 4}%:{" "}
                      <span className="font-semibold" style={{ color: BLUE }}>{fmtCAD(psEarned)}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Outputs */}
              <div className="space-y-4">
                <div
                  className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b"
                  style={{ color: NAVY, borderColor: SLATE }}
                >
                  Earnings Breakdown
                </div>

                {/* Status badge */}
                <div
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold"
                  style={{ background: status.bg, color: status.fg }}
                >
                  {status.icon}
                  {status.label}
                </div>

                {/* Attainment + delta */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile
                    label={`Attainment (${rep.periodType})`}
                    value={`${(attainmentPct * 100).toFixed(1)}%`}
                    accent
                  />
                  <MetricTile
                    label={aboveBelow >= 0 ? "Above target" : "Below target"}
                    value={(aboveBelow >= 0 ? "+" : "") + fmtCAD(aboveBelow)}
                    accent
                  />
                </div>

                {/* Earnings grid */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile label={`Pro-rated base (${rep.periodType})`} value={fmtCAD(proRatedBase)} small />
                  <MetricTile label="Bonus earned this period" value={fmtCAD(periodBonus)} small />
                  {parseNum(rep.psCollected) > 0 && (
                    <MetricTile label="PS commission" value={fmtCAD(psEarned)} small />
                  )}
                </div>

                {/* Total earnings hero */}
                <div className="border-2 px-4 py-4" style={{ borderColor: BLUE, background: NAVY }}>
                  <div className="text-[9px] font-semibold uppercase tracking-widest text-white/50 mb-1">
                    Total period earnings — base + bonus + PS
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: BLUE }}>
                    {fmtCAD(totalPeriodEarnings)}
                  </div>
                </div>

                {rep.periodType !== "annual" && (
                  <p className="text-[10px] pt-1" style={{ color: GREY_MID }}>
                    Annualised run-rate:{" "}
                    <strong style={{ color: NAVY }}>
                      {fmtCAD(totalPeriodEarnings * (rep.periodType === "monthly" ? 12 : 4))}
                    </strong>{" "}
                    if this attainment is maintained all year
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center py-4 text-[10px]"
          style={{ color: GREY_MID, borderTop: `1px solid ${SLATE}` }}
        >
          Rhino Ventures · rhinovc.com · For informational purposes only. All figures in CAD.
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculator;
