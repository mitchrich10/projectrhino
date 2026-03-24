import { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Info } from "lucide-react";
import { downloadOptionModellerXLSX } from "@/lib/exportOptionModeller";

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

function calcVestedOptions(totalOptions: number, grantDateStr: string, todayStr: string): number {
  if (!grantDateStr || !todayStr || totalOptions <= 0) return 0;
  const grant = new Date(grantDateStr);
  const now = new Date(todayStr);
  const diffMs = now.getTime() - grant.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375);
  if (diffMonths < 12) return 0;
  const cliff = Math.round(totalOptions * 0.25);
  const remaining = totalOptions - cliff;
  const monthsAfterCliff = Math.floor(diffMonths - 12);
  const monthlyVest = remaining / 36;
  const vestedAfterCliff = Math.min(monthsAfterCliff * monthlyVest, remaining);
  return Math.floor(cliff + vestedAfterCliff);
}

function calcMonthsVested(grantDateStr: string, todayStr: string): number {
  if (!grantDateStr || !todayStr) return 0;
  const grant = new Date(grantDateStr);
  const now = new Date(todayStr);
  const diffMs = now.getTime() - grant.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
}

function fmtValuation(n: number): string {
  if (!n || n <= 0) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(n);
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
  defaultVal?: number;
}

const SCENARIOS: ScenarioRow[] = [
  { id: "conservative", label: "Conservative Exit", editable: true, defaultVal: 25_000_000 },
  { id: "base",         label: "Base — Last Round", editable: false },
  { id: "moderate",     label: "Moderate Exit",     editable: true, defaultVal: 75_000_000 },
  { id: "two_x",        label: "2× Last Round",     editable: false, derived: (base) => base * 2 },
  { id: "strong",       label: "Strong Exit",        editable: true, defaultVal: 150_000_000 },
  { id: "exceptional",  label: "Exceptional Exit",   editable: true, defaultVal: 300_000_000 },
  { id: "custom",       label: "Custom — Enter Below", editable: true, defaultVal: 0 },
];

// Brand colours (raw hex for inline styles where needed)
const NAVY    = "#173660";
const BLUE    = "#1A7EC8";
const MINT    = "#A3D7C2";
const SLATE   = "#CDD8E3";
const OFFWHITE = "#F4F7FA";
const MUTED   = "#5C6B7A";

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
}> = ({ value, onChange, type = "number", prefix, placeholder = "0", readOnly }) => (
  <div
    className="flex items-center rounded"
    style={{
      border: `1px solid ${SLATE}`,
      background: readOnly ? OFFWHITE : "#fff",
    }}
  >
    {prefix && (
      <span className="pl-3 text-sm select-none" style={{ color: MUTED }}>
        {prefix}
      </span>
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

const ValuationInput: FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter $"
    className="w-full rounded px-2 py-1.5 text-sm outline-none border transition-colors focus:ring-1"
    style={{
      backgroundColor: "#FFFACD",
      borderColor: "#E8C43A",
      color: NAVY,
    }}
  />
);

const Tooltip: FC<{ text: string }> = ({ text }) => (
  <span className="group relative ml-1 inline-flex">
    <Info className="w-3 h-3 inline cursor-help" style={{ color: MUTED }} />
    <span
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-5 w-52 rounded text-[10px] px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 leading-snug text-center"
      style={{ background: NAVY, color: "#fff" }}
    >
      {text}
    </span>
  </span>
);

const StatCard: FC<{ label: string; value: string; tooltip?: string }> = ({ label, value, tooltip }) => (
  <div className="rounded-lg p-4" style={{ background: "#fff", border: `1px solid ${SLATE}` }}>
    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-0.5" style={{ color: MUTED }}>
      {label}
      {tooltip && <Tooltip text={tooltip} />}
    </p>
    <p className="text-2xl font-bold" style={{ color: value === "—" ? MUTED : BLUE }}>
      {value}
    </p>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const OptionModeller: FC = () => {
  const [totalOptions, setTotalOptions]   = useState("");
  const [strikePrice, setStrikePrice]     = useState("");
  const [fullyDiluted, setFullyDiluted]   = useState("");
  const [grantDate, setGrantDate]         = useState("");
  const [todayDate, setTodayDate]         = useState(today());

  const [customVals, setCustomVals] = useState<Record<string, string>>({
    conservative: "25000000",
    moderate:     "75000000",
    strong:       "150000000",
    exceptional:  "300000000",
    custom:       "",
  });
  const [exporting, setExporting] = useState(false);

  const setCustomVal = (id: string, v: string) =>
    setCustomVals((prev) => ({ ...prev, [id]: v }));

  const total   = parseFloat(totalOptions) || 0;
  const strike  = parseFloat(strikePrice)  || 0;
  const diluted = parseFloat(fullyDiluted) || 0;

  const ownershipPct   = diluted > 0 ? (total / diluted) * 100 : 0;
  const vestedOptions  = calcVestedOptions(total, grantDate, todayDate);
  const monthsVested   = calcMonthsVested(grantDate, todayDate);
  const baseValuation  = strike * diluted;

  const getValuation = (row: ScenarioRow): number => {
    if (!row.editable) {
      if (row.id === "base") return baseValuation;
      if (row.derived) return row.derived(baseValuation);
      return 0;
    }
    return parseFloat(customVals[row.id] ?? "0") || 0;
  };

  const scenarios = useMemo(
    () =>
      SCENARIOS.map((row) => {
        const valuation = getValuation(row);
        const impliedSharePrice = diluted > 0 ? valuation / diluted : 0;
        const gainPerOption     = Math.max(0, impliedSharePrice - strike);
        const vestedValue       = gainPerOption * vestedOptions;
        const fullGrantValue    = gainPerOption * total;
        const multiple          = strike > 0 ? impliedSharePrice / strike : 0;
        return { ...row, valuation, impliedSharePrice, gainPerOption, vestedValue, fullGrantValue, multiple };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalOptions, strikePrice, fullyDiluted, grantDate, todayDate, customVals]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: OFFWHITE, fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}>

      {/* ── Top Header ── */}
      <header
        className="fixed top-0 w-full z-50 border-b"
        style={{ background: "#fff", borderColor: SLATE }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2 select-none">
            <span
              className="text-sm font-bold tracking-[0.2em] uppercase"
              style={{ color: NAVY, fontVariant: "small-caps" }}
            >
              Rhino Ventures
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span
              className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: MUTED }}
            >
              Option Modeller
            </span>
            <Link
              to="/portal"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: BLUE }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Portal
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
              {/* Card navy header */}
              <div className="px-5 py-3" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">
                  My Grant
                </h2>
              </div>

              <div className="p-5" style={{ background: "#fff" }}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <FieldLabel>Total Options Granted</FieldLabel>
                    <FieldInput value={totalOptions} onChange={setTotalOptions} placeholder="e.g. 50 000" />
                  </div>

                  <div>
                    <FieldLabel>Strike Price per Share (CAD $)</FieldLabel>
                    <FieldInput value={strikePrice} onChange={setStrikePrice} prefix="$" placeholder="e.g. 1.50" />
                  </div>

                  <div>
                    <FieldLabel>Fully Diluted Shares Outstanding</FieldLabel>
                    <FieldInput value={fullyDiluted} onChange={setFullyDiluted} placeholder="e.g. 10 000 000" />
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

                {/* Derived outputs */}
                <div className="mt-6 grid sm:grid-cols-3 gap-4">
                  <StatCard
                    label="% Ownership"
                    tooltip="Your options ÷ fully diluted shares outstanding."
                    value={diluted > 0 && total > 0 ? `${ownershipPct.toFixed(4)}%` : "—"}
                  />
                  <StatCard
                    label="Vested Options Today"
                    tooltip="25% vests at the 1-year cliff, remainder monthly over 36 months."
                    value={total > 0 && grantDate ? vestedOptions.toLocaleString() : "—"}
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
              {/* Card navy header */}
              <div className="px-5 py-3" style={{ background: NAVY }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">
                  Exit Scenario Modeller
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]">
                  <thead>
                    <tr style={{ background: NAVY }}>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white w-44">
                        Scenario
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white w-44">
                        Company Valuation
                        <span className="font-normal normal-case tracking-normal opacity-60 ml-1">(CAD)</span>
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-white">
                        Implied Share Price
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-white">
                        Gain / Option
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-white">
                        Value of Vested
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-white">
                        Value of Full Grant
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-white">
                        Multiple on Strike
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((row, i) => {
                      const isAuto     = row.id === "base" || row.id === "two_x";
                      const isPositive = row.gainPerOption > 0;
                      const rowBg      = i % 2 === 0 ? "#ffffff" : OFFWHITE;

                      const valueCls = isPositive ? "" : "";
                      const valueStyle = (hasData: boolean) => ({
                        color: !hasData ? MUTED : isPositive ? BLUE : MUTED,
                        fontWeight: isPositive && hasData ? 700 : 400,
                      });

                      const hasBase = diluted > 0 && strike > 0 && row.valuation > 0;

                      return (
                        <tr
                          key={row.id}
                          style={{ background: rowBg, borderTop: `1px solid ${SLATE}` }}
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
                              />
                            ) : (
                              <span className="font-mono text-xs" style={{ color: MUTED }}>
                                {fmtValuation(row.valuation)}
                              </span>
                            )}
                          </td>

                          {/* Implied share price */}
                          <td className="px-4 py-3 text-right font-mono text-xs" style={valueStyle(hasBase)}>
                            {hasBase ? fmtCAD(row.impliedSharePrice) : "—"}
                          </td>

                          {/* Gain per option */}
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            <span style={valueStyle(diluted > 0 && strike > 0 && row.valuation > 0)}>
                              {diluted > 0 && strike > 0 && row.valuation > 0
                                ? isPositive ? fmtCAD(row.gainPerOption) : "$0.00"
                                : "—"}
                            </span>
                          </td>

                          {/* Vested value */}
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            <span style={valueStyle(hasBase && vestedOptions > 0)}>
                              {hasBase ? (isPositive && vestedOptions > 0 ? fmtCAD(row.vestedValue) : "$0.00") : "—"}
                            </span>
                          </td>

                          {/* Full grant value */}
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            <span style={valueStyle(hasBase && total > 0)}>
                              {hasBase && total > 0
                                ? isPositive ? fmtCAD(row.fullGrantValue) : "$0.00"
                                : "—"}
                            </span>
                          </td>

                          {/* Multiple */}
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            <span style={valueStyle(hasBase)}>
                              {hasBase ? fmtMultiple(row.multiple) : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mint positive-value legend strip */}
              <div
                className="px-5 py-2.5 flex items-center gap-3 text-[10px] font-medium border-t"
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
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-5 text-center text-[11px]" style={{ borderTop: `1px solid ${SLATE}`, background: "#fff", color: MUTED }}>
        Rhino Ventures · rhinovc.com · For informational purposes only. Not financial or legal advice.
      </footer>
    </div>
  );
};

export default OptionModeller;
