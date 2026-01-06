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
    <section id="strategy" className="py-32 px-6 bg-gradient-to-b from-secondary via-background to-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
            Fewer Investments.<br />Deeper Conviction.
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {strategyItems.map((item, i) => (
            <StatCard 
              key={i}
              title={item.title}
              description={item.desc}
              icon={item.icon}
            />
          ))}
        </div>

        {/* How We Invest */}
        <div className="border-2 border-border/60 bg-card/80 p-12">
          <h4 className="text-xs font-bold uppercase tracking-ultra text-primary mb-6">
            Where We Partner
          </h4>
          
          <div className="space-y-6 max-w-3xl">
            <p className="text-muted-foreground text-sm leading-relaxed">
              We invest across the business lifecycle — from building new platforms to partnering in established companies. We work closely with operators looking to build, buy, or scale businesses and take them to the next stage of growth.
            </p>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              This includes partnering with entrepreneurs by acquisition, industry operators stepping into ownership, and founders seeking a long-term capital partner to help professionalize and scale.
            </p>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              We move with urgency and conviction, typically completing diligence and making decisions within four weeks.
            </p>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Capital is only useful if it comes with judgment. Post-investment, we actively support our partners through key inflection points, including strategy development, hiring, systems, capital planning, and acquisitions.
            </p>
            
            <p className="text-foreground text-sm font-semibold mt-8 border-l-2 border-primary pl-4">
              We invest with the mindset of long-term owners, not short-term capital.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { StrategySection };
