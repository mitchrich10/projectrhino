import { FC } from "react";
import { Target, Shield, Briefcase, Layers } from "lucide-react";
import { StatCard } from "./StatCard";
import vancouverSkyline from "@/assets/vancouver-skyline.jpg";

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
    title: "$2M - $10M", 
    desc: "Primary capital for organic growth or acquisition-led strategies.", 
    icon: <Briefcase className="w-5 h-5" /> 
  },
  { 
    title: "FIRST PARTNER", 
    desc: "Comfortable being the first and only institutional partner.", 
    icon: <Layers className="w-5 h-5" /> 
  }
];

const StrategySection: FC = () => {
  return (
    <section id="strategy" className="py-32 px-6 relative overflow-hidden">
      {/* Vancouver Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={vancouverSkyline} 
          alt="Vancouver skyline" 
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-4">
            Building out of Vancouver, investing across Canada
          </p>
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
