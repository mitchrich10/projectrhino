import { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown,
  Minus, Download, ChevronDown, ChevronUp,
} from "lucide-react";
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
  const abs  = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) { const n = abs / 1e9;  return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}B`; }
  if (abs >= 1_000_000)     { const n = abs / 1e6;  return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`; }
  if (abs >= 1_000)         { const n = abs / 1e3;  return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}K`; }
  return `${sign}$${abs.toFixed(0)}`;
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanInputs {
  role: string; territory: string; planPeriod: string;
  annualQuota: string; baseSalary: string; targetBonus: string; equity: string;
  monthlyWeight: string; quarterlyWeight: string; annualWeight: string;
  cliffThreshold: string; acceleratorThreshold: string; acceleratorMultiplier: string;
  psRate: string;
}

const DEFAULT_PLAN: PlanInputs = {
  role: "", territory: "", planPeriod: "Calendar Year 2026",
  annualQuota:  "1000000",
  baseSalary:   "100000",
  targetBonus:  "100000",
  equity: "",
  monthlyWeight: "25", quarterlyWeight: "25", annualWeight: "50",
  cliffThreshold: "85", acceleratorThreshold: "110", acceleratorMultiplier: "2",
  psRate: "4",
};

type PeriodType = "monthly" | "quarterly" | "annual";

interface RepCalc {
  periodType: PeriodType;
  periodQuota: string; // "" = auto
  actualOrders: string;
  psCollected: string;
}

// ── Calculation helpers ───────────────────────────────────────────────────────
//
// calcAnnualTranche: returns the ANNUALISED value for one bonus tranche.
//   e.g. monthly tranche (w=0.25, target=$100K) at 100% attainment → $25K/yr
//
function calcAnnualTranche(tb: number, w: number, a: number, cliff: number, accel: number, mult: number): number {
  if (a < cliff) return 0;
  if (a >= accel) return tb * w * mult;
  return tb * w * a;
}

// ── Attainment ────────────────────────────────────────────────────────────────
interface AttainmentRow {
  attainment: number;
  // per-period amounts (what the rep receives each period)
  monthlyBonus: number;   // per month
  quarterlyBonus: number; // per quarter
  annualBonus: number;    // per year (the annual tranche itself)
  // annualised total: monthlyBonus×12 + quarterlyBonus×4 + annualBonus×1
  totalBonus: number;
  baseBonus: number;
  vsOTE: number;
}

/**
 * Returns exactly 5 attainment levels derived from the user's cliff and
 * accelerator thresholds:
 *   Row 1 — below cliff:  cliffPct - 10  (illustrates $0 zone)
 *   Row 2 — at cliff:     exactly cliffPct (first row that earns a bonus)
 *   Row 3 — at target:    exactly 100%
 *   Row 4 — at accel:     exactly accelPct (where multiplier kicks in)
 *   Row 5 — above accel:  accelPct + 15   (strong performance)
 *
 * All five values update immediately when the user changes any threshold.
 */
function getDynamicAttainmentLevels(cliffPct: number, accelPct: number): number[] {
  const belowCliff = Math.max(5, cliffPct - 10);
  const atCliff    = cliffPct;
  const atTarget   = 100;
  const atAccel    = accelPct;
  const aboveAccel = accelPct + 15;

  // Build ordered list, collapsing any accidental duplicates gracefully
  const ordered = [belowCliff, atCliff, atTarget, atAccel, aboveAccel];

  // Deduplicate while preserving order
  const seen = new Set<number>();
  const deduped: number[] = [];
  for (const v of ordered) {
    if (!seen.has(v)) { seen.add(v); deduped.push(v); }
  }

  // If we lost rows due to deduplication (e.g. cliff === 100 or accel === 100)
  // pad at the top end to always return 5 rows
  while (deduped.length < 5) {
    const last = deduped[deduped.length - 1];
    const next = last + 10;
    if (!seen.has(next)) { seen.add(next); deduped.push(next); }
    else deduped.push(last + deduped.length * 5);
  }

  return deduped.sort((a, b) => a - b);
}

function buildAttainmentRows(plan: PlanInputs, ote: number): AttainmentRow[] {
  const target   = parseNum(plan.targetBonus);
  const base     = parseNum(plan.baseSalary);
  const mw       = parseNum(plan.monthlyWeight) / 100;
  const qw       = parseNum(plan.quarterlyWeight) / 100;
  const aw       = parseNum(plan.annualWeight) / 100;
  const cliff    = parseNum(plan.cliffThreshold) / 100;
  const accel    = parseNum(plan.acceleratorThreshold) / 100;
  const mult     = parseNum(plan.acceleratorMultiplier);
  const cliffPct = parseNum(plan.cliffThreshold);
  const accelPct = parseNum(plan.acceleratorThreshold);

  const levels = getDynamicAttainmentLevels(cliffPct, accelPct);

  return levels.map((pct) => {
    const a = pct / 100;
    const annualMonthlyTranche   = calcAnnualTranche(target, mw, a, cliff, accel, mult);
    const annualQuarterlyTranche = calcAnnualTranche(target, qw, a, cliff, accel, mult);
    const annualBonus            = calcAnnualTranche(target, aw, a, cliff, accel, mult);
    const monthlyBonus   = annualMonthlyTranche / 12;
    const quarterlyBonus = annualQuarterlyTranche / 4;
    const totalBonus     = annualMonthlyTranche + annualQuarterlyTranche + annualBonus;
    const baseBonus      = base + totalBonus;
    const vsOTE          = ote > 0 ? (baseBonus / ote) * 100 : 0;
    return { attainment: pct, monthlyBonus, quarterlyBonus, annualBonus, totalBonus, baseBonus, vsOTE };
  });
}

type RowTier = "below-cliff" | "partial" | "at-target" | "accel";

function getRowTier(pct: number, cliff: number, accel: number): RowTier {
  const a = pct / 100;
  if (a < cliff) return "below-cliff";
  if (a >= accel) return "accel";
  if (a >= 1)   return "at-target";
  return "partial";
}

const ROW_STYLES: Record<RowTier, { bg: string; bonusColor: string; isZero: boolean }> = {
  "below-cliff": { bg: "#F4F4F4", bonusColor: GREY_MID, isZero: true  },
  "partial":     { bg: "#fff",    bonusColor: NAVY,      isZero: false },
  "at-target":   { bg: "#fff",    bonusColor: BLUE,      isZero: false },
  "accel":       { bg: MINT,      bonusColor: NAVY,      isZero: false },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
const CardHeader: FC<{ children: React.ReactNode; right?: React.ReactNode; toggle?: React.ReactNode }> = ({ children, right, toggle }) => (
  <div className="flex items-center justify-between px-5 py-3" style={{ background: NAVY }}>
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">{children}</span>
    <div className="flex items-center gap-3">
      {right && <span className="text-[10px] text-white/60">{right}</span>}
      {toggle}
    </div>
  </div>
);

const FieldLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: GREY_MID }}>
    {children}
  </label>
);

const TextInput: FC<{
  value: string; onChange: (v: string) => void;
  placeholder?: string; prefix?: string; suffix?: string; type?: string; disabled?: boolean;
}> = ({ value, onChange, placeholder, prefix, suffix, type = "text", disabled }) => (
  <div
    className="flex items-center h-9 text-sm border"
    style={{ borderColor: SLATE, background: disabled ? OFFWHITE : "#fff", opacity: disabled ? 0.55 : 1 }}
  >
    {prefix && (
      <span className="px-2.5 text-xs font-semibold h-full flex items-center border-r flex-shrink-0"
        style={{ color: GREY_MID, borderColor: SLATE, background: OFFWHITE }}>
        {prefix}
      </span>
    )}
    <input
      type={type} value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-2.5 bg-transparent outline-none text-sm"
      style={{ color: NAVY }}
    />
    {suffix && (
      <span className="px-2.5 text-xs font-semibold h-full flex items-center border-l flex-shrink-0"
        style={{ color: GREY_MID, borderColor: SLATE, background: OFFWHITE }}>
        {suffix}
      </span>
    )}
  </div>
);

const MetricTile: FC<{ label: string; value: string; accent?: boolean; navy?: boolean; small?: boolean }> = ({
  label, value, accent, navy, small,
}) => {
  const bg       = navy ? NAVY : accent ? OFFWHITE : "#fff";
  const valColor = navy ? "#fff" : accent ? BLUE : NAVY;
  const lblColor = navy ? "rgba(255,255,255,0.55)" : GREY_MID;
  return (
    <div className="border px-3 py-2.5" style={{ borderColor: SLATE, background: bg }}>
      <div className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: lblColor }}>{label}</div>
      <div className={`font-semibold ${small ? "text-sm" : "text-base"}`} style={{ color: valColor }}>{value}</div>
    </div>
  );
};

// ── Validation banner ─────────────────────────────────────────────────────────
const InlineWarn: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 border"
    style={{ background: "#FFF0F0", borderColor: "#C0392B", color: "#C0392B" }}>
    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
    {children}
  </div>
);

const BlockedOverlay: FC<{ message: string }> = ({ message }) => (
  <div className="relative">
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
      style={{ background: "rgba(244,247,250,0.85)" }}>
      <AlertTriangle className="w-5 h-5" style={{ color: "#C0392B" }} />
      <span className="text-xs font-semibold text-center px-4" style={{ color: "#C0392B" }}>{message}</span>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const CommissionCalculator: FC = () => {
  const [plan, setPlan]       = useState<PlanInputs>(DEFAULT_PLAN);
  const [rep,  setRep]        = useState<RepCalc>({ periodType: "monthly", periodQuota: "", actualOrders: "90000", psCollected: "" });
  const [planOpen, setPlanOpen] = useState(true);

  const updatePlan = (field: keyof PlanInputs, value: string) => setPlan((p) => ({ ...p, [field]: value }));
  const updateRep  = (field: keyof RepCalc,  value: string | PeriodType) => setRep((r) => ({ ...r, [field]: value }));

  // ── Derived plan
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
  const quotaOk     = annualQuota > 0;
  const calcReady   = weightsOk && quotaOk;
  const cliff       = parseNum(plan.cliffThreshold) / 100;
  const accel       = parseNum(plan.acceleratorThreshold) / 100;
  const mult        = parseNum(plan.acceleratorMultiplier);
  const psRate      = parseNum(plan.psRate) / 100;

  const rows = useMemo(() => buildAttainmentRows(plan, ote), [plan, ote]);

  // ── Rep calc
  // Auto-recalculate period quota when period type changes (unless manually overridden)
  const autoPeriodQuota = useMemo(() => {
    if (rep.periodType === "monthly")   return annualQuota / 12;
    if (rep.periodType === "quarterly") return annualQuota / 4;
    return annualQuota;
  }, [rep.periodType, annualQuota]);

  const periodQuota   = rep.periodQuota ? parseNum(rep.periodQuota) : autoPeriodQuota;
  const actual        = parseNum(rep.actualOrders);
  const attainmentPct = periodQuota > 0 ? actual / periodQuota : 0;

  // Closest attainment row highlight
  const highlightRow = useMemo(() => {
    if (!calcReady || actual === 0) return null;
    const repPct = attainmentPct * 100;
    const levels = rows.map((r) => r.attainment);
    return levels.reduce((best, lvl) =>
      Math.abs(lvl - repPct) < Math.abs(best - repPct) ? lvl : best
    , levels[0]);
  }, [attainmentPct, calcReady, actual, rows]);

  const periodBonus = useMemo(() => {
    // Per-period bonus: annualise the tranche then divide by periods
    const annualTranche = (w: number) => calcAnnualTranche(targetBonus, w, attainmentPct, cliff, accel, mult);
    if (rep.periodType === "monthly")   return annualTranche(mw / 100) / 12;
    if (rep.periodType === "quarterly") return annualTranche(qw / 100) / 4;
    return annualTranche(aw / 100); // annual period — full year tranche
  }, [rep.periodType, targetBonus, mw, qw, aw, attainmentPct, cliff, accel, mult]);

  const psEarned           = parseNum(rep.psCollected) * psRate;
  const proRatedBase       = rep.periodType === "monthly" ? base / 12 : rep.periodType === "quarterly" ? base / 4 : base;
  const totalPeriodEarnings = proRatedBase + periodBonus + psEarned;
  const aboveBelow         = actual - periodQuota;

  type StatusKey = "cliff" | "partial" | "target" | "accel";
  const statusKey: StatusKey = attainmentPct < cliff ? "cliff"
    : attainmentPct >= accel ? "accel"
    : attainmentPct >= 1 ? "target"
    : "partial";

  const STATUS_CONFIG: Record<StatusKey, { label: string; icon: React.ReactNode; bg: string; fg: string }> = {
    cliff:   { label: "Below cliff — no bonus",                      icon: <TrendingDown className="w-4 h-4" />, bg: "#A33222", fg: "#fff" },
    partial: { label: "Below target — partial bonus",                icon: <Minus        className="w-4 h-4" />, bg: "#F5A623", fg: "#fff" },
    target:  { label: "At or above target",                          icon: <TrendingUp   className="w-4 h-4" />, bg: BLUE,      fg: "#fff" },
    accel:   { label: `Above accelerator threshold — ${mult}x rate`, icon: <TrendingUp   className="w-4 h-4" />, bg: MINT,      fg: NAVY   },
  };
  const status = STATUS_CONFIG[statusKey];

  const handleDownload = () => {
    const statusLabels: Record<string, string> = {
      cliff: "Below cliff — no bonus", partial: "Below target — partial bonus",
      target: "At or above target", accel: `Above accelerator threshold — ${mult}x rate`,
    };
    downloadCommissionXLSX(plan, rows, {
      periodType: rep.periodType, periodQuota, actual, attainmentPct, periodBonus,
      psCollected: parseNum(rep.psCollected), psEarned, proRatedBase,
      totalPeriodEarnings, aboveBelow, statusLabel: statusLabels[statusKey],
      annualisedRunRate: totalPeriodEarnings * (rep.periodType === "monthly" ? 12 : rep.periodType === "quarterly" ? 4 : 1),
      psRate: parseNum(plan.psRate),
    });
  };

  const blockedMsg = !quotaOk
    ? "Annual quota is required to calculate commissions."
    : !weightsOk
    ? `Bonus weights must sum to 100% (currently ${weightsSum.toFixed(0)}%).`
    : "";

  return (
    <div className="min-h-screen" style={{ background: OFFWHITE, fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* ── Top header ──────────────────────────────────────────────────────── */}
      <header className="border-b" style={{ background: "#fff", borderColor: SLATE }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="transition-opacity hover:opacity-70 flex-shrink-0" style={{ color: NAVY }}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-5 w-px flex-shrink-0" style={{ background: SLATE }} />
            <span className="text-sm font-semibold uppercase tracking-[0.22em] truncate" style={{ color: NAVY }}>
              Rhino Ventures
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block" style={{ color: GREY_MID }}>
            Commission Calculator
          </span>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-opacity hover:opacity-90 active:opacity-75 flex-shrink-0"
            style={{ background: BLUE, color: "#fff" }}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-5">

        {/* ── SECTION 1 — PLAN INPUTS ─────────────────────────────────────────── */}
        <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
          <CardHeader
            toggle={
              <button onClick={() => setPlanOpen(!planOpen)} className="text-white/60 hover:text-white transition-colors">
                {planOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            }
          >
            Plan Inputs
          </CardHeader>

          {planOpen && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
              style={{ borderColor: SLATE }}
            >

              {/* Col 1 — Rep Details */}
              <div className="p-5 space-y-3 border-b lg:border-b-0 lg:border-r" style={{ borderColor: SLATE }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: NAVY, borderColor: SLATE }}>
                  Rep Details
                </div>
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
                  {!quotaOk && <div className="mt-1.5"><InlineWarn>Annual quota is required.</InlineWarn></div>}
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

                {/* OTE summary box */}
                <div className="border-t pt-3 space-y-1.5" style={{ borderColor: SLATE }}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: GREY_MID }}>
                    Package Summary
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: GREY_MID }}>
                    <span>Base</span>
                    <span style={{ color: NAVY }}>{fmtCAD(base)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: GREY_MID }}>
                    <span>+ Target bonus</span>
                    <span style={{ color: NAVY }}>{fmtCAD(targetBonus)}</span>
                  </div>
                  <div
                    className="flex justify-between items-center border-t pt-2 mt-1"
                    style={{ borderColor: SLATE }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: GREY_MID }}>
                      = OTE at 100%
                    </span>
                    <span className="text-xl font-semibold" style={{ color: BLUE }}>{fmtCAD(ote)}</span>
                  </div>
                  {equity > 0 && (
                    <>
                      <div className="flex justify-between text-sm" style={{ color: GREY_MID }}>
                        <span>+ Equity</span>
                        <span style={{ color: NAVY }}>{fmtCAD(equity)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold" style={{ color: NAVY }}>
                        <span>= Total package</span>
                        <span>{fmtCAD(totalPkg)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Col 2 — Bonus Structure */}
              <div className="p-5 space-y-4 border-b lg:border-b-0 lg:border-r" style={{ borderColor: SLATE }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: NAVY, borderColor: SLATE }}>
                  Bonus Structure
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: GREY_MID }}>
                    Weights — must sum to 100%
                  </div>
                  <div className="grid grid-cols-3 gap-2">
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
                    <div className="mt-2">
                      <InlineWarn>
                        Weights must sum to 100% — currently {weightsSum.toFixed(0)}%
                      </InlineWarn>
                    </div>
                  )}
                </div>
                {weightsOk && (
                  <div className="grid grid-cols-2 gap-2">
                  <MetricTile label="Monthly bonus (per mo.)" value={fmtCAD(targetBonus * mw / 100 / 12)} small />
                  <MetricTile label="Quarterly bonus (per qtr)" value={fmtCAD(targetBonus * qw / 100 / 4)} small />
                  <MetricTile label="Annual tranche" value={fmtCAD(targetBonus * aw / 100)} small />
                  <MetricTile label="Total annual bonus" value={fmtCAD(targetBonus)} small />
                  </div>
                )}
              </div>

              {/* Col 3 — Cliff & Accelerator */}
              <div className="p-5 space-y-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: NAVY, borderColor: SLATE }}>
                  Cliff & Accelerator
                </div>
                <div>
                  <FieldLabel>Cliff Threshold — no bonus below</FieldLabel>
                  <TextInput value={plan.cliffThreshold} onChange={(v) => updatePlan("cliffThreshold", v)} suffix="%" type="number" />
                  <p className="text-[10px] mt-1" style={{ color: GREY_MID }}>Reps below {plan.cliffThreshold || "85"}% earn $0 bonus</p>
                </div>
                <div>
                  <FieldLabel>Accelerator Threshold</FieldLabel>
                  <TextInput value={plan.acceleratorThreshold} onChange={(v) => updatePlan("acceleratorThreshold", v)} suffix="%" type="number" />
                </div>
                <div>
                  <FieldLabel>Accelerator Multiplier</FieldLabel>
                  <TextInput value={plan.acceleratorMultiplier} onChange={(v) => updatePlan("acceleratorMultiplier", v)} suffix="x" type="number" />
                </div>
                <div className="pt-2 border-t" style={{ borderColor: SLATE }}>
                  <FieldLabel>PS Commission Rate</FieldLabel>
                  <TextInput value={plan.psRate} onChange={(v) => updatePlan("psRate", v)} suffix="%" type="number" />
                </div>
                <div className="pt-2 border-t space-y-1.5" style={{ borderColor: SLATE }}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: GREY_MID }}>Row colour key</div>
                  {[
                    { bg: "#F4F4F4", label: "Below cliff — no bonus" },
                    { bg: "#fff",    label: "Partial / at-target (blue text)" },
                    { bg: MINT,      label: "Above accelerator — exceptional" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[10px]">
                      <span className="inline-block w-4 h-3 border flex-shrink-0" style={{ background: item.bg, borderColor: SLATE }} />
                      <span style={{ color: GREY_MID }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 2 — ATTAINMENT TABLE ────────────────────────────────────── */}
        <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
          <CardHeader
            right={plan.role
              ? `${plan.role}${plan.territory ? ` · ${plan.territory}` : ""}${plan.planPeriod ? ` · ${plan.planPeriod}` : ""}`
              : plan.planPeriod || undefined}
          >
            Attainment Table — Key Scenarios
          </CardHeader>

          {!calcReady ? (
            <div className="px-5 py-8 flex flex-col items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: "#C0392B" }} />
              <p className="text-sm font-semibold text-center" style={{ color: "#C0392B" }}>{blockedMsg}</p>
              <p className="text-xs text-center" style={{ color: GREY_MID }}>Fix the plan inputs above to enable calculations.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[680px]">
                  <thead>
                    <tr style={{ background: NAVY }}>
                      {[
                        { label: "Attainment",            sub: "" },
                        { label: "Monthly Bonus",         sub: "per month" },
                        { label: "Quarterly Bonus",       sub: "per quarter" },
                        { label: "Annual Bonus",          sub: "annual tranche" },
                        { label: "Total Bonus (Ann.)",    sub: "mo×12 + qtr×4 + ann" },
                        { label: "Base + Total Bonus",    sub: "annualised" },
                        { label: "vs. OTE",               sub: "% of OTE" },
                      ].map(({ label, sub }) => (
                        <th key={label} className="px-4 py-2 text-left whitespace-nowrap"
                          style={{ color: "rgba(255,255,255,0.85)" }}>
                          <div className="text-[10px] font-semibold uppercase tracking-widest">{label}</div>
                          {sub && <div className="text-[9px] font-normal normal-case tracking-normal opacity-60 mt-0.5">{sub}</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const tier     = getRowTier(r.attainment, cliff, accel);
                      const rs       = ROW_STYLES[tier];
                      const rowBg    = rs.bg === "#fff" && i % 2 === 1 ? OFFWHITE : rs.bg;
                      const isHighlight = r.attainment === highlightRow;
                      return (
                        <tr
                          key={r.attainment}
                          style={{
                            background: rowBg,
                            borderLeft: isHighlight ? `3px solid ${BLUE}` : "3px solid transparent",
                          }}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                            {r.attainment}%
                            {isHighlight && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold" style={{ background: BLUE, color: "#fff" }}>
                                ← You
                              </span>
                            )}
                            {r.attainment === 100 && !isHighlight && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wide" style={{ background: BLUE, color: "#fff" }}>
                                Target
                              </span>
                            )}
                            {tier === "accel" && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wide" style={{ background: NAVY, color: MINT }}>
                                Accel
                              </span>
                            )}
                            {tier === "below-cliff" && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 font-semibold uppercase tracking-wide" style={{ background: "#A33222", color: "#fff" }}>
                                Cliff
                              </span>
                            )}
                          </td>
                          {[r.monthlyBonus, r.quarterlyBonus, r.annualBonus, r.totalBonus].map((v, idx) => (
                            <td key={idx} className="px-4 py-2.5 font-semibold whitespace-nowrap"
                              style={{ color: rs.isZero ? GREY_MID : rs.bonusColor }}>
                              {rs.isZero ? "$0" : fmtCAD(v)}
                            </td>
                          ))}
                          <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                            {fmtCAD(r.baseBonus)}
                          </td>
                          <td className="px-4 py-2.5 font-semibold whitespace-nowrap"
                            style={{ color: tier === "accel" ? NAVY : tier === "at-target" ? BLUE : GREY_MID }}>
                            {r.vsOTE.toFixed(0)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2.5 border-t flex flex-wrap gap-4 text-[10px]"
                style={{ borderColor: SLATE, color: GREY_MID, background: OFFWHITE }}>
                <span>Monthly/Quarterly columns show <strong style={{color:NAVY}}>per-period payouts</strong></span>
                <span>·</span>
                <span>Total Bonus = mo×12 + qtr×4 + annual</span>
                <span>·</span>
                <span>Rows snap to your cliff ({plan.cliffThreshold || 85}%) &amp; accelerator ({plan.acceleratorThreshold || 110}%, {plan.acceleratorMultiplier || 2}× rate) thresholds</span>
                {highlightRow && <span>· Your position: ~{highlightRow}% highlighted</span>}
              </div>
            </>
          )}
        </div>

        {/* ── SECTION 3 — REP CALCULATOR ──────────────────────────────────────── */}
        <div className="border" style={{ borderColor: SLATE, background: "#fff" }}>
          <CardHeader>Rep Calculator — What did I earn this period?</CardHeader>
          <div className="p-5">
            {!calcReady ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <AlertTriangle className="w-5 h-5" style={{ color: "#C0392B" }} />
                <p className="text-sm font-semibold text-center" style={{ color: "#C0392B" }}>{blockedMsg}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: NAVY, borderColor: SLATE }}>
                    Inputs
                  </div>

                  <div>
                    <FieldLabel>Period Type</FieldLabel>
                    <div className="flex border" style={{ borderColor: SLATE }}>
                      {(["monthly", "quarterly", "annual"] as PeriodType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => { updateRep("periodType", t); updateRep("periodQuota", ""); }}
                          className="flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                          style={rep.periodType === t ? { background: NAVY, color: "#fff" } : { background: "#fff", color: GREY_MID }}
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
                        (auto: {fmtCAD(autoPeriodQuota)}{rep.periodQuota ? " — overridden" : ""})
                      </span>
                    </FieldLabel>
                    <TextInput
                      value={rep.periodQuota}
                      onChange={(v) => updateRep("periodQuota", v)}
                      prefix="CAD $"
                      type="number"
                      placeholder={String(Math.round(autoPeriodQuota))}
                    />
                    {rep.periodQuota && (
                      <button
                        className="text-[10px] mt-1 underline"
                        style={{ color: BLUE }}
                        onClick={() => updateRep("periodQuota", "")}
                      >
                        Reset to auto ({fmtCAD(autoPeriodQuota)})
                      </button>
                    )}
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
                  <div className="text-[10px] font-semibold uppercase tracking-widest pb-2 border-b" style={{ color: NAVY, borderColor: SLATE }}>
                    Earnings Breakdown
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold"
                    style={{ background: status.bg, color: status.fg }}>
                    {status.icon}
                    {status.label}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetricTile label={`Attainment (${rep.periodType})`} value={`${(attainmentPct * 100).toFixed(1)}%`} accent />
                    <MetricTile
                      label={aboveBelow >= 0 ? "Above target" : "Below target"}
                      value={(aboveBelow >= 0 ? "+" : "") + fmtCAD(aboveBelow)}
                      accent
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetricTile label={`Pro-rated base (${rep.periodType})`} value={fmtCAD(proRatedBase)} small />
                    <MetricTile label="Bonus earned this period" value={fmtCAD(periodBonus)} small />
                    {parseNum(rep.psCollected) > 0 && (
                      <MetricTile label="PS commission" value={fmtCAD(psEarned)} small />
                    )}
                  </div>

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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-[10px]" style={{ color: GREY_MID, borderTop: `1px solid ${SLATE}` }}>
          Rhino Ventures · rhinovc.com · For informational purposes only. All figures in CAD.
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculator;
