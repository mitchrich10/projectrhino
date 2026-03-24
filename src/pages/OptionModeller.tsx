import { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

function calcVestedOptions(totalOptions: number, grantDateStr: string, todayStr: string): number {
  if (!grantDateStr || !todayStr || totalOptions <= 0) return 0;
  const grant = new Date(grantDateStr);
  const now = new Date(todayStr);
  const diffMs = now.getTime() - grant.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375);

  if (diffMonths < 12) return 0; // cliff not hit

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

// ── NumberInput ───────────────────────────────────────────────────────────────

const NumberInput: FC<{
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, prefix, placeholder = "0", className = "" }) => (
  <div className={`flex items-center border border-border rounded bg-card focus-within:border-primary transition-colors ${className}`}>
    {prefix && <span className="pl-3 text-sm text-muted-foreground select-none">{prefix}</span>}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
    />
  </div>
);

// ── ValuationInput (yellow editable cells) ────────────────────────────────────

const ValuationInput: FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter $"
    style={{ backgroundColor: "#FFFDE7", borderColor: "#F9A825" }}
    className="w-full rounded px-2 py-1.5 text-sm text-foreground outline-none border transition-colors focus:ring-1"
  />
);

// ── Tooltip ───────────────────────────────────────────────────────────────────

const Tooltip: FC<{ text: string }> = ({ text }) => (
  <span className="group relative ml-1">
    <Info className="w-3 h-3 text-muted-foreground inline cursor-help" />
    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-5 w-48 rounded bg-foreground text-background text-[10px] px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 leading-snug text-center">
      {text}
    </span>
  </span>
);

// ── Main Component ────────────────────────────────────────────────────────────

const OptionModeller: FC = () => {
  // Section 1 — My Grant
  const [totalOptions, setTotalOptions] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [fullyDiluted, setFullyDiluted] = useState("");
  const [grantDate, setGrantDate] = useState("");
  const [todayDate, setTodayDate] = useState(today());

  // Section 2 — custom valuations keyed by scenario id
  const [customVals, setCustomVals] = useState<Record<string, string>>({
    conservative: "25000000",
    moderate: "75000000",
    strong: "150000000",
    exceptional: "300000000",
    custom: "",
  });

  const setCustomVal = (id: string, v: string) =>
    setCustomVals((prev) => ({ ...prev, [id]: v }));

  // ── Derived —
  const total = parseFloat(totalOptions) || 0;
  const strike = parseFloat(strikePrice) || 0;
  const diluted = parseFloat(fullyDiluted) || 0;

  const ownershipPct = diluted > 0 ? (total / diluted) * 100 : 0;
  const vestedOptions = calcVestedOptions(total, grantDate, todayDate);
  const monthsVested = calcMonthsVested(grantDate, todayDate);

  // Base valuation = strike × diluted shares
  const baseValuation = strike * diluted;

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
        const gainPerOption = Math.max(0, impliedSharePrice - strike);
        const vestedValue = gainPerOption * vestedOptions;
        const fullGrantValue = gainPerOption * total;
        const multiple = strike > 0 ? impliedSharePrice / strike : 0;
        return { ...row, valuation, impliedSharePrice, gainPerOption, vestedValue, fullGrantValue, multiple };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalOptions, strikePrice, fullyDiluted, grantDate, todayDate, customVals]
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">
              Option Modeller
            </span>
            <Link
              to="/portal"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page title */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Resources · Equity</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Option Modeller</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Model the value of your stock option grant across exit scenarios. All figures in CAD.
            </p>
          </div>

          {/* ── Section 1 — My Grant ── */}
          <section className="mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground mb-5 pb-2 border-b border-border">
              Section 1 — My Grant
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Inputs */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Options Granted
                </label>
                <NumberInput value={totalOptions} onChange={setTotalOptions} placeholder="e.g. 50000" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Strike Price per Share (CAD $)
                </label>
                <NumberInput value={strikePrice} onChange={setStrikePrice} prefix="$" placeholder="e.g. 1.50" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Fully Diluted Shares Outstanding
                </label>
                <NumberInput value={fullyDiluted} onChange={setFullyDiluted} placeholder="e.g. 10000000" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Vesting Schedule
                </label>
                <div className="flex items-center h-[42px] border border-border rounded bg-secondary/40 px-3 text-sm text-muted-foreground">
                  4-year / 1-year cliff
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Grant Date
                </label>
                <input
                  type="date"
                  value={grantDate}
                  onChange={(e) => setGrantDate(e.target.value)}
                  className="w-full border border-border rounded bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Today's Date
                  <Tooltip text="Auto-filled to today. You can change this to model a future or past date." />
                </label>
                <input
                  type="date"
                  value={todayDate}
                  onChange={(e) => setTodayDate(e.target.value)}
                  className="w-full border border-border rounded bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Derived outputs */}
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg bg-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  % Ownership
                  <Tooltip text="Your options ÷ fully diluted shares outstanding." />
                </p>
                <p className="text-2xl font-black text-primary">
                  {diluted > 0 && total > 0 ? `${ownershipPct.toFixed(4)}%` : "—"}
                </p>
              </div>
              <div className="border border-border rounded-lg bg-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Vested Options Today
                  <Tooltip text="25% vests at 1-year cliff, remainder monthly over 36 months." />
                </p>
                <p className="text-2xl font-black text-primary">
                  {total > 0 && grantDate ? vestedOptions.toLocaleString() : "—"}
                </p>
              </div>
              <div className="border border-border rounded-lg bg-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Months Vested
                </p>
                <p className="text-2xl font-black text-primary">
                  {grantDate ? `${monthsVested}` : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 2 — Exit Scenario Modeller ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground mb-5 pb-2 border-b border-border">
              Section 2 — Exit Scenario Modeller
            </h2>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-foreground text-background">
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest w-44">
                      Scenario
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest w-40">
                      Company Valuation
                      <span className="font-normal normal-case tracking-normal text-background/60 ml-1">(CAD)</span>
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">
                      Implied Share Price
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">
                      Gain / Option
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">
                      Value of Vested
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">
                      Value of Full Grant
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">
                      Multiple on Strike
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((row, i) => {
                    const isBase = row.id === "base" || row.id === "two_x";
                    const isPositive = row.gainPerOption > 0;
                    const isCustom = row.id === "custom";

                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-border transition-colors ${
                          isBase ? "bg-secondary/50" : i % 2 === 0 ? "bg-card" : "bg-background"
                        } hover:bg-secondary/30`}
                      >
                        {/* Scenario */}
                        <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                          {row.label}
                          {isBase && (
                            <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">
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
                            <span className="text-muted-foreground font-mono text-xs">
                              {fmtValuation(row.valuation)}
                            </span>
                          )}
                        </td>

                        {/* Implied share price */}
                        <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                          {diluted > 0 && row.valuation > 0 ? fmtCAD(row.impliedSharePrice) : "—"}
                        </td>

                        {/* Gain per option */}
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className={isPositive ? "text-primary font-bold" : "text-muted-foreground"}>
                            {diluted > 0 && strike > 0 && row.valuation > 0 ? fmtCAD(row.gainPerOption) : "—"}
                          </span>
                        </td>

                        {/* Vested value */}
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className={isPositive && vestedOptions > 0 ? "text-primary font-bold" : "text-muted-foreground"}>
                            {strike > 0 && diluted > 0 && row.valuation > 0 ? fmtCAD(row.vestedValue) : "—"}
                          </span>
                        </td>

                        {/* Full grant value */}
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className={isPositive && total > 0 ? "text-primary font-bold" : "text-muted-foreground"}>
                            {strike > 0 && diluted > 0 && total > 0 && row.valuation > 0 ? fmtCAD(row.fullGrantValue) : "—"}
                          </span>
                        </td>

                        {/* Multiple */}
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className={isPositive ? "text-primary font-bold" : "text-muted-foreground"}>
                            {strike > 0 && diluted > 0 && row.valuation > 0 ? fmtMultiple(row.multiple) : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              <strong>Note:</strong> This tool is for illustrative purposes only. It does not account for taxes, dilution from future financing rounds, option pool top-ups, or liquidation preferences. Consult your legal and tax advisors before making financial decisions based on these estimates.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OptionModeller;
