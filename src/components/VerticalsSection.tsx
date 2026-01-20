import { FC } from "react";
import { Baby, Dog, Activity, TrendingUp, Shield, Calculator } from "lucide-react";

const healthcareVerticals = [
  { icon: Baby, industry: "Fertility", producer: "Reproductive Endocrinologist", angle: 150 },
  { icon: Dog, industry: "Veterinary", producer: "Doctor of Veterinary Medicine", angle: 180 },
  { icon: Activity, industry: "Physical Therapy", producer: "Physiotherapist", angle: 210 },
];

const financeVerticals = [
  { icon: Calculator, industry: "Accounting", producer: "Chartered Professional Accountant", angle: 330 },
  { icon: TrendingUp, industry: "Wealth Mgmt", producer: "Wealth Advisor", angle: 0 },
  { icon: Shield, industry: "Insurance", producer: "Insurance Broker", angle: 30 },
];

const allVerticals = [...healthcareVerticals, ...financeVerticals];

const VerticalsSection: FC = () => {
  const centerX = 400;
  const centerY = 400;
  const radius = 260;

  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-secondary via-secondary to-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            <span className="text-primary">Producer</span> Businesses
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            Producers are the experts whose work directly drives a company's revenue, margins, and growth.
          </p>
        </div>

        {/* Radial Diagram - Desktop */}
        <div className="hidden lg:block relative mx-auto" style={{ width: '800px', height: '800px' }}>
          
          {/* Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Decorative rings */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-border/10" />
          </div>

          {/* SVG for Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
            <defs>
              {/* Healthcare gradient - teal/emerald */}
              <linearGradient id="healthcareGradient" x1="50%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="hsl(160, 45%, 40%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(160, 45%, 40%)" stopOpacity="0.2" />
              </linearGradient>
              {/* Finance gradient - indigo/blue */}
              <linearGradient id="financeGradient" x1="50%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="hsl(220, 60%, 50%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(220, 60%, 50%)" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Healthcare connecting lines */}
            {healthcareVerticals.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const x = centerX + radius * Math.cos(angleRad);
              const y = centerY + radius * Math.sin(angleRad);
              return (
                <line
                  key={`health-${idx}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="url(#healthcareGradient)"
                  strokeWidth="2"
                />
              );
            })}

            {/* Finance connecting lines */}
            {financeVerticals.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const x = centerX + radius * Math.cos(angleRad);
              const y = centerY + radius * Math.sin(angleRad);
              return (
                <line
                  key={`finance-${idx}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="url(#financeGradient)"
                  strokeWidth="2"
                />
              );
            })}

            {/* Outer ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r="340"
              fill="none"
              stroke="hsl(var(--border) / 0.15)"
              strokeWidth="1"
              strokeDasharray="6 10"
            />
          </svg>

          {/* Category Labels - Healthcare (left) */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20">
            <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-500/30 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Healthcare</span>
            </div>
          </div>

          {/* Category Labels - Finance (right) */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
            <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Finance</span>
            </div>
          </div>

          {/* Central Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-card via-card to-card/90 border-2 border-primary shadow-xl shadow-primary/20 ring-4 ring-primary/10 flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Examples</span>
              <span className="text-sm font-black uppercase tracking-tight text-foreground leading-tight">Across Industries</span>
            </div>
          </div>

          {/* Radiating Spokes - Healthcare */}
          {healthcareVerticals.map((item, idx) => {
            const Icon = item.icon;
            const angleRad = (item.angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(angleRad);
            const y = centerY + radius * Math.sin(angleRad);
            
            return (
              <div
                key={`health-spoke-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <div className="w-[180px] h-[140px] flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 border-t-white/20 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner mb-2">
                    <Icon className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {item.industry}
                  </span>
                  <span className="text-xs font-bold text-foreground text-center leading-tight">
                    {item.producer}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Radiating Spokes - Finance */}
          {financeVerticals.map((item, idx) => {
            const Icon = item.icon;
            const angleRad = (item.angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(angleRad);
            const y = centerY + radius * Math.sin(angleRad);
            
            return (
              <div
                key={`finance-spoke-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <div className="w-[180px] h-[140px] flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 border-t-white/20 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/40 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center shadow-inner mb-2">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {item.industry}
                  </span>
                  <span className="text-xs font-bold text-foreground text-center leading-tight">
                    {item.producer}
                  </span>
                </div>
              </div>
            );
          })}

          {/* "And More" dots */}
          {[60, 90, 120, 240, 270, 300].map((angle, idx) => {
            const angleRad = (angle * Math.PI) / 180;
            const dotRadius = 350;
            const x = centerX + dotRadius * Math.cos(angleRad);
            const y = centerY + dotRadius * Math.sin(angleRad);
            return (
              <div
                key={idx}
                className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/30 -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              />
            );
          })}
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          {/* Healthcare Section */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-emerald-500/30" />
              Healthcare
              <span className="w-8 h-px bg-emerald-500/30" />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {healthcareVerticals.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center text-center p-4 bg-card/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-border/50 border-t-white/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner mb-3">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      {item.industry}
                    </span>
                    <span className="text-sm font-bold text-foreground leading-tight">
                      {item.producer}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finance Section */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-blue-500/30" />
              Finance
              <span className="w-8 h-px bg-blue-500/30" />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {financeVerticals.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center text-center p-4 bg-card/90 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-border/50 border-t-white/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center shadow-inner mb-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      {item.industry}
                    </span>
                    <span className="text-sm font-bold text-foreground leading-tight">
                      {item.producer}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest">
            And many more...
          </p>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
