import { FC } from "react";
import { Target, Shield, DollarSign, Layers } from "lucide-react";
import { StatCard } from "./StatCard";

const strategyItems = [
  { 
    title: "6-8 COMPANIES", 
    desc: "Concentrated capital. We double down on winners.", 
    icon: <Target className="w-5 h-5" /> 
  },
  { 
    title: "ALIGNED STRUCTURES", 
    desc: "Minority or majority partners. Designed for the long-term.", 
    icon: <Shield className="w-5 h-5" /> 
  },
  { 
    title: "$2M - $10M FIRST CHEQUE", 
    desc: "We can invest at inception, organic growth capital, or acquisition-led strategies.", 
    icon: <DollarSign className="w-5 h-5" /> 
  },
  { 
    title: "FIRST PARTNER", 
    desc: "Comfortable being the first and only institutional partner.", 
    icon: <Layers className="w-5 h-5" /> 
  }
];

const StrategySection: FC = () => {
  return (
    <section id="strategy" className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
            Fewer Investments.<br />Deeper Conviction.
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategyItems.map((item, i) => (
            <StatCard 
              key={i}
              title={item.title}
              description={item.desc}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { StrategySection };
