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
  const midIndex = Math.floor(comparisons.length / 2);

  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_3rem_1fr_3rem_1fr] md:grid-cols-[1fr_4rem_1fr_4rem_1fr] items-center mb-8">
          <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-500 text-right pr-4">
            Traditional PE
          </h2>
          <div />
          <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-primary text-center">
            Rhino
          </h2>
          <div />
          <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-500 text-left pl-4">
            Venture Capital
          </h2>
        </div>

        {/* Comparison Rows */}
        <div className="relative">
          {/* Vertical lines at VS dividers */}
          <div className="absolute left-[20%] top-0 bottom-0 w-px bg-slate-700" />
          <div className="absolute right-[20%] top-0 bottom-0 w-px bg-slate-700" />

          {comparisons.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_3rem_1fr_3rem_1fr] md:grid-cols-[1fr_4rem_1fr_4rem_1fr] items-center py-4 md:py-5"
            >
              {/* PE Side */}
              <p className="text-xs md:text-base text-slate-500 line-through decoration-slate-600 text-right pr-4">
                {row.pe}
              </p>

              {/* VS left */}
              <div className="flex items-center justify-center">
                {idx === midIndex && (
                  <span className="bg-slate-900 px-1 py-1 text-sm md:text-lg font-black text-white z-10">
                    VS
                  </span>
                )}
              </div>

              {/* Rhino Side */}
              <p className="text-xs md:text-base text-primary font-semibold text-center px-2">
                {row.rhino}
              </p>

              {/* VS right */}
              <div className="flex items-center justify-center">
                {idx === midIndex && (
                  <span className="bg-slate-900 px-1 py-1 text-sm md:text-lg font-black text-white z-10">
                    VS
                  </span>
                )}
              </div>

              {/* VC Side */}
              <p className="text-xs md:text-base text-slate-500 line-through decoration-slate-600 text-left pl-4">
                {row.vc}
              </p>
            </div>
          ))}
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
