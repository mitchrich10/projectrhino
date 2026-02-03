import { FC } from "react";

const traditionalPE = [
  "Financial optimization first",
  "Leverage and cost-cutting drive returns",
  "Shorter time horizons",
  "Low tolerance for experimentation or temporary losses",
];

const rhinoApproach = [
  "Business fundamentals first",
  "Organic growth before financial engineering",
  "Long-term partners, not exit timers",
  "Comfortable investing through uncertainty, learning, and iteration",
];

const ComparisonSection: FC = () => {
  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-center mb-12">
          Private Equity <span className="text-primary">vs.</span> Rhino
        </h2>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Traditional PE Column */}
          <div className="bg-slate-100 border border-slate-200 p-8 rounded-lg">
            <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground mb-6">
              Traditional Private Equity
            </h3>
            <ul className="space-y-4">
              {traditionalPE.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rhino Column */}
          <div className="bg-white border-l-4 border-primary p-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold uppercase tracking-wide text-foreground mb-6">
              Rhino
            </h3>
            <ul className="space-y-4">
              {rhinoApproach.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Closing Statement */}
        <p className="text-lg md:text-xl text-foreground text-center italic max-w-3xl mx-auto">
          "We're not here to optimize your business for a quick sale.
          <br />
          We're here to help you build one that lasts."
        </p>
      </div>
    </section>
  );
};

export { ComparisonSection };
