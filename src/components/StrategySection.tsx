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
    title: "FLEXIBLE INVESTMENTS", 
    desc: "$2M-$10M first cheques. Backing founders from inception through growth—organic expansion or acquisition-led strategies.", 
    icon: <DollarSign className="w-5 h-5" /> 
  },
  { 
    title: "DURABLE BUSINESS MODELS", 
    desc: "We partner with businesses built to generate real cash flow and endure over time — and are comfortable investing before profitability.", 
    icon: <Layers className="w-5 h-5" /> 
  }
];

const StrategySection: FC = () => {
  return (
    <section id="strategy" className="py-20 px-6 bg-gradient-to-b from-background via-background to-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Where We Partner */}
        <div className="border-2 border-border/60 bg-card/80 backdrop-blur-sm p-10 md:p-14">
          <div className="mb-10">
            <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground mb-4">
              Where We <span className="text-primary">Partner</span>
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              From building new platforms to partnering in established companies. We work closely with operators looking to buy or scale businesses and take them to the next stage of growth.
            </p>
          </div>

          {/* Strategy Tiles */}
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
      </div>
    </section>
  );
};

export { StrategySection };
