import { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Info } from "lucide-react";
import { downloadOptionModellerXLSX } from "@/lib/exportOptionModeller";

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function diffMonthsFloat(grantDateStr: string, todayStr: string): number {
  if (!grantDateStr || !todayStr) return 0;
  const grant = new Date(grantDateStr);
  const now   = new Date(todayStr);
  return (now.getTime() - grant.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

function calcVestedOptions(
  totalOptions: number,
  grantDateStr: string,
  todayStr: string,
): { count: number; pct: number; status: "pre-cliff" | "vesting" | "fully-vested"; cliffDate: string } {
  const cliffDate = grantDateStr ? addMonths(grantDateStr, 12) : "";
  if (!grantDateStr || !todayStr || totalOptions <= 0)
    return { count: 0, pct: 0, status: "pre-cliff", cliffDate };

  const diffMonths = diffMonthsFloat(grantDateStr, todayStr);

  if (diffMonths < 12)
    return { count: 0, pct: 0, status: "pre-cliff", cliffDate };

  if (diffMonths >= 48) {
    return { count: totalOptions, pct: 100, status: "fully-vested", cliffDate };
  }

  const cliff            = Math.round(totalOptions * 0.25);
  const remaining        = totalOptions - cliff;
  const monthsAfterCliff = Math.floor(diffMonths - 12);
  const monthlyVest      = remaining / 36;
  const vestedAfterCliff = Math.min(monthsAfterCliff * monthlyVest, remaining);
  const count            = Math.floor(cliff + vestedAfterCliff);
  const pct              = (count / totalOptions) * 100;
  return { count, pct, status: "vesting", cliffDate };
}

function calcMonthsVested(grantDateStr: string, todayStr: string): number {
  return Math.max(0, Math.floor(diffMonthsFloat(grantDateStr, todayStr)));
}

function fmtValuation(n: number): string {
  if (!n || n <= 0) return "$0";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtMultiple(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  return `${n.toFixed(2)}x`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScenarioRow {
  id: string;
  label: string;
  editable: boolean;
  derived?: (baseVal: number) => number;
}

const SCENARIOS: ScenarioRow[] = [
  { id: "conservative", label: "Conservative Exit",    editable: true },
  { id: "base",         label: "Base — Last Round",    editable: false },
  { id: "moderate",     label: "Moderate Exit",        editable: true },
  { id: "two_x",        label: "2× Last Round",        editable: false, derived: (b) => b * 2 },
  { id: "strong",       label: "Strong Exit",          editable: true },
  { id: "exceptional",  label: "Exceptional Exit",     editable: true },
  { id: "custom",       label: "Custom — Enter Below", editable: true },
];

// Brand colours
const NAVY     = "#173660";
const BLUE     = "#1A7EC8";
const SLATE    = "#CDD8E3";
const OFFWHITE = "#F4F7FA";
const MUTED    = "#5C6B7A";
const RED_ERR  = "#C0392B";

// ── Sub-components ────────────────────────────────────────────────────────────

const FieldLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ color: MUTED }} className="block text-[10px] font-bold uppercase tracking-widest mb-1">
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
    style={{
      border: `1px solid ${hasError ? RED_ERR : SLATE}`,
      background: readOnly ? OFFWHITE : "#fff",
    }}
  >
    {prefix && (
      <span className="pl-3 text-sm select-none" style={{ color: MUTED }}>{prefix}</span>
    )}
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

const ValuationInput: FC<{
  value: string;
  onChange: (v: string) => void;
  isCustom?: boolean;
}> = ({ value, onChange, isCustom }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={isCustom ? "$250,000,000" : "Enter $"}
    className="w-full rounded px-2 py-1.5 text-sm outline-none border transition-colors focus:ring-1"
    style={{
      backgroundColor: isCustom ? "#FFF3CD" : "#FFFACD",
      borderColor: isCustom ? "#D4900A" : "#E8C43A",
      borderWidth: isCustom ? "2px" : "1px",
      color: NAVY,
      fontWeight: isCustom ? 600 : 400,
    }}
  />
);

const Tooltip: FC<{ text: string }> = ({ text }) => (
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

const StatCard: FC<{
  label: string;
  value: string;
  tooltip?: string;
  sub?: React.ReactNode;
  isPositive?: boolean;
}> = ({ label, value, tooltip, sub, isPositive }) => (
  <div className="rounded-lg p-4" style={{ background: "#fff", border: `1px solid ${SLATE}` }}>
    <p
      className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-0.5"
      style={{ color: MUTED }}
    >
      {label}
      {tooltip && <Tooltip text={tooltip} />}
    </p>
    <p className="text-2xl font-bold" style={{ color: value === "—" ? MUTED : BLUE }}>
      {value}
    </p>
    {sub && <div className="mt-1">{sub}</div>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

// Compute a date N months ago from today
function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

const OptionModeller: FC = () => {
  const [totalOptions, setTotalOptions] = useState("1000");
  const [strikePrice,  setStrikePrice]  = useState("10");
  const [fullyDiluted, setFullyDiluted] = useState("10000000");
  const [grantDate,    setGrantDate]    = useState(() => monthsAgo(18));
  const [todayDate,    setTodayDate]    = useState(today());
  const [exporting,    setExporting]    = useState(false);

  // Default valuations sized to feel meaningful at $10 strike / 10M diluted (base = $100M)
  const [customVals, setCustomVals] = useState<Record<string, string>>({
    conservative: "50000000",    // $50M  — underwater vs $100M base
    moderate:     "150000000",   // $150M — $5/share gain
    strong:       "500000000",   // $500M — $40/share gain
    exceptional:  "1000000000",  // $1B
    custom:       "",
  });

  const setCustomVal = (id: string, v: string) =>
    setCustomVals((prev) => ({ ...prev, [id]: v }));

  // ── Derived ──
  const total   = parseFloat(totalOptions) || 0;
  const strike  = parseFloat(strikePrice)  || 0;
  const diluted = parseFloat(fullyDiluted) || 0;

  // Validation
  const strikeError  = strikePrice  !== "" && strike  <= 0 ? "Strike price must be greater than 0" : "";
  const dilutedError = fullyDiluted !== "" && diluted <= 0 ? "Must be greater than 0" : "";
  const tableReady   = strike > 0 && diluted > 0;

  const ownershipPct = diluted > 0 && total > 0 ? (total / diluted) * 100 : 0;
  const vestedInfo   = calcVestedOptions(total, grantDate, todayDate);
  const monthsVested = calcMonthsVested(grantDate, todayDate);
  const baseValuation = strike * diluted;

  const getValuation = (row: ScenarioRow): number => {
    if (!row.editable) {
      if (row.id === "base")   return baseValuation;
      if (row.derived)         return row.derived(baseValuation);
      return 0;
    }
    return parseFloat(customVals[row.id] ?? "0") || 0;
  };

  const scenarios = useMemo(
    () =>
      SCENARIOS.map((row) => {
        const valuation        = getValuation(row);
        const impliedSharePrice = diluted > 0 ? valuation / diluted : 0;
        const gainPerOption    = Math.max(0, impliedSharePrice - strike);
        const vestedValue      = gainPerOption * vestedInfo.count;
        const fullGrantValue   = gainPerOption * total;
        const multiple         = strike > 0 ? impliedSharePrice / strike : 0;
        return { ...row, valuation, impliedSharePrice, gainPerOption, vestedValue, fullGrantValue, multiple };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalOptions, strikePrice, fullyDiluted, grantDate, todayDate, customVals]
  );

  // ── Ownership bar (capped at 2% for display) ──
  const ownerBarFill = Math.min((ownershipPct / 2) * 100, 100);

  // ── Vested options stat sub-content ──
  const vestedSub = (() => {
    if (!grantDate || !total) return null;
    if (vestedInfo.status === "pre-cliff") {
      return (
        <p className="text-[10px] mt-1 leading-snug" style={{ color: RED_ERR }}>
          Cliff not yet reached — vesting begins {vestedInfo.cliffDate}
        </p>
      );
    }
    if (vestedInfo.status === "fully-vested") {
      return (
        <p className="text-[10px] mt-1 leading-snug font-semibold" style={{ color: BLUE }}>
          Fully vested (100%)
        </p>
      );
    }
    return (
      <p className="text-[10px] mt-1 leading-snug" style={{ color: MUTED }}>
        {vestedInfo.pct.toFixed(1)}% of grant vested
      </p>
    );
  })();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: OFFWHITE, fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 border-b" style={{ background: "#fff", borderColor: SLATE }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 select-none flex-shrink-0">
            <span
              className="text-sm font-bold tracking-[0.2em] uppercase"
              style={{ color: NAVY, fontVariant: "small-caps" }}
            >
              Rhino Ventures
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest" style={{ color: MUTED }}>
              Option Modeller
            </span>

            {/* Download Excel */}
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadOptionModellerXLSX({
                    inputs: { totalOptions, strikePrice, fullyDiluted, grantDate, todayDate, ownershipPct, vestedOptions: vestedInfo.count, monthsVested },
                    scenarios,
                    diluted,
                    strike,
                  });
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest rounded px-3 py-2 transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{ background: BLUE, color: "#fff" }}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{exporting ? "Generating…" : "Download Excel"}</span>
              <span className="sm:hidden">Export</span>
            </button>

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
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>
              Option Modeller
            </h1>
            <p className="text-sm mt-1" style={{ color: MUTED }}>
              Model the potential value of your stock option grant across exit scenarios. All figures in CAD.
            </p>
          </div>

          {/* ── Section 1 — My Grant ── */}
          <section className="mb-10">
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${SLATE}` }}>
              <div className="px-5 py-3" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">My Grant</h2>
              </div>

              <div className="p-4 sm:p-5" style={{ background: "#fff" }}>
                {/* Input grid — stacks on mobile, 3-col on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

                  <div>
                    <FieldLabel>Total Options Granted</FieldLabel>
                    <FieldInput value={totalOptions} onChange={setTotalOptions} placeholder="e.g. 50,000" />
                  </div>

                  <div>
                    <FieldLabel>Strike Price per Share (CAD $)</FieldLabel>
                    <FieldInput
                      value={strikePrice}
                      onChange={setStrikePrice}
                      prefix="$"
                      placeholder="e.g. 1.50"
                      hasError={!!strikeError}
                    />
                    {strikeError && (
                      <p className="text-[10px] mt-1" style={{ color: RED_ERR }}>{strikeError}</p>
                    )}
                  </div>

                  <div>
                    <FieldLabel>
                      Fully Diluted Shares Outstanding
                      <Tooltip text="The total number of shares, options, warrants, and convertibles outstanding. Ask your company for this number." />
                    </FieldLabel>
                    <FieldInput
                      value={fullyDiluted}
                      onChange={setFullyDiluted}
                      placeholder="e.g. 10,000,000"
                      hasError={!!dilutedError}
                    />
                    {dilutedError && (
                      <p className="text-[10px] mt-1" style={{ color: RED_ERR }}>{dilutedError}</p>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Vesting Schedule</FieldLabel>
                    <FieldInput value="4-year / 1-year cliff" onChange={() => {}} readOnly />
                  </div>

                  <div>
                    <FieldLabel>Grant Date</FieldLabel>
                    <input
                      type="date"
                      value={grantDate}
                      onChange={(e) => setGrantDate(e.target.value)}
                      className="w-full rounded px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ border: `1px solid ${SLATE}`, background: "#fff", color: NAVY }}
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      Today's Date
                      <Tooltip text="Auto-filled to today. Change to model a future or past date." />
                    </FieldLabel>
                    <input
                      type="date"
                      value={todayDate}
                      onChange={(e) => setTodayDate(e.target.value)}
                      className="w-full rounded px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ border: `1px solid ${SLATE}`, background: "#fff", color: NAVY }}
                    />
                  </div>
                </div>

                {/* Ownership bar */}
                {ownershipPct > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                        Your Ownership
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: BLUE }}>
                        {ownershipPct.toFixed(4)}%
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden h-2" style={{ background: SLATE }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${ownerBarFill}%`, background: BLUE }}
                      />
                    </div>
                    <p className="text-[9px] mt-1" style={{ color: MUTED }}>
                      Bar capped at 2% for display clarity
                    </p>
                  </div>
                )}

                {/* Derived stat cards */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    label="% Ownership"
                    tooltip="Your options ÷ fully diluted shares outstanding."
                    value={diluted > 0 && total > 0 ? `${ownershipPct.toFixed(4)}%` : "—"}
                  />
                  <StatCard
                    label="Vested Options Today"
                    tooltip="25% vests at the 1-year cliff, remainder monthly over 36 months."
                    value={total > 0 && grantDate
                      ? vestedInfo.status === "pre-cliff" ? "0" : vestedInfo.count.toLocaleString()
                      : "—"}
                    sub={vestedSub}
                  />
                  <StatCard
                    label="Months Vested"
                    value={grantDate ? `${monthsVested}` : "—"}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2 — Exit Scenario Modeller ── */}
          <section>
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${SLATE}` }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">
                  Exit Scenario Modeller
                </h2>
                {!tableReady && (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                  >
                    Enter strike price &amp; diluted shares to unlock
                  </span>
                )}
              </div>

              {/* Overlay when not ready */}
              <div className="relative">
                {!tableReady && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-b-lg"
                    style={{ background: "rgba(244,247,250,0.82)", backdropFilter: "blur(2px)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: MUTED }}>
                      Enter a strike price and fully diluted share count above to activate the scenario table.
                    </p>
                  </div>
                )}

                {/* Horizontally scrollable on mobile */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr style={{ background: NAVY }}>
                        {[
                          ["Scenario",              "left",  "w-44"],
                          ["Company Valuation (CAD)", "left", "w-44"],
                          ["Implied Share Price",    "right", ""],
                          ["Gain / Option",          "right", ""],
                          ["Value of Vested",        "right", ""],
                          ["Value of Full Grant",    "right", ""],
                          ["Multiple on Strike",     "right", ""],
                        ].map(([label, align, w]) => (
                          <th
                            key={label}
                            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white ${w} ${align === "right" ? "text-right" : "text-left"}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios.map((row, i) => {
                        const isAuto     = row.id === "base" || row.id === "two_x";
                        const isCustom   = row.id === "custom";
                        const isPositive = row.gainPerOption > 0;
                        const rowBg      = i % 2 === 0 ? "#ffffff" : OFFWHITE;
                        const hasBase    = diluted > 0 && strike > 0 && row.valuation > 0;

                        const vStyle = (active: boolean) => ({
                          color:      !active ? MUTED : isPositive ? BLUE : MUTED,
                          fontWeight: isPositive && active ? 700 : 400,
                        });

                        return (
                          <tr
                            key={row.id}
                            style={{ background: isCustom ? "#FEFDF5" : rowBg, borderTop: `1px solid ${SLATE}` }}
                          >
                            {/* Scenario */}
                            <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                              {row.label}
                              {isAuto && (
                                <span
                                  className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                                  style={{ background: `${BLUE}18`, color: BLUE }}
                                >
                                  Auto
                                </span>
                              )}
                            </td>

                            {/* Valuation */}
                            <td className="px-4 py-3">
                              {row.editable ? (
                                <ValuationInput
                                  value={customVals[row.id] ?? ""}
                                  onChange={(v) => setCustomVal(row.id, v)}
                                  isCustom={isCustom}
                                />
                              ) : (
                                <span className="font-mono text-xs" style={{ color: MUTED }}>
                                  {fmtValuation(row.valuation)}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-xs" style={vStyle(hasBase)}>
                              {hasBase ? fmtCAD(row.impliedSharePrice) : "—"}
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-xs">
                              <span style={vStyle(diluted > 0 && strike > 0 && row.valuation > 0)}>
                                {diluted > 0 && strike > 0 && row.valuation > 0
                                  ? isPositive ? fmtCAD(row.gainPerOption) : "$0.00"
                                  : "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-xs">
                              <span style={vStyle(hasBase && vestedInfo.count > 0)}>
                                {hasBase ? (isPositive && vestedInfo.count > 0 ? fmtCAD(row.vestedValue) : "$0.00") : "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-xs">
                              <span style={vStyle(hasBase && total > 0)}>
                                {hasBase && total > 0 ? (isPositive ? fmtCAD(row.fullGrantValue) : "$0.00") : "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-xs">
                              <span style={vStyle(hasBase)}>
                                {hasBase ? fmtMultiple(row.multiple) : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div
                  className="px-5 py-2.5 flex flex-wrap items-center gap-3 text-[10px] font-medium border-t"
                  style={{ background: OFFWHITE, borderColor: SLATE, color: MUTED }}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: BLUE }} />
                    Above strike — positive value
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: MUTED }} />
                    Underwater — $0 gain
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#FFFACD", border: "1px solid #E8C43A" }} />
                    Editable input
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "#FFF3CD", border: "2px solid #D4900A" }} />
                    Custom input
                  </span>
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
