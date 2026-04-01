import { FC, useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon, ChevronDown, ChevronUp, Info, Plus, Trash2, RotateCcw, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Grant {
  id: string;
  label: string;
  totalOptions: string;
  strikePrice: string;
  fullyDiluted: string;
  grantDate: string;
  vestYears: number;
  cliffMonths: number;
}

interface VestedResult {
  count: number;
  pct: number;
  status: "pre-cliff" | "vesting" | "fully-vested";
  cliffDate: string;
  fullyVestedDate: string;
}

// Scenario row — all rows are fully editable
interface ScenarioRow {
  id: string;
  label: string;
  /** Raw numeric valuation (user-entered or auto-calculated) */
  rawValue: number;
  /** If true, this row was manually pinned by the user and won't auto-update */
  pinned: boolean;
}

interface PerGrantScenario {
  grantId: string;
  label: string;
  strike: number;
  gainPerOption: number;
  vestedValue: number;
  fullGrantValue: number;
  totalGrant: number;
  vestedCount: number;
}

interface ComputedScenario extends ScenarioRow {
  impliedSharePrice: number;
  perGrant: PerGrantScenario[];
  totalVestedValue: number;
  totalFullGrantValue: number;
  weightedGainPerOption: number;
  multiple: number;
}

// ── Brand colours ─────────────────────────────────────────────────────────────

const NAVY     = "#173660";
const BLUE     = "#1A7EC8";
const SLATE    = "#CDD8E3";
const OFFWHITE = "#F4F7FA";
const MUTED    = "#5C6B7A";
const RED_ERR  = "#C0392B";

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function addMonthsDisplay(dateStr: string, months: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function diffMonthsFloat(a: string, b: string): number {
  if (!a || !b) return 0;
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return (db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

function calcVestedForGrant(
  totalOptions: number,
  grantDateStr: string,
  todayStr: string,
  vestYears: number,
  cliffMonths: number,
): VestedResult {
  const vestMonths = vestYears * 12;
  const cliffDate = addMonthsDisplay(grantDateStr, cliffMonths);
  const fullyVestedDate = addMonthsDisplay(grantDateStr, vestMonths);

  if (!grantDateStr || !todayStr || totalOptions <= 0)
    return { count: 0, pct: 0, status: "pre-cliff", cliffDate, fullyVestedDate };

  const diff = diffMonthsFloat(grantDateStr, todayStr);

  if (diff >= vestMonths)
    return { count: totalOptions, pct: 100, status: "fully-vested", cliffDate, fullyVestedDate };

  if (cliffMonths === 0) {
    const count = Math.floor(Math.min(diff / vestMonths, 1) * totalOptions);
    return { count, pct: (count / totalOptions) * 100, status: "vesting", cliffDate, fullyVestedDate };
  }

  if (diff < cliffMonths)
    return { count: 0, pct: 0, status: "pre-cliff", cliffDate, fullyVestedDate };

  const cliffCount = Math.round(totalOptions * (cliffMonths / vestMonths));
  const remaining = totalOptions - cliffCount;
  const remainingMonths = vestMonths - cliffMonths;
  const afterCliff = Math.floor(diff - cliffMonths);
  const count = Math.floor(cliffCount + Math.min(afterCliff * (remaining / remainingMonths), remaining));
  return { count, pct: (count / totalOptions) * 100, status: "vesting", cliffDate, fullyVestedDate };
}

// ── Formatting ────────────────────────────────────────────────────────────────

function fmtValuation(n: number): string {
  if (!n || n <= 0) return "$0";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v < 100 && v % 1 !== 0 ? v.toFixed(1) : v.toFixed(0)}M`;
  }
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtLargeCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v < 100 && v % 1 !== 0 ? v.toFixed(1) : v.toFixed(0)}M`;
  }
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(n);
}

function fmtCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(n);
}

function fmtMultiple(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  return `${n.toFixed(2)}x`;
}

// ── Scenario defaults factory ─────────────────────────────────────────────────

function makeDefaultScenarios(baseVal: number): ScenarioRow[] {
  return [
    { id: `s_${Date.now()}_1`, label: "Down Round",   rawValue: Math.round(baseVal * 0.5), pinned: false },
    { id: `s_${Date.now()}_2`, label: "Base Case",    rawValue: Math.round(baseVal),        pinned: false },
    { id: `s_${Date.now()}_3`, label: "Strong Exit",  rawValue: Math.round(baseVal * 5),    pinned: false },
  ];
}

let _grantCounter = 1;
function newGrantId() { return `g_${_grantCounter++}_${Date.now()}`; }

function makeDefaultGrant(overrides?: Partial<Grant>): Grant {
  return {
    id: newGrantId(),
    label: "",
    totalOptions: "1000",
    strikePrice: "10",
    fullyDiluted: "10000000",
    grantDate: monthsAgo(18),
    vestYears: 5,
    cliffMonths: 24,
    ...overrides,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

const FieldLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ color: MUTED }} className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest mb-1">
    {children}
  </label>
);

const FieldInput: FC<{
  value: string;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
  placeholder?: string;
  readOnly?: boolean;
  hasError?: boolean;
}> = ({ value, onChange, type = "number", prefix, placeholder = "0", readOnly, hasError }) => (
  <div
    className="flex items-center rounded transition-colors"
    style={{ border: `1px solid ${hasError ? RED_ERR : SLATE}`, background: readOnly ? OFFWHITE : "#fff" }}
  >
    {prefix && <span className="pl-3 text-sm select-none" style={{ color: MUTED }}>{prefix}</span>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none min-w-0"
      style={{ color: NAVY, cursor: readOnly ? "default" : "text" }}
    />
  </div>
);

const SelectField: FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded px-3 py-2.5 text-sm outline-none appearance-none"
    style={{ border: `1px solid ${SLATE}`, background: "#fff", color: NAVY, cursor: "pointer" }}
  >
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const DatePickerField: FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const selected = value ? new Date(value + "T12:00:00") : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center gap-2 rounded px-3 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
          style={{ border: `1px solid ${SLATE}`, background: "#fff", color: selected ? NAVY : MUTED }}
        >
          <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTED }} />
          <span>{selected ? format(selected, "MMM d, yyyy") : "Pick a date"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && onChange(date.toISOString().slice(0, 10))}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

const TooltipComp: FC<{ text: string }> = ({ text }) => (
  <span className="group relative ml-1 inline-flex align-middle">
    <Info className="w-3 h-3 inline cursor-help" style={{ color: MUTED }} />
    <span
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-5 w-56 rounded text-[10px] px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 leading-snug text-center"
      style={{ background: NAVY, color: "#fff" }}
    >
      {text}
    </span>
  </span>
);

// ── ValuationCell — editable with M/B display on blur ─────────────────────────

const ValuationCell: FC<{
  rawValue: number;
  pinned: boolean;
  onChange: (v: number, pin: boolean) => void;
}> = ({ rawValue, pinned, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setDraft(rawValue > 0 ? String(rawValue) : "");
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setEditing(false);
    const n = parseFloat(draft.replace(/[^0-9.]/g, ""));
    if (isFinite(n) && n > 0 && n !== rawValue) {
      onChange(n, true); // pin on manual edit
    } else if (!isFinite(n) || n <= 0) {
      // leave unchanged
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); }
    if (e.key === "Escape") { setEditing(false); setDraft(""); }
  };

  return (
    <div
      className="relative flex items-center rounded px-2 py-1.5 cursor-text transition-all"
      style={{
        background: pinned ? "#FFFACD" : "#fff",
        border: `1px solid ${pinned ? "#E8C43A" : SLATE}`,
        minWidth: 100,
      }}
      onClick={() => { if (!editing) { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); } }}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-transparent outline-none text-sm font-mono"
          style={{ color: NAVY }}
          placeholder="Enter amount"
        />
      ) : (
        <span
          className="text-sm font-mono select-none w-full"
          style={{ color: NAVY }}
          onFocus={handleFocus}
          tabIndex={0}
        >
          {rawValue > 0 ? fmtValuation(rawValue) : <span style={{ color: MUTED, fontStyle: "italic" }}>Enter $</span>}
        </span>
      )}
      {pinned && (
        <span
          className="absolute -top-1.5 -right-1 text-[7px] font-bold uppercase tracking-widest px-0.5 rounded"
          style={{ background: "#E8C43A", color: "#7A5800" }}
          title="Manually set — won't auto-update"
        >
          ✎
        </span>
      )}
    </div>
  );
};

// ── InlineLabel — click to edit ───────────────────────────────────────────────

const InlineLabel: FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(value);
  };

  return editing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
      autoFocus
      className="bg-transparent outline-none border-b text-sm font-semibold w-32"
      style={{ color: NAVY, borderColor: BLUE }}
    />
  ) : (
    <span
      className="text-sm font-semibold cursor-pointer hover:underline decoration-dotted underline-offset-2"
      style={{ color: NAVY }}
      title="Click to rename"
      onClick={() => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.select(), 0); }}
    >
      {value}
    </span>
  );
};

// ── Grant Card ────────────────────────────────────────────────────────────────

const GrantCard: FC<{
  grant: Grant;
  index: number;
  isExpanded: boolean;
  vestedInfo: VestedResult;
  onToggle: () => void;
  onChange: (updates: Partial<Grant>) => void;
  onDelete: () => void;
  canDelete: boolean;
}> = ({ grant, index, isExpanded, vestedInfo, onToggle, onChange, onDelete, canDelete }) => {
  const strike = parseFloat(grant.strikePrice) || 0;
  const total = parseFloat(grant.totalOptions) || 0;
  const grantLabel = grant.label || `Grant ${index}`;

  const summaryDate = grant.grantDate
    ? format(new Date(grant.grantDate + "T12:00:00"), "MMM yyyy")
    : "No date";
  const summaryText = `${total > 0 ? total.toLocaleString() : "—"} options @ ${strike > 0 ? `$${strike.toFixed(2)}` : "—"} · ${summaryDate}`;

  const vestingBadge = (() => {
    if (vestedInfo.status === "pre-cliff")
      return { text: "Pre-cliff", bg: "#FEF3C7", color: "#92400E" };
    if (vestedInfo.status === "fully-vested")
      return { text: "Fully vested", bg: "#D6F0E0", color: "#1A6B3C" };
    return { text: `${vestedInfo.pct.toFixed(0)}% vested`, bg: `${BLUE}18`, color: BLUE };
  })();

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${SLATE}`, boxShadow: isExpanded ? `0 0 0 2px ${BLUE}30` : "none" }}>
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ background: isExpanded ? NAVY : "#fff" }}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: isExpanded ? "rgba(255,255,255,0.5)" : MUTED }}>
            Grant {index}
          </span>
          <span className="font-semibold text-sm truncate" style={{ color: isExpanded ? "#fff" : NAVY }}>
            {grantLabel}
          </span>
          <span className="text-xs hidden sm:block flex-shrink-0" style={{ color: isExpanded ? "rgba(255,255,255,0.65)" : MUTED }}>
            {summaryText}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: isExpanded ? "rgba(255,255,255,0.15)" : vestingBadge.bg, color: isExpanded ? "rgba(255,255,255,0.8)" : vestingBadge.color }}
          >
            {vestingBadge.text}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {canDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: isExpanded ? "rgba(255,255,255,0.6)" : RED_ERR }}
              title="Delete grant"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {isExpanded
            ? <ChevronUp className="w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
            : <ChevronDown className="w-4 h-4" style={{ color: MUTED }} />
          }
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5" style={{ background: "#fff", borderTop: `1px solid ${SLATE}` }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Grant Name / Label</FieldLabel>
              <FieldInput
                value={grant.label}
                onChange={(v) => onChange({ label: v })}
                type="text"
                placeholder="e.g. Initial Grant"
              />
            </div>
            <div>
              <FieldLabel>Options Granted</FieldLabel>
              <FieldInput value={grant.totalOptions} onChange={(v) => onChange({ totalOptions: v })} placeholder="e.g. 1,000" />
            </div>
            <div>
              <FieldLabel>Strike Price (CAD $)</FieldLabel>
              <FieldInput
                value={grant.strikePrice}
                onChange={(v) => onChange({ strikePrice: v })}
                prefix="$"
                placeholder="e.g. 10.00"
                hasError={grant.strikePrice !== "" && parseFloat(grant.strikePrice) <= 0}
              />
              {grant.strikePrice !== "" && parseFloat(grant.strikePrice) <= 0 && (
                <p className="text-[10px] mt-1" style={{ color: RED_ERR }}>Must be greater than 0</p>
              )}
            </div>
            <div>
              <FieldLabel>
                Diluted Shares at Grant
                <TooltipComp text="Fully diluted shares when this grant was issued — used to show your ownership % at time of grant." />
              </FieldLabel>
              <FieldInput value={grant.fullyDiluted} onChange={(v) => onChange({ fullyDiluted: v })} placeholder="e.g. 10,000,000" />
            </div>
            <div>
              <FieldLabel>Grant Date</FieldLabel>
              <DatePickerField value={grant.grantDate} onChange={(v) => onChange({ grantDate: v })} />
            </div>
            <div>
              <FieldLabel>Total Vest Period</FieldLabel>
              <SelectField
                value={grant.vestYears.toString()}
                onChange={(v) => onChange({ vestYears: parseInt(v) })}
                options={[
                  { value: "2", label: "2 years" },
                  { value: "3", label: "3 years" },
                  { value: "4", label: "4 years" },
                  { value: "5", label: "5 years" },
                ]}
              />
            </div>
            <div>
              <FieldLabel>Cliff</FieldLabel>
              <SelectField
                value={grant.cliffMonths.toString()}
                onChange={(v) => onChange({ cliffMonths: parseInt(v) })}
                options={[
                  { value: "0",  label: "No cliff (linear)" },
                  { value: "6",  label: "6-month cliff" },
                  { value: "12", label: "12-month cliff" },
                  { value: "18", label: "18-month cliff" },
                  { value: "24", label: "24-month cliff" },
                ]}
              />
            </div>
          </div>

          <div className="mt-4 rounded p-3 flex flex-wrap gap-x-6 gap-y-1 text-xs" style={{ background: OFFWHITE, border: `1px solid ${SLATE}` }}>
            {vestedInfo.status === "pre-cliff" ? (
              <span style={{ color: "#92400E", fontWeight: 500 }}>
                ⚠ Cliff not yet reached — vesting begins {vestedInfo.cliffDate}
              </span>
            ) : (
              <span>
                <span style={{ color: MUTED }}>Vested today: </span>
                <span className="font-bold" style={{ color: NAVY }}>{vestedInfo.count.toLocaleString()}</span>
                <span style={{ color: MUTED }}> / {total > 0 ? total.toLocaleString() : "—"} ({vestedInfo.pct.toFixed(1)}%)</span>
              </span>
            )}
            {vestedInfo.cliffDate && vestedInfo.status !== "pre-cliff" && grant.cliffMonths !== 0 && (
              <span><span style={{ color: MUTED }}>Cliff: </span><span style={{ color: NAVY }}>{vestedInfo.cliffDate}</span></span>
            )}
            {vestedInfo.fullyVestedDate && vestedInfo.status !== "fully-vested" && (
              <span><span style={{ color: MUTED }}>Fully vested: </span><span style={{ color: NAVY }}>{vestedInfo.fullyVestedDate}</span></span>
            )}
            {vestedInfo.status === "fully-vested" && (
              <span style={{ color: "#1A6B3C", fontWeight: 600 }}>✓ Fully vested</span>
            )}
            {grant.fullyDiluted && parseFloat(grant.fullyDiluted) > 0 && total > 0 && (
              <span>
                <span style={{ color: MUTED }}>Ownership at grant: </span>
                <span style={{ color: NAVY }}>{((total / parseFloat(grant.fullyDiluted)) * 100).toFixed(4)}%</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type VestedResultExt = VestedResult & { cliffMonths: number };

// ── Main Component ────────────────────────────────────────────────────────────

const INITIAL_BASE_VAL = 10 * 10_000_000; // default strike × default diluted

const OptionModeller: FC = () => {
  const [grants, setGrants] = useState<Grant[]>([makeDefaultGrant({ id: "g_initial" })]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["g_initial"]));
  const [globalDiluted, setGlobalDiluted] = useState("10000000");
  const [todayDate] = useState(today());
  const [exporting, setExporting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Scenarios — dynamic, all editable
  const [scenarios, setScenarios] = useState<ScenarioRow[]>(() =>
    makeDefaultScenarios(INITIAL_BASE_VAL)
  );

  // ── Grant mutations ──
  const addGrant = () => {
    const newGrant = makeDefaultGrant();
    setGrants((prev) => [...prev, newGrant]);
    setExpandedIds((prev) => new Set([...prev, newGrant.id]));
  };

  const updateGrant = (id: string, updates: Partial<Grant>) =>
    setGrants((prev) => prev.map((g) => g.id === id ? { ...g, ...updates } : g));

  const deleteGrant = (id: string) => {
    setGrants((prev) => prev.filter((g) => g.id !== id));
    setExpandedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  // ── Scenario mutations ──
  const addScenario = () => {
    if (scenarios.length >= 4) return;
    setScenarios((prev) => [
      ...prev,
      { id: `s_${Date.now()}`, label: `Scenario ${prev.length + 1}`, rawValue: 0, pinned: false },
    ]);
  };

  const deleteScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const updateScenarioLabel = (id: string, label: string) =>
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, label } : s));

  const updateScenarioValue = (id: string, rawValue: number, pinned: boolean) =>
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, rawValue, pinned } : s));

  const resetToDefaults = useCallback((baseVal: number) => {
    setScenarios(makeDefaultScenarios(baseVal));
    setShowResetConfirm(false);
  }, []);

  // ── Derived per-grant ──
  const grantCalcs = useMemo(() =>
    grants.map((g) => {
      const total = parseFloat(g.totalOptions) || 0;
      const strike = parseFloat(g.strikePrice) || 0;
      const vestedInfo: VestedResultExt = {
        ...calcVestedForGrant(total, g.grantDate, todayDate, g.vestYears, g.cliffMonths),
        cliffMonths: g.cliffMonths,
      };
      return { grant: g, total, strike, vestedInfo };
    }),
    [grants, todayDate]
  );

  // ── Aggregated ──
  const totalOptionsAll = grantCalcs.reduce((s, g) => s + g.total, 0);
  const totalVestedAll  = grantCalcs.reduce((s, g) => s + g.vestedInfo.count, 0);
  const weightedAvgStrike = totalOptionsAll > 0
    ? grantCalcs.reduce((s, g) => s + g.strike * g.total, 0) / totalOptionsAll
    : 0;

  const globalDilutedNum = parseFloat(globalDiluted) || 0;
  const dilutedError     = globalDiluted !== "" && globalDilutedNum <= 0 ? "Must be greater than 0" : "";
  const tableReady       = globalDilutedNum > 0 && grantCalcs.some((g) => g.strike > 0);
  const baseValuation    = weightedAvgStrike * globalDilutedNum;

  const ownershipPct     = totalOptionsAll > 0 && globalDilutedNum > 0
    ? (totalOptionsAll / globalDilutedNum) * 100
    : 0;
  const ownerBarFill     = Math.min((ownershipPct / 2) * 100, 100);

  // Auto-update unpinned scenario rows when baseValuation changes
  const prevBaseVal = useRef(baseValuation);
  useMemo(() => {
    if (baseValuation <= 0) return;
    // Only update if baseValuation actually changed
    if (prevBaseVal.current === baseValuation) return;
    prevBaseVal.current = baseValuation;
    setScenarios((prev) =>
      prev.map((s, idx) => {
        if (s.pinned) return s;
        // Re-apply the original multipliers based on position index
        const multipliers = [0.5, 1, 5];
        const mult = multipliers[idx] ?? (idx + 1);
        return { ...s, rawValue: Math.round(baseValuation * mult) };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseValuation]);

  // ── Compute scenario results ──
  const computedScenarios = useMemo<ComputedScenario[]>(() => {
    return scenarios.map((row) => {
      const valuation = row.rawValue;
      const impliedSharePrice = globalDilutedNum > 0 ? valuation / globalDilutedNum : 0;

      const perGrant: PerGrantScenario[] = grantCalcs.map((gc, i) => {
        const gain = Math.max(0, impliedSharePrice - gc.strike);
        return {
          grantId: gc.grant.id,
          label:   gc.grant.label || `Grant ${i + 1}`,
          strike:  gc.strike,
          gainPerOption: gain,
          vestedValue:   gain * gc.vestedInfo.count,
          fullGrantValue: gain * gc.total,
          totalGrant:    gc.total,
          vestedCount:   gc.vestedInfo.count,
        };
      });

      const totalVestedValue    = perGrant.reduce((s, g) => s + g.vestedValue, 0);
      const totalFullGrantValue = perGrant.reduce((s, g) => s + g.fullGrantValue, 0);
      const weightedGainPerOption = totalOptionsAll > 0
        ? perGrant.reduce((s, g) => s + g.gainPerOption * g.totalGrant, 0) / totalOptionsAll
        : 0;
      const multiple = weightedAvgStrike > 0 ? impliedSharePrice / weightedAvgStrike : 0;

      return { ...row, impliedSharePrice, perGrant, totalVestedValue, totalFullGrantValue, weightedGainPerOption, multiple };
    });
  }, [scenarios, grantCalcs, globalDilutedNum, totalOptionsAll, weightedAvgStrike]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: OFFWHITE, fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 border-b" style={{ background: "#fff", borderColor: SLATE }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 select-none flex-shrink-0">
            <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: NAVY }}>
              Rhino Ventures
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest" style={{ color: MUTED }}>
              Option Modeller
            </span>
            <Link
              to="/portal"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: BLUE }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page title */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: BLUE }}>
              Resources · Equity
            </p>
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Option Modeller</h1>
            <p className="text-sm mt-1" style={{ color: MUTED }}>
              Model the potential value of your stock option grants across exit scenarios. All figures in CAD.
            </p>
          </div>

          {/* ── Section 1 — My Grants ── */}
          <section className="mb-6">
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${SLATE}` }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">My Grants</h2>
                <button
                  onClick={addGrant}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded px-2.5 py-1.5 transition-opacity hover:opacity-85"
                  style={{ background: BLUE, color: "#fff" }}
                >
                  <Plus className="w-3 h-3" />
                  Add Grant
                </button>
              </div>
              <div className="p-4 sm:p-5 space-y-3" style={{ background: OFFWHITE }}>
                {grants.map((g, i) => {
                  const gc = grantCalcs[i];
                  return (
                    <GrantCard
                      key={g.id}
                      grant={g}
                      index={i + 1}
                      isExpanded={expandedIds.has(g.id)}
                      vestedInfo={gc.vestedInfo}
                      onToggle={() => toggleExpand(g.id)}
                      onChange={(updates) => updateGrant(g.id, updates)}
                      onDelete={() => deleteGrant(g.id)}
                      canDelete={grants.length > 1}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Section 2 — Grant Summary ── */}
          <section className="mb-6">
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${SLATE}` }}>
              <div className="px-5 py-3" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">Grant Summary</h2>
              </div>
              <div className="p-4 sm:p-5" style={{ background: "#fff" }}>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: "Total Grants", value: `${grants.length}` },
                    { label: "Total Options", value: totalOptionsAll > 0 ? totalOptionsAll.toLocaleString() : "—" },
                    { label: "Total Vested Today", value: totalVestedAll > 0 ? totalVestedAll.toLocaleString() : "—" },
                    {
                      label: <span className="flex items-center gap-0.5">Wtd. Avg Strike<TooltipComp text="Weighted average strike price across all grants, weighted by number of options." /></span>,
                      value: weightedAvgStrike > 0 ? `$${weightedAvgStrike.toFixed(4)}` : "—",
                    },
                  ].map((card, i) => (
                    <div key={i} className="rounded-lg p-3.5" style={{ background: OFFWHITE, border: `1px solid ${SLATE}` }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: MUTED }}>{card.label}</p>
                      <p className="text-xl font-bold" style={{ color: BLUE }}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Ownership bar */}
                {ownershipPct > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                        Current Ownership
                        <TooltipComp text="Total options across all grants ÷ current fully diluted shares." />
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: BLUE }}>{ownershipPct.toFixed(4)}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden h-2" style={{ background: SLATE }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ownerBarFill}%`, background: BLUE }} />
                    </div>
                    <p className="text-[9px] mt-1" style={{ color: MUTED }}>Bar capped at 2% for display clarity</p>
                  </div>
                )}

                {/* Per-grant vesting table */}
                {grants.length > 0 && (
                  <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${SLATE}` }}>
                    <table className="w-full text-xs min-w-[640px]">
                      <thead>
                        <tr style={{ background: NAVY }}>
                          {["Grant", "Options", "Strike", "Vested", "% Vested", "Cliff Date", "Fully Vested Date"].map((h, i) => (
                            <th
                              key={h}
                              className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white ${i === 0 ? "text-left" : "text-right"}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grantCalcs.map((gc, i) => {
                          const label = gc.grant.label || `Grant ${i + 1}`;
                          const v = gc.vestedInfo;
                          return (
                            <tr key={gc.grant.id} style={{ borderTop: `1px solid ${SLATE}`, background: i % 2 === 0 ? "#fff" : OFFWHITE }}>
                              <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>{label}</td>
                              <td className="px-3 py-2.5 text-right" style={{ color: NAVY }}>{gc.total > 0 ? gc.total.toLocaleString() : "—"}</td>
                              <td className="px-3 py-2.5 text-right" style={{ color: NAVY }}>{gc.strike > 0 ? `$${gc.strike.toFixed(2)}` : "—"}</td>
                              <td className="px-3 py-2.5 text-right font-bold" style={{ color: BLUE }}>
                                {v.status === "pre-cliff" ? "0" : v.count.toLocaleString()}
                              </td>
                              <td className="px-3 py-2.5 text-right" style={{ color: v.status === "pre-cliff" ? MUTED : v.pct >= 100 ? "#1A6B3C" : BLUE }}>
                                {v.pct.toFixed(1)}%
                              </td>
                              <td className="px-3 py-2.5 text-right" style={{ color: MUTED }}>{v.cliffDate || "—"}</td>
                              <td className="px-3 py-2.5 text-right" style={{ color: MUTED }}>{v.fullyVestedDate || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Section 3 — Exit Scenario Modeller ── */}
          <section>
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${SLATE}` }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">Exit Scenario Modeller</h2>
                <div className="flex items-center gap-2">
                  {!tableReady && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
                      Enter strike prices to unlock
                    </span>
                  )}
                  <button
                    onClick={() => setShowBreakdown((v) => !v)}
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded transition-opacity hover:opacity-85"
                    style={{ background: showBreakdown ? "#fff" : "rgba(255,255,255,0.15)", color: showBreakdown ? NAVY : "rgba(255,255,255,0.85)" }}
                  >
                    {showBreakdown ? "Hide" : "Show"} breakdown
                  </button>
                </div>
              </div>

              {/* Global diluted shares input */}
              <div className="px-5 py-4" style={{ background: "#fff", borderBottom: `1px solid ${SLATE}` }}>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                  <div className="sm:w-72">
                    <FieldLabel>
                      Current Fully Diluted Shares Outstanding
                      <TooltipComp text="The current total number of shares, options, warrants, and convertibles. Used to calculate implied share price across all scenarios." />
                    </FieldLabel>
                    <FieldInput
                      value={globalDiluted}
                      onChange={setGlobalDiluted}
                      placeholder="e.g. 10,000,000"
                      hasError={!!dilutedError}
                    />
                    {dilutedError && <p className="text-[10px] mt-1" style={{ color: RED_ERR }}>{dilutedError}</p>}
                  </div>
                  <p className="text-[10px] pb-0.5" style={{ color: MUTED }}>
                    Combined total across all grants.{" "}
                    <span style={{ fontStyle: "italic" }}>Each grant's gain is calculated using its own strike price.</span>
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="relative">
                {!tableReady && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-b-lg"
                    style={{ background: "rgba(244,247,250,0.82)", backdropFilter: "blur(2px)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: MUTED }}>
                      Enter a strike price on at least one grant to activate the scenario table.
                    </p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[820px]">
                    <thead>
                      <tr style={{ background: NAVY }}>
                        {[
                          { label: "Scenario",                                                       align: "left"  },
                          { label: "Company Valuation (CAD)",                                        align: "left"  },
                          { label: "Implied Share Price",                                             align: "right" },
                          { label: grants.length > 1 ? "Wtd. Avg Gain / Option" : "Gain / Option",  align: "right" },
                          { label: "Value of Vested Options",                                         align: "right" },
                          { label: "Value of Full Grant",                                             align: "right" },
                          { label: "Multiple on Strike",                                              align: "right" },
                          { label: "",                                                                align: "right" },
                        ].map(({ label, align }, i) => (
                          <th
                            key={i}
                            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white ${align === "right" ? "text-right" : "text-left"}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {computedScenarios.map((row) => {
                        const hasBase      = globalDilutedNum > 0 && row.rawValue > 0;
                        const isInMoney    = hasBase && row.totalFullGrantValue > 0;
                        const isUnderwater = hasBase && row.totalFullGrantValue === 0 && row.rawValue < baseValuation;

                        const rowBg = isInMoney ? "#D6F0E0" : isUnderwater ? "#FBEAE8" : "#ffffff";
                        const valueColor = !hasBase ? MUTED : isInMoney ? "#1A6B3C" : isUnderwater ? "#A33222" : MUTED;
                        const valueBold = isInMoney;
                        const vStyle = { color: valueColor, fontWeight: valueBold ? 700 : 400 };

                        return (
                          <>
                            <tr key={row.id} style={{ background: rowBg, borderTop: `1px solid ${SLATE}` }}>
                              {/* Scenario label — inline editable */}
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: NAVY }}>
                                <InlineLabel
                                  value={row.label}
                                  onChange={(v) => updateScenarioLabel(row.id, v)}
                                />
                              </td>

                              {/* Valuation — fully editable, yellow tint if pinned */}
                              <td className="px-4 py-2">
                                <ValuationCell
                                  rawValue={row.rawValue}
                                  pinned={row.pinned}
                                  onChange={(v, pin) => updateScenarioValue(row.id, v, pin)}
                                />
                              </td>

                              {/* Implied share price */}
                              <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: MUTED }}>
                                {hasBase ? fmtCAD(row.impliedSharePrice) : "—"}
                              </td>

                              {/* Gain / option */}
                              <td className="px-4 py-3 text-right font-mono text-xs" style={vStyle}>
                                {hasBase ? (isInMoney ? fmtCAD(row.weightedGainPerOption) : "$0.00") : "—"}
                              </td>

                              {/* Vested value */}
                              <td className="px-4 py-3 text-right font-mono text-xs" style={vStyle}>
                                {hasBase ? (isInMoney ? fmtLargeCAD(row.totalVestedValue) : "$0.00") : "—"}
                              </td>

                              {/* Full grant value */}
                              <td className="px-4 py-3 text-right font-mono text-xs" style={vStyle}>
                                {hasBase ? (isInMoney ? fmtLargeCAD(row.totalFullGrantValue) : "$0.00") : "—"}
                              </td>

                              {/* Multiple */}
                              <td className="px-4 py-3 text-right font-mono text-xs" style={vStyle}>
                                {hasBase ? fmtMultiple(row.multiple) : "—"}
                              </td>

                              {/* Delete */}
                              <td className="px-2 py-3 text-right">
                                {scenarios.length > 1 && (
                                  <button
                                    onClick={() => deleteScenario(row.id)}
                                    className="p-1 rounded opacity-40 hover:opacity-80 transition-opacity"
                                    style={{ color: RED_ERR }}
                                    title="Remove row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>

                            {/* Per-grant breakdown rows */}
                            {showBreakdown && grants.length > 1 && row.perGrant.map((pg) => {
                              const pgInMoney = pg.gainPerOption > 0;
                              const pgColor   = pgInMoney ? "#1A6B3C" : MUTED;
                              return (
                                <tr key={`${row.id}_${pg.grantId}`} style={{ background: isInMoney ? "#EBF7EF" : isUnderwater ? "#FDF2F1" : OFFWHITE, borderTop: `1px solid ${SLATE}` }}>
                                  <td className="pl-8 pr-4 py-2 text-xs" style={{ color: MUTED }}>
                                    <span style={{ marginRight: 6, opacity: 0.5 }}>↳</span>
                                    <span style={{ color: NAVY, fontWeight: 500 }}>{pg.label}</span>
                                    <span className="ml-2" style={{ color: MUTED }}>@ ${pg.strike.toFixed(2)}</span>
                                  </td>
                                  <td className="px-4 py-2 text-xs" style={{ color: MUTED }}>
                                    {pg.totalGrant.toLocaleString()} options
                                  </td>
                                  <td className="px-4 py-2 text-right text-xs" style={{ color: MUTED }}>—</td>
                                  <td className="px-4 py-2 text-right font-mono text-xs" style={{ color: pgColor }}>
                                    {hasBase ? (pgInMoney ? fmtCAD(pg.gainPerOption) : "$0.00") : "—"}
                                  </td>
                                  <td className="px-4 py-2 text-right font-mono text-xs" style={{ color: pgColor }}>
                                    {hasBase ? (pgInMoney ? fmtLargeCAD(pg.vestedValue) : "$0.00") : "—"}
                                  </td>
                                  <td className="px-4 py-2 text-right font-mono text-xs" style={{ color: pgColor }}>
                                    {hasBase ? (pgInMoney ? fmtLargeCAD(pg.fullGrantValue) : "$0.00") : "—"}
                                  </td>
                                  <td className="px-4 py-2 text-right text-xs" style={{ color: MUTED }}>—</td>
                                  <td />
                                </tr>
                              );
                            })}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer actions */}
                <div
                  className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
                  style={{ background: OFFWHITE, borderTop: `1px solid ${SLATE}` }}
                >
                  {/* Left: add + reset */}
                  <div className="flex items-center gap-3">
                    {scenarios.length < 4 && (
                      <button
                        onClick={addScenario}
                        className="flex items-center gap-1 text-[11px] font-semibold rounded px-2.5 py-1.5 transition-colors hover:opacity-85"
                        style={{ background: `${BLUE}18`, color: BLUE, border: `1px solid ${BLUE}40` }}
                      >
                        <Plus className="w-3 h-3" />
                        Add scenario
                      </button>
                    )}
                    {scenarios.length >= 4 && (
                      <span className="text-[10px]" style={{ color: MUTED }}>Maximum 4 scenarios reached</span>
                    )}

                    {/* Reset confirmation */}
                    {showResetConfirm ? (
                      <span className="flex items-center gap-2 text-[11px]" style={{ color: MUTED }}>
                        Reset all rows to defaults?
                        <button
                          onClick={() => resetToDefaults(baseValuation > 0 ? baseValuation : INITIAL_BASE_VAL)}
                          className="font-bold px-2 py-0.5 rounded text-[10px]"
                          style={{ background: "#A33222", color: "#fff" }}
                        >
                          Yes, reset
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="font-medium text-[10px]"
                          style={{ color: MUTED }}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="flex items-center gap-1 text-[11px] transition-opacity hover:opacity-70"
                        style={{ color: MUTED }}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset to defaults
                      </button>
                    )}
                  </div>

                  {/* Right: legend */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium" style={{ color: MUTED }}>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#D6F0E0" }} />
                      <span style={{ color: "#1A6B3C" }}>In the money</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#ffffff", border: `1px solid ${SLATE}` }} />
                      At strike
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#FBEAE8" }} />
                      <span style={{ color: "#A33222" }}>Underwater</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#FFFACD", border: "1px solid #E8C43A" }} />
                      Manually set
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-5 text-center text-[11px]"
        style={{ borderTop: `1px solid ${SLATE}`, background: "#fff", color: MUTED }}
      >
        Rhino Ventures · rhinovc.com · For informational purposes only. Not financial or legal advice.
      </footer>
    </div>
  );
};

export default OptionModeller;
