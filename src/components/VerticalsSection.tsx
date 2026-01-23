import { FC } from "react";
import { Baby, Dog, TrendingUp, Shield, Calculator, Scale } from "lucide-react";

type Category = "Healthcare" | "Wealth Management" | "Financial & Advisory Services";

interface Vertical {
  icon: typeof Baby;
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
    lineColor: "hsl(160, 60%, 45%)",
  },
  "Wealth Management": {
    badge: "text-blue-600 bg-blue-500/10",
    iconBg: "from-blue-500/20 to-indigo-500/10",
    iconBorder: "border-blue-500/30",
    iconText: "text-blue-600",
    hoverBorder: "hover:border-blue-500/30",
    lineColor: "hsl(220, 60%, 50%)",
  },
  "Financial & Advisory Services": {
    badge: "text-purple-600 bg-purple-500/10",
    iconBg: "from-purple-500/20 to-violet-500/10",
    iconBorder: "border-purple-500/30",
    iconText: "text-purple-600",
    hoverBorder: "hover:border-purple-500/30",
    lineColor: "hsl(270, 60%, 55%)",
  },
};

// Fixed hexagon positions - 6 vertices with exact pixel coordinates
// Cards from same category placed on opposite sides to prevent overlap
const hexagonVerticals: { vertical: Vertical; left: number; top: number }[] = [
  // Top vertex
  { vertical: { icon: Baby, producer: "Reproductive Endocrinologist", category: "Healthcare" }, left: 450, top: 130 },
  // Top-right vertex
  { vertical: { icon: Calculator, producer: "Chartered Professional Accountant", category: "Financial & Advisory Services" }, left: 727, top: 290 },
  // Bottom-right vertex
  { vertical: { icon: TrendingUp, producer: "Wealth Advisor", category: "Wealth Management" }, left: 727, top: 610 },
  // Bottom vertex
  { vertical: { icon: Dog, producer: "Doctor of Veterinary Medicine", category: "Healthcare" }, left: 450, top: 770 },
  // Bottom-left vertex
  { vertical: { icon: Scale, producer: "Estate & Trust Advisor", category: "Financial & Advisory Services" }, left: 173, top: 610 },
  // Top-left vertex
  { vertical: { icon: Shield, producer: "Insurance Broker", category: "Wealth Management" }, left: 173, top: 290 },
];

// For mobile layout - grouped by category
const mobileGroups = [
  {
    category: "Healthcare" as Category,
    items: [
      { icon: Baby, producer: "Reproductive Endocrinologist" },
      { icon: Dog, producer: "Doctor of Veterinary Medicine" },
    ],
  },
  {
    category: "Wealth Management" as Category,
    items: [
      { icon: TrendingUp, producer: "Wealth Advisor" },
      { icon: Shield, producer: "Insurance Broker" },
    ],
  },
  {
    category: "Financial & Advisory Services" as Category,
    items: [
      { icon: Calculator, producer: "Chartered Professional Accountant" },
      { icon: Scale, producer: "Estate & Trust Advisor" },
    ],
  },
];

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
        <div className="hidden lg:block relative mx-auto" style={{ width: '900px', height: '900px' }}>
          
          {/* Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Large radial gradient */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-radial from-primary/5 via-transparent to-transparent" />
            {/* Decorative rings */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-border/10" />
          </div>

          {/* SVG for Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 900 900">
            <defs>
              <filter id="glowLine" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="900">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connecting lines for all verticals - fixed positions */}
            {hexagonVerticals.map((item, idx) => {
              const colors = categoryColors[item.vertical.category];
              return (
                <line
                  key={`line-${idx}`}
                  x1={450}
                  y1={450}
                  x2={item.left}
                  y2={item.top}
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
              cx="450"
              cy="450"
              r="405"
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

          {/* Hexagon Vertices - Fixed Positions */}
          {hexagonVerticals.map((item, idx) => {
            const Icon = item.vertical.icon;
            const colors = categoryColors[item.vertical.category];
            
            return (
              <div
                key={`vertex-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{ left: item.left, top: item.top }}
              >
                <div className={`flex flex-col items-center justify-between bg-card/85 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-black/10 border border-border/50 border-t-white/20 hover:shadow-xl ${colors.hoverBorder} transition-all duration-300 w-[200px] h-[200px]`}>
                  {/* Category badge */}
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${colors.badge} px-2.5 py-1 rounded-full`}>
                    {item.vertical.category}
                  </span>
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center shadow-inner`}>
                    <Icon className={`w-7 h-7 ${colors.iconText} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  {/* Producer Role - prominent */}
                  <span className="text-sm font-bold text-foreground text-center leading-snug px-1">
                    {item.vertical.producer}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

        {/* Mobile/Tablet Layout - Grouped by Category */}
        <div className="lg:hidden space-y-6">
          {mobileGroups.map((group, groupIdx) => {
            const colors = categoryColors[group.category];
            return (
              <div key={groupIdx}>
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${colors.badge} px-3 py-1 rounded-full`}>
                    {group.category}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                
                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={idx} 
                        className="flex flex-col items-center text-center p-4 bg-card/85 backdrop-blur-sm rounded-xl shadow-lg shadow-black/5 border border-border/50 border-t-white/20"
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center shadow-inner mb-3`}>
                          <Icon className={`w-6 h-6 ${colors.iconText}`} />
                        </div>
                        <span className="text-sm font-bold text-foreground leading-tight">
                          {item.producer}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest pt-2">
            And many more...
          </p>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
