import { FC } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Layers } from "lucide-react";
import { StatCard } from "./StatCard";

const strategyItems = [
  { 
    title: "FLEXIBLE INVESTMENTS", 
    desc: "$2M to $10M first cheques. Backing founders from inception through growth, typically first investing at pre-seed to Series A.", 
    icon: <DollarSign className="w-5 h-5" /> 
  },
  { 
    title: "DURABLE BUSINESS MODELS", 
    desc: "Path to cash flow generation, but comfortable investing pre-profitability.", 
    icon: <Layers className="w-5 h-5" /> 
  }
];

const overlookedItems = [
  {
    title: "Outside the consensus",
    desc: "You're building something real, but it isn't this year's theme, so most funds pass. We invest in businesses, not trends.",
  },
  {
    title: "Between fund mandates",
    desc: "Too early for private equity, wrong shape for the venture playbook. We underwrite the business, not the box it fits in.",
  },
  {
    title: "No track record required",
    desc: "First-time founders get passed over because most funds want someone else to go first. We're comfortable being first on the cap table.",
  },
];

const StrategySection: FC = () => {
  return (
    <section id="strategy" className="py-20 px-6 bg-gradient-to-b from-background via-background to-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Main Card */}
        <div className="border-2 border-border/50 bg-white/95 backdrop-blur-sm p-10 md:p-14 shadow-lg">
          {/* Where We Partner */}
          <div className="mb-10">
            <h5 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mb-4">
              Where We <span className="text-primary">Partner</span>
            </h5>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sector-agnostic investors, focused on identifying overlooked, underserved markets before they become consensus.
            </p>
          </div>

          {/* Strategy Tiles */}
          <div className="grid md:grid-cols-2 gap-4">
            {strategyItems.map((item, i) => (
              <StatCard 
                key={i}
                title={item.title}
                description={item.desc}
                icon={item.icon}
              />
            ))}
          </div>

          {/* What Overlooked Means */}
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              What are overlooked markets?
            </p>
            <div className="divide-y divide-border/60 border-t border-border/60">
              {overlookedItems.map((item, i) => (
                <div key={item.title} className="flex gap-5 py-5">
                  <span className="text-xl font-black text-primary/40 tabular-nums leading-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h6 className="text-base font-bold text-foreground mb-1">{item.title}</h6>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-foreground text-base md:text-lg font-bold leading-relaxed mt-8 text-center">
              Passed over by other funds? That's usually where we start.
            </p>
          </div>

          {/* Bottom Statement */}
          <p className="text-foreground text-base md:text-lg font-medium leading-relaxed mt-10 text-center italic">
            Exploring a different kind of capital partner for your business?{" "}
            <Link 
              to="/contact" 
              className="text-primary font-semibold hover:underline transition-all"
            >
              Let's talk.
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export { StrategySection };
