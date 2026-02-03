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
    rhino: "Support founders experiment and iterate, then optimize",
  },
];

const ComparisonSection: FC = () => {
  return (
    <section className="py-20 px-6 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-2 gap-4 md:gap-12 mb-12 px-4">
          <div className="text-right">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-500">
              Traditional PE
            </h2>
          </div>
          <div className="text-left">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-primary">
              Rhino
            </h2>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="space-y-0">
          {comparisons.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-2 gap-4 md:gap-12 items-center py-5 px-4 border-b border-slate-700"
            >
              {/* PE Side - muted, struck through */}
              <div className="text-right">
                <p className="text-sm md:text-lg text-slate-500 line-through decoration-slate-600">
                  {row.pe}
                </p>
              </div>
              {/* Rhino Side - bold, white */}
              <div className="text-left">
                <p className="text-sm md:text-lg text-white font-semibold">
                  {row.rhino}
                </p>
              </div>
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
