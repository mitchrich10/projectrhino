import { FC } from "react";
import { Baby, Dog, Activity, TrendingUp, Shield, Calculator, Users } from "lucide-react";

type Category = "Healthcare" | "Finance" | "Enterprise";

interface Vertical {
  icon: typeof Baby;
  industry: string;
  producer: string;
  category: Category;
}

const categoryColors: Record<Category, { badge: string; iconBg: string; iconBorder: string; iconText: string; hoverBorder: string; lineColor: string }> = {
  Healthcare: {
    badge: "text-emerald-600 bg-emerald-500/10",
    iconBg: "from-emerald-500/20 to-teal-500/10",
    iconBorder: "border-emerald-500/30",
    iconText: "text-emerald-600",
    hoverBorder: "hover:border-emerald-500/30",
    lineColor: "hsl(170, 50%, 45%)",
  },
  Finance: {
    badge: "text-blue-600 bg-blue-500/10",
    iconBg: "from-blue-500/20 to-indigo-500/10",
    iconBorder: "border-blue-500/30",
    iconText: "text-blue-600",
    hoverBorder: "hover:border-blue-500/30",
    lineColor: "hsl(220, 60%, 50%)",
  },
  Enterprise: {
    badge: "text-amber-600 bg-amber-500/10",
    iconBg: "from-amber-500/20 to-orange-500/10",
    iconBorder: "border-amber-500/30",
    iconText: "text-amber-600",
    hoverBorder: "hover:border-amber-500/30",
    lineColor: "hsl(35, 70%, 50%)",
  },
};

// All verticals - will be distributed around the circle
const allVerticals: Vertical[] = [
  { icon: Baby, industry: "Fertility", producer: "Reproductive Endocrinologist", category: "Healthcare" },
  { icon: Calculator, industry: "Accounting", producer: "Chartered Professional Accountant", category: "Finance" },
  { icon: Users, industry: "People Services", producer: "Specialized Recruiter", category: "Enterprise" },
  { icon: Dog, industry: "Veterinary", producer: "Doctor of Veterinary Medicine", category: "Healthcare" },
  { icon: TrendingUp, industry: "Wealth Mgmt", producer: "Wealth Advisor", category: "Finance" },
  { icon: Activity, industry: "Physical Therapy", producer: "Physiotherapist", category: "Healthcare" },
  { icon: Shield, industry: "Insurance", producer: "Insurance Broker", category: "Finance" },
];

// Calculate angles for each vertical (evenly distributed)
const getAngle = (index: number, total: number) => (360 / total) * index - 90; // Start from top

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

          {/* SVG for Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 800 800">
            <defs>
              <filter id="glowLine" filterUnits="userSpaceOnUse" x="0" y="0" width="800" height="800">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connecting lines for all verticals */}
            {allVerticals.map((item, idx) => {
              const angle = getAngle(idx, allVerticals.length);
              const angleRad = (angle * Math.PI) / 180;
              const radius = 280;
              const centerX = 400;
              const centerY = 400;
              const x = centerX + radius * Math.cos(angleRad);
              const y = centerY + radius * Math.sin(angleRad);
              const colors = categoryColors[item.category];
              return (
                <line
                  key={`line-${idx}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={colors.lineColor}
                  strokeOpacity="0.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
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

          {/* Radiating Spokes - All Verticals */}
          {allVerticals.map((item, idx) => {
            const Icon = item.icon;
            const angle = getAngle(idx, allVerticals.length);
            const angleRad = (angle * Math.PI) / 180;
            const radius = 280;
            const x = 400 + radius * Math.cos(angleRad);
            const y = 400 + radius * Math.sin(angleRad);
            const colors = categoryColors[item.category];
            
            return (
              <div
                key={`spoke-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{ left: x, top: y }}
              >
                <div className={`flex flex-col items-center bg-card/85 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 border-t-white/20 hover:-translate-y-1 hover:shadow-xl ${colors.hoverBorder} transition-all duration-300 w-[180px] min-h-[180px]`}>
                  {/* Category badge */}
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${colors.badge} px-2 py-0.5 rounded-full mb-2`}>
                    {item.category}
                  </span>
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center shadow-inner mb-3`}>
                    <Icon className={`w-7 h-7 ${colors.iconText} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  {/* Industry - smaller context */}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {item.industry}
                  </span>
                  {/* Producer Role - prominent */}
                  <span className="text-sm font-bold text-foreground text-center leading-tight w-[160px] h-[36px] flex items-center justify-center">
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
                className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/25 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: x, top: y }}
              />
            );
          })}
        </div>

        {/* Mobile/Tablet Layout - Enhanced with depth */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {allVerticals.map((item, idx) => {
              const Icon = item.icon;
              const colors = categoryColors[item.category];
              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center text-center p-4 bg-card/85 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-border/50 border-t-white/20"
                >
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${colors.badge} px-2 py-0.5 rounded-full mb-2`}>
                    {item.category}
                  </span>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center shadow-inner mb-3`}>
                    <Icon className={`w-6 h-6 ${colors.iconText}`} />
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

          <p className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest">
            And many more...
          </p>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
