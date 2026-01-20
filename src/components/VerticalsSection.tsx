import { FC } from "react";
import { Baby, Dog, Activity, TrendingUp, Shield, Calculator } from "lucide-react";

const verticals = [
  { icon: Baby, industry: "Fertility", producer: "Reproductive Endocrinologist", angle: -60 },
  { icon: Dog, industry: "Veterinary", producer: "Doctor of Veterinary Medicine", angle: 0 },
  { icon: Activity, industry: "Physical Therapy", producer: "Physiotherapist", angle: 60 },
  { icon: Calculator, industry: "Accounting", producer: "Chartered Professional Accountant", angle: 120 },
  { icon: TrendingUp, industry: "Wealth Mgmt", producer: "Wealth Advisor", angle: 180 },
  { icon: Shield, industry: "Insurance", producer: "Insurance Broker", angle: 240 },
];

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-secondary via-secondary to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            <span className="text-primary">Producer</span> Businesses
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            Producers are the experts whose work directly drives a company's revenue, margins, and growth.
          </p>
        </div>

        {/* Radial Diagram - Desktop */}
        <div className="hidden lg:block relative mx-auto" style={{ width: '700px', height: '700px' }}>
          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 700">
            {verticals.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 250;
              const centerX = 350;
              const centerY = 350;
              const x = centerX + radius * Math.cos(angleRad);
              const y = centerY + radius * Math.sin(angleRad);
              return (
                <line
                  key={idx}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}
            {/* Outer ring suggesting more */}
            <circle
              cx="350"
              cy="350"
              r="290"
              fill="none"
              stroke="hsl(var(--primary) / 0.1)"
              strokeWidth="1"
              strokeDasharray="8 12"
            />
          </svg>

          {/* Central Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-44 h-44 rounded-full bg-card/95 border-2 border-primary shadow-lg shadow-primary/20 flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Examples</span>
              <span className="text-sm font-black uppercase tracking-tight text-foreground leading-tight">Across Industries</span>
            </div>
          </div>

          {/* Radiating Spokes */}
          {verticals.map((item, idx) => {
            const Icon = item.icon;
            const angleRad = (item.angle * Math.PI) / 180;
            const radius = 250;
            const x = 350 + radius * Math.cos(angleRad);
            const y = 350 + radius * Math.sin(angleRad);
            
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-card/90 border-2 border-border/60 flex items-center justify-center shadow-sm group-hover:border-primary/60 group-hover:shadow-md group-hover:shadow-primary/10 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="mt-3 text-xs font-black uppercase tracking-widest text-foreground whitespace-nowrap">
                    {item.industry}
                  </span>
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1 text-[10px] text-muted-foreground max-w-[140px] text-center leading-tight">
                    {item.producer}
                  </span>
                </div>
              </div>
            );
          })}

          {/* "And More" dots around the outer edge */}
          {[30, 90, 150, 210, 270, 330].map((angle, idx) => {
            const angleRad = (angle * Math.PI) / 180;
            const radius = 310;
            const x = 350 + radius * Math.cos(angleRad);
            const y = 350 + radius * Math.sin(angleRad);
            return (
              <div
                key={idx}
                className="absolute w-2 h-2 rounded-full bg-muted-foreground/30 -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              />
            );
          })}
        </div>

        {/* Mobile/Tablet Layout - Simpler 2x3 Grid */}
        <div className="lg:hidden">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold text-center mb-6">
            Examples across industries
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {verticals.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-card/90 border-2 border-border/60 flex items-center justify-center shadow-sm group-hover:border-primary/60 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="mt-2 text-xs font-black uppercase tracking-widest text-foreground">
                    {item.industry}
                  </span>
                  <span className="mt-1 text-[10px] text-muted-foreground leading-tight">
                    {item.producer}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-6 uppercase tracking-widest">
            And many more...
          </p>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
