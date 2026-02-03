import { FC } from "react";

const comparisons = [
  {
    pe: "Financial optimization first",
    rhino: "Business fundamentals first",
    vc: "Growth and expansion prioritized early",
  },
  {
    pe: "Leverage and cost-cutting drive returns",
    rhino: "Organic growth before financial engineering",
    vc: "Rewards speed and ambition over efficiency",
  },
  {
    pe: "Shorter time horizons",
    rhino: "Long-term partners, not exit timers",
    vc: "Fund-cycle driven timelines tied to venture outcomes",
  },
  {
    pe: "Low tolerance for experimentation",
    rhino: "Encourage experimentation and iteration, followed by disciplined optimization",
    vc: "High tolerance for failure in pursuit of outsized wins",
  },
];

const ComparisonSection: FC = () => {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_auto_2fr_auto_1fr] gap-2 md:gap-4 mb-2">
          <div className="flex items-end justify-center pb-4">
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
              Traditional Private Equity
            </h3>
          </div>
          <div className="w-8 md:w-12" />
          <div className="bg-primary rounded-t-xl py-5 px-4 shadow-lg shadow-primary/40">
            <h3 className="text-lg md:text-2xl font-black uppercase tracking-wider text-white text-center">
              Rhino
            </h3>
          </div>
          <div className="w-8 md:w-12" />
          <div className="flex items-end justify-center pb-4">
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
              Venture Capital
            </h3>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="grid grid-cols-[1fr_auto_2fr_auto_1fr] gap-2 md:gap-4">
          {comparisons.map((row, idx) => (
            <div key={idx} className="contents">
              {/* PE */}
              <div className={`flex items-stretch p-3 md:p-4 bg-slate-600/40 ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === comparisons.length - 1 ? 'rounded-b-lg' : ''}`}>
                <p className="text-[10px] md:text-sm text-slate-300 text-center leading-tight flex items-center justify-center w-full">
                  {row.pe}
                </p>
              </div>

              {/* VS Left */}
              <div className="flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-black text-slate-400">VS</span>
              </div>

              {/* Rhino - Elevated with depth */}
              <div className="bg-white p-4 md:p-6 border-x-4 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)] relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <p className="text-xs md:text-base text-slate-900 font-bold text-center leading-snug relative z-10">
                  {row.rhino}
                </p>
              </div>

              {/* VS Right */}
              <div className="flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-black text-slate-400">VS</span>
              </div>

              {/* VC */}
              <div className={`flex items-stretch p-3 md:p-4 bg-slate-600/40 ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === comparisons.length - 1 ? 'rounded-b-lg' : ''}`}>
                <p className="text-[10px] md:text-sm text-slate-300 text-center leading-tight flex items-center justify-center w-full">
                  {row.vc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Rhino card bottom cap */}
        <div className="grid grid-cols-[1fr_auto_2fr_auto_1fr] gap-2 md:gap-4">
          <div />
          <div className="w-8 md:w-12" />
          <div className="bg-primary h-4 rounded-b-xl shadow-[0_10px_30px_rgba(59,130,246,0.4)]" />
          <div className="w-8 md:w-12" />
          <div />
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
