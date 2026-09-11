import { FC } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Layers } from "lucide-react";
import { StatCard } from "./StatCard";

const strategyItems = [
  { 
    title: "FLEXIBLE INVESTMENTS", 
    desc: "$2M to $10M first cheques. Backing founders from inception through growth, from pre-seed to Series A.", 
    icon: <DollarSign className="w-5 h-5" /> 
  },
  { 
    title: "DURABLE BUSINESS MODELS", 
    desc: "Path to cash flow generation, but comfortable investing pre-profitability.", 
    icon: <Layers className="w-5 h-5" /> 
  }
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
              We partner with ambitious builders from the earliest stages. Sector-agnostic investors, focused on identifying underserved, underloved markets before they become consensus.
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

          {/* Bottom Statement */}
          <p className="text-foreground text-base md:text-lg font-medium leading-relaxed mt-10 text-center italic">
            Exploring a capital partner for your business?{" "}
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
