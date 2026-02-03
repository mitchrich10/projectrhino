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
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Three Card Layout */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0">
          {/* PE Card - Left */}
          <div className="lg:w-1/4 bg-slate-950/60 rounded-lg p-6 order-2 lg:order-1">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wide text-slate-500 mb-6 text-center">
              Traditional PE
            </h3>
            <ul className="space-y-4">
              {comparisons.map((row, idx) => (
                <li key={idx} className="text-xs md:text-sm text-slate-500 text-center">
                  {row.pe}
                </li>
              ))}
            </ul>
          </div>

          {/* VS Badge - Left */}
          <div className="hidden lg:flex items-center justify-center -mx-3 z-10 order-2">
            <span className="bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-black text-slate-400 rounded-full">
              VS
            </span>
          </div>

          {/* Rhino Card - Center (Hero) */}
          <div className="lg:w-2/4 bg-slate-800 border-t-4 border-primary shadow-lg shadow-primary/10 rounded-lg p-8 order-1 lg:order-3">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-wide text-primary mb-8 text-center">
              Rhino
            </h3>
            <ul className="space-y-5">
              {comparisons.map((row, idx) => (
                <li key={idx} className="text-sm md:text-base text-primary font-bold text-center">
                  {row.rhino}
                </li>
              ))}
            </ul>
          </div>

          {/* VS Badge - Right */}
          <div className="hidden lg:flex items-center justify-center -mx-3 z-10 order-4">
            <span className="bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-black text-slate-400 rounded-full">
              VS
            </span>
          </div>

          {/* VC Card - Right */}
          <div className="lg:w-1/4 bg-slate-950/60 rounded-lg p-6 order-3 lg:order-5">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-wide text-slate-500 mb-6 text-center">
              Venture Capital
            </h3>
            <ul className="space-y-4">
              {comparisons.map((row, idx) => (
                <li key={idx} className="text-xs md:text-sm text-slate-500 text-center">
                  {row.vc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile VS indicators */}
        <div className="flex lg:hidden justify-center gap-4 my-4 order-2">
          <span className="bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-black text-slate-400 rounded-full">
            VS
          </span>
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
