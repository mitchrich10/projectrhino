import { FC } from "react";
import { Baby, Dog, Activity, TrendingUp, Shield, Calculator } from "lucide-react";

const healthcareVerticals = [
  { icon: Baby, industry: "Fertility", producer: "Reproductive Endocrinologist", angle: -120 },
  { icon: Dog, industry: "Veterinary", producer: "Doctor of Veterinary Medicine", angle: -180 },
  { icon: Activity, industry: "Physical Therapy", producer: "Physiotherapist", angle: -240 },
];

const financeVerticals = [
  { icon: Calculator, industry: "Accounting", producer: "Chartered Professional Accountant", angle: -60 },
  { icon: TrendingUp, industry: "Wealth Mgmt", producer: "Wealth Advisor", angle: 0 },
  { icon: Shield, industry: "Insurance", producer: "Insurance Broker", angle: 60 },
];

const allVerticals = [...healthcareVerticals, ...financeVerticals];

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-secondary via-secondary to-background overflow-hidden">
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
        <div className="hidden lg:block relative mx-auto" style={{ width: '800px', height: '800px' }}>
          
          {/* Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Large radial gradient */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-radial from-primary/5 via-transparent to-transparent" />
            {/* Decorative rings */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-border/10" />
          </div>

          {/* SVG for Connecting Lines and Arc Labels */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
            <defs>
              {/* Healthcare gradient - teal/emerald */}
              <linearGradient id="healthcareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(170, 50%, 45%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(170, 50%, 45%)" stopOpacity="0.1" />
              </linearGradient>
              {/* Finance gradient - indigo/blue */}
              <linearGradient id="financeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(220, 60%, 50%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(220, 60%, 50%)" stopOpacity="0.1" />
              </linearGradient>
              {/* Glow filters */}
              <filter id="glowHealthcare" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowFinance" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Healthcare connecting lines */}
            {healthcareVerticals.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 280;
              const centerX = 400;
              const centerY = 400;
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
                  filter="url(#glowHealthcare)"
                />
              );
            })}

            {/* Finance connecting lines */}
            {financeVerticals.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 280;
              const centerX = 400;
              const centerY = 400;
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
                  filter="url(#glowFinance)"
                />
              );
            })}


            {/* Outer ring suggesting more */}
            <circle
              cx="400"
              cy="400"
              r="360"
              fill="none"
              stroke="hsl(var(--border) / 0.15)"
              strokeWidth="1"
              strokeDasharray="6 10"
            />
          </svg>

          {/* Central Hub - Layered with depth */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            {/* Outer glow ring */}
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            {/* Middle ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
            {/* Main hub */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-card via-card to-card/90 border-2 border-primary shadow-xl shadow-primary/20 ring-4 ring-primary/10 flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Examples</span>
              <span className="text-sm font-black uppercase tracking-tight text-foreground leading-tight">Across Industries</span>
            </div>
          </div>

          {/* Radiating Spokes - Healthcare */}
          {healthcareVerticals.map((item, idx) => {
            const Icon = item.icon;
            const angleRad = (item.angle * Math.PI) / 180;
            const radius = 280;
            const x = 400 + radius * Math.cos(angleRad);
            const y = 400 + radius * Math.sin(angleRad);
            
            return (
              <div
                key={`health-spoke-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <div className="flex flex-col items-center bg-card/85 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 border-t-white/20 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 w-[180px] min-h-[180px]">
                  {/* Category badge */}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-2">
                    Healthcare
                  </span>
                  {/* Icon with teal accent */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner mb-3">
                    <Icon className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Industry - smaller context */}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {item.industry}
                  </span>
                  {/* Producer Role - prominent */}
                  <span className="text-sm font-bold text-foreground text-center leading-tight max-w-[160px]">
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
            const radius = 280;
            const x = 400 + radius * Math.cos(angleRad);
            const y = 400 + radius * Math.sin(angleRad);
            
            return (
              <div
                key={`finance-spoke-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <div className="flex flex-col items-center bg-card/85 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 border-t-white/20 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 w-[180px] min-h-[180px]">
                  {/* Category badge */}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full mb-2">
                    Finance
                  </span>
                  {/* Icon with blue accent */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center shadow-inner mb-3">
                    <Icon className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Industry - smaller context */}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {item.industry}
                  </span>
                  {/* Producer Role - prominent */}
                  <span className="text-sm font-bold text-foreground text-center leading-tight max-w-[160px]">
                    {item.producer}
                  </span>
                </div>
              </div>
            );
          })}

          {/* "And More" dots around the outer edge */}
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle, idx) => {
            const angleRad = (angle * Math.PI) / 180;
            const radius = 370;
            const x = 400 + radius * Math.cos(angleRad);
            const y = 400 + radius * Math.sin(angleRad);
            return (
              <div
                key={idx}
                className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/25 -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              />
            );
          })}
        </div>

        {/* Mobile/Tablet Layout - Enhanced with depth */}
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
                    className="flex flex-col items-center text-center p-4 bg-card/85 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-border/50 border-t-white/20"
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
                    className="flex flex-col items-center text-center p-4 bg-card/85 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-border/50 border-t-white/20"
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
