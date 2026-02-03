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
  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 mb-8 px-4">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-500 text-right">
            Traditional PE
          </h2>
          <div className="w-16 md:w-24" />
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-primary text-left">
            Rhino
          </h2>
        </div>

        {/* Comparison Content with VS in middle */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 px-4">
          {/* PE Column */}
          <div className="flex flex-col justify-center space-y-6">
            {comparisons.map((row, idx) => (
              <p
                key={idx}
                className="text-sm md:text-lg text-slate-500 line-through decoration-slate-600 text-right"
              >
                {row.pe}
              </p>
            ))}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="h-full w-px bg-slate-700 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 py-4 text-xl md:text-2xl font-black text-white">
                VS
              </span>
            </div>
          </div>

          {/* Rhino Column */}
          <div className="flex flex-col justify-center space-y-6">
            {comparisons.map((row, idx) => (
              <p
                key={idx}
                className="text-sm md:text-lg text-white font-semibold text-left"
              >
                {row.rhino}
              </p>
            ))}
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
