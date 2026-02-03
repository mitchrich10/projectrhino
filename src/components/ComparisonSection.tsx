import { FC } from "react";

const comparisons = [
  {
    pe: "Focused on financial optimization",
    rhino: "Focused exclusively on efficiently scaling Producer businesses",
    vc: "Growth prioritized above all else",
  },
  {
    pe: "Leverage and operating cost reductions drive returns",
    rhino: "Target organic growth drivers, with selective inorganic expansion opportunities",
    vc: "Binary outcomes: unicorn or bust",
  },
  {
    pe: "Short holding periods",
    rhino: "Long-term partners, not exit manufacturers",
    vc: "Built for winner-take-all markets",
  },
  {
    pe: "Limited tolerance for experimentation",
    rhino: "Encourage experimentation; comfortable investing pre-profitability",
    vc: "Focused on venture-stage conversion and scale",
  },
];

const ComparisonSection: FC = () => {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-12 md:mb-16 uppercase tracking-wide">
          How We're Different
        </h2>

        {/* Mobile Layout - Stacked Cards */}
        <div className="md:hidden space-y-6">
          {/* Rhino Card - Hero */}
          <div className="bg-white rounded-xl p-6 border-4 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <h3 className="text-2xl font-black uppercase tracking-wider text-primary text-center mb-4">
              Rhino
            </h3>
            <div className="space-y-3">
              {comparisons.map((row, idx) => (
                <p key={idx} className="text-sm text-slate-900 font-medium text-center leading-snug py-2 border-b border-slate-200 last:border-b-0">
                  {row.rhino}
                </p>
              ))}
            </div>
          </div>

          {/* PE vs VC side by side on mobile */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                Private Equity
              </h4>
              <div className="space-y-2">
                {comparisons.map((row, idx) => (
                  <p key={idx} className="text-[10px] text-slate-300 text-center leading-tight py-2 border-b border-slate-600/50 last:border-b-0">
                    {row.pe}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                Venture Capital
              </h4>
              <div className="space-y-2">
                {comparisons.map((row, idx) => (
                  <p key={idx} className="text-[10px] text-slate-300 text-center leading-tight py-2 border-b border-slate-600/50 last:border-b-0">
                    {row.vc}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - 5 Column Grid */}
        <div className="hidden md:block">
          {/* Header Row */}
          <div className="grid grid-cols-[2fr_auto_3fr_auto_2fr] gap-4 mb-2">
            <div className="flex items-end justify-center pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Private Equity
              </h3>
            </div>
            <div className="w-10" />
            <div className="bg-primary rounded-t-xl py-5 px-4 shadow-lg shadow-primary/40">
              <h3 className="text-2xl font-black uppercase tracking-wider text-white text-center">
                Rhino
              </h3>
            </div>
            <div className="w-10" />
            <div className="flex items-end justify-center pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Venture Capital
              </h3>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="grid grid-cols-[2fr_auto_3fr_auto_2fr] gap-4">
            {comparisons.map((row, idx) => (
              <div key={idx} className="contents">
                {/* PE */}
                <div className={`flex items-stretch p-4 bg-slate-600/40 ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === comparisons.length - 1 ? 'rounded-b-lg' : ''}`}>
                  <p className="text-sm text-slate-300 text-center leading-tight flex items-center justify-center w-full">
                    {row.pe}
                  </p>
                </div>

                {/* VS Left */}
                <div className="flex items-center justify-center w-10">
                  <span className="text-xs font-black text-slate-400">VS</span>
                </div>

                {/* Rhino - Elevated with depth */}
                <div className="bg-white p-6 border-x-4 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)] relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <p className="text-base text-slate-900 font-bold text-center leading-snug relative z-10">
                    {row.rhino}
                  </p>
                </div>

                {/* VS Right */}
                <div className="flex items-center justify-center w-10">
                  <span className="text-xs font-black text-slate-400">VS</span>
                </div>

                {/* VC */}
                <div className={`flex items-stretch p-4 bg-slate-600/40 ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === comparisons.length - 1 ? 'rounded-b-lg' : ''}`}>
                  <p className="text-sm text-slate-300 text-center leading-tight flex items-center justify-center w-full">
                    {row.vc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rhino card bottom cap */}
          <div className="grid grid-cols-[2fr_auto_3fr_auto_2fr] gap-4">
            <div />
            <div className="w-10" />
            <div className="bg-primary h-4 rounded-b-xl shadow-[0_10px_30px_rgba(59,130,246,0.4)]" />
            <div className="w-10" />
            <div />
          </div>
        </div>

        {/* Closing Statement */}
        <p className="text-lg md:text-2xl text-white text-center font-medium mt-16 max-w-3xl mx-auto leading-relaxed">
          "We're not here to optimize your business for a quick sale.
          <br />
          <span className="text-primary font-bold">We're here to help you build one that lasts.</span>"
        </p>
      </div>
    </section>
  );
};

export { ComparisonSection };
