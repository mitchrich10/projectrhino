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

// Hexagon layout: 6 cards at 60° intervals, starting from top (-90°)
// Each vertex is exactly 60° apart for perfect symmetry
const hexagonVerticals: { vertical: Vertical; angle: number }[] = [
  { vertical: { icon: Baby, producer: "Reproductive Endocrinologist", category: "Healthcare" }, angle: -90 },        // Top
  { vertical: { icon: Dog, producer: "Doctor of Veterinary Medicine", category: "Healthcare" }, angle: -30 },       // Top-right
  { vertical: { icon: Calculator, producer: "Chartered Professional Accountant", category: "Financial & Advisory Services" }, angle: 30 }, // Bottom-right
  { vertical: { icon: Scale, producer: "Estate & Trust Advisor", category: "Financial & Advisory Services" }, angle: 90 },  // Bottom
  { vertical: { icon: TrendingUp, producer: "Wealth Advisor", category: "Wealth Management" }, angle: 150 },         // Bottom-left
  { vertical: { icon: Shield, producer: "Insurance Broker", category: "Wealth Management" }, angle: 210 },           // Top-left
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

        {/* Hexagon Diagram - Desktop */}
        <div className="hidden lg:block relative mx-auto" style={{ width: '800px', height: '700px' }}>
          
          {/* Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary/5 via-transparent to-transparent" />
          </div>

          {/* SVG for Hexagon Shape and Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 800 700">
            <defs>
              <filter id="glowLine" filterUnits="userSpaceOnUse" x="0" y="0" width="800" height="700">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Hexagon outline */}
            <polygon
              points={hexagonVerticals.map((item) => {
                const angleRad = (item.angle * Math.PI) / 180;
                const radius = 260;
                const x = 400 + radius * Math.cos(angleRad);
                const y = 350 + radius * Math.sin(angleRad);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--border) / 0.3)"
              strokeWidth="1"
            />

            {/* Connecting lines from center to each vertex */}
            {hexagonVerticals.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 260;
              const x = 400 + radius * Math.cos(angleRad);
              const y = 350 + radius * Math.sin(angleRad);
              const colors = categoryColors[item.vertical.category];
              return (
                <line
                  key={`line-${idx}`}
                  x1={400}
                  y1={350}
                  x2={x}
                  y2={y}
                  stroke={colors.lineColor}
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />
              );
            })}
          </svg>

          {/* Central Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="absolute -inset-3 rounded-full bg-primary/10 blur-lg" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-card via-card to-card/90 border-2 border-primary shadow-xl shadow-primary/20 ring-4 ring-primary/10 flex flex-col items-center justify-center text-center p-3">
              <span className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">Examples</span>
              <span className="text-xs font-black uppercase tracking-tight text-foreground leading-tight">Across Industries</span>
            </div>
          </div>

          {/* Hexagon Vertex Cards */}
          {hexagonVerticals.map((item, idx) => {
            const Icon = item.vertical.icon;
            const angleRad = (item.angle * Math.PI) / 180;
            const radius = 260;
            const x = 400 + radius * Math.cos(angleRad);
            const y = 350 + radius * Math.sin(angleRad);
            const colors = categoryColors[item.vertical.category];
            
            return (
              <div
                key={`vertex-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                style={{ left: x, top: y }}
              >
                <div className={`flex flex-col items-center justify-center gap-3 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-black/10 border border-border/50 ${colors.hoverBorder} transition-all duration-300 w-[160px] h-[160px] hover:-translate-y-1 hover:shadow-xl`}>
                  {/* Category badge */}
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${colors.badge} px-2 py-0.5 rounded-full`}>
                    {item.vertical.category}
                  </span>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center shadow-inner`}>
                    <Icon className={`w-6 h-6 ${colors.iconText} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  {/* Producer Role */}
                  <span className="text-xs font-bold text-foreground text-center leading-tight px-1">
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
