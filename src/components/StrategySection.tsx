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
            Fewer Investments.<br /><span className="text-primary">Deeper Conviction.</span>
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

        {/* Where We Partner */}
        <div className="border-2 border-border/60 bg-card/80 backdrop-blur-sm p-10 md:p-14">
          <div className="grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
            {/* Left column - Title */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-ultra text-primary mb-3">
                Where We Partner
              </h4>
              <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
                Across the<br />Business<br />Lifecycle
              </p>
            </div>
            
            {/* Right column - Content */}
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                From building new platforms to partnering in established companies. We work closely with operators looking to build, buy, or scale businesses and take them to the next stage of growth.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4 py-4">
                <div className="border-l-2 border-primary/40 pl-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Build</p>
                  <p className="text-xs text-muted-foreground">Starting a new platform or business from the ground up</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Buy</p>
                  <p className="text-xs text-muted-foreground">Acquiring an existing business and scaling it with the right capital partner</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Scale</p>
                  <p className="text-xs text-muted-foreground">Partnering with long-term capital to professionalize and grow an existing company</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-2">
                <div className="flex-1 bg-secondary/50 p-5 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Speed</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We move with urgency and conviction, typically completing diligence and making decisions within four weeks.
                  </p>
                </div>
                <div className="flex-1 bg-secondary/50 p-5 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Partnership</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Capital is only useful if it comes with judgment. We actively support partners through strategy, hiring, systems, and acquisitions.
                  </p>
                </div>
              </div>
              
              <p className="text-foreground font-semibold text-base mt-6 border-l-2 border-primary pl-4">
                We invest with the mindset of long-term owners, not short-term capital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { StrategySection };
