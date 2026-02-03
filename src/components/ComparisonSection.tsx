import { FC } from "react";

const comparisons = [
  {
    pe: "Financial optimization first",
    rhino: "Business fundamentals first",
  },
  {
    pe: "Leverage and cost-cutting drive returns",
    rhino: "Organic growth before financial engineering",
  },
  {
    pe: "Shorter time horizons",
    rhino: "Long-term partners, not exit timers",
  },
  {
    pe: "Low tolerance for experimentation",
    rhino: "Encourage experimentation and iteration, followed by disciplined optimization",
  },
];

const ComparisonSection: FC = () => {
  const midIndex = Math.floor(comparisons.length / 2);

  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_4rem_1fr] md:grid-cols-[1fr_6rem_1fr] items-center mb-8">
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-slate-500 text-right pr-4">
            Traditional PE
          </h2>
          <div />
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-primary text-left pl-4">
            Rhino
          </h2>
        </div>

        {/* Comparison Rows */}
        <div className="relative">
          {/* Vertical line through center */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700 -translate-x-1/2" />

          {comparisons.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_4rem_1fr] md:grid-cols-[1fr_6rem_1fr] items-center py-4 md:py-5"
            >
              {/* PE Side */}
              <p className="text-sm md:text-lg text-slate-500 line-through decoration-slate-600 text-right pr-4">
                {row.pe}
              </p>

              {/* VS in middle row only */}
              <div className="flex items-center justify-center">
                {idx === midIndex && (
                  <span className="bg-slate-900 px-2 py-1 text-lg md:text-xl font-black text-white z-10">
                    VS
                  </span>
                )}
              </div>

              {/* Rhino Side */}
              <p className="text-sm md:text-lg text-white font-semibold text-left pl-4">
                {row.rhino}
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
