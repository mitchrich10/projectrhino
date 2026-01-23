import { FC } from "react";
import { Baby, Dog, TrendingUp, Shield, Calculator, Scale, Activity, Home, Users } from "lucide-react";

type Category = "Healthcare" | "Wealth Management" | "Financial & Advisory Services";

interface Producer {
  icon: typeof Baby;
  title: string;
}

interface CategoryData {
  category: Category;
  angle: number;
  producers: Producer[];
}

const categoryColors: Record<Category, { 
  text: string; 
  icon: string; 
  watermark: string;
  underline: string;
  badge: string;
}> = {
  Healthcare: {
    text: "text-emerald-600",
    icon: "text-emerald-500",
    watermark: "text-emerald-500/[0.06]",
    underline: "bg-emerald-500",
    badge: "text-emerald-600 bg-emerald-500/10",
  },
  "Wealth Management": {
    text: "text-blue-600",
    icon: "text-blue-500",
    watermark: "text-blue-500/[0.06]",
    underline: "bg-blue-500",
    badge: "text-blue-600 bg-blue-500/10",
  },
  "Financial & Advisory Services": {
    text: "text-purple-600",
    icon: "text-purple-500",
    watermark: "text-purple-500/[0.06]",
    underline: "bg-purple-500",
    badge: "text-purple-600 bg-purple-500/10",
  },
};

const triangleCategories: CategoryData[] = [
  {
    category: "Healthcare",
    angle: 270, // Top center
    producers: [
      { icon: Baby, title: "Reproductive Endocrinologist" },
      { icon: Activity, title: "Physiotherapist" },
      { icon: Dog, title: "Doctor of Veterinary Medicine" },
    ],
  },
  {
    category: "Wealth Management",
    angle: 150, // Bottom-left
    producers: [
      { icon: TrendingUp, title: "Wealth Advisor" },
      { icon: Shield, title: "Insurance Broker" },
      { icon: Home, title: "Mortgage Broker" },
    ],
  },
  {
    category: "Financial & Advisory Services",
    angle: 30, // Bottom-right
    producers: [
      { icon: Calculator, title: "Chartered Professional Accountant" },
      { icon: Scale, title: "Estate & Trust Advisor" },
      { icon: Users, title: "Corporate Benefits Advisor" },
    ],
  },
];

const VerticalsSection: FC = () => {
  const centerX = 400;
  const centerY = 350;
  const radius = 240;

  // Calculate vertex positions
  const getPosition = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
    };
  };

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

        {/* Triangle Diagram - Desktop */}
        <div className="hidden lg:block relative mx-auto" style={{ width: '800px', height: '700px' }}>
          
          {/* SVG for Triangle Outline and Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 800 700">
            {/* Triangle outline */}
            <polygon
              points={triangleCategories.map((cat) => {
                const pos = getPosition(cat.angle);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--border) / 0.25)"
              strokeWidth="1"
            />

            {/* Connecting lines from center to each vertex */}
            {triangleCategories.map((cat, idx) => {
              const pos = getPosition(cat.angle);
              return (
                <line
                  key={`line-${idx}`}
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="hsl(var(--border) / 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Central Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-3 h-3 rounded-full bg-primary/40" />
          </div>

          {/* Category Zones at Triangle Vertices */}
          {triangleCategories.map((cat, idx) => {
            const pos = getPosition(cat.angle);
            const colors = categoryColors[cat.category];
            
            return (
              <div
                key={`zone-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: pos.x, top: pos.y }}
              >
                {/* Content container with subtle background */}
                <div className="relative flex flex-col items-center gap-2 py-5 px-6 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  {/* Category label */}
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.badge} px-2.5 py-1 rounded-full mb-1`}>
                    {cat.category}
                  </span>
                  
                  {/* Producer list */}
                  {cat.producers.map((producer, pIdx) => {
                    const Icon = producer.icon;
                    return (
                      <div 
                        key={pIdx}
                        className="group flex items-center gap-2.5 cursor-default"
                      >
                        <Icon className={`w-5 h-5 ${colors.icon} group-hover:scale-110 transition-transform duration-200`} />
                        <span className="relative text-sm font-semibold text-foreground">
                          {producer.title}
                          <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 ${colors.underline} group-hover:w-full transition-all duration-300`} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-8">
          {triangleCategories.map((cat, groupIdx) => {
            const colors = categoryColors[cat.category];
            return (
              <div key={groupIdx}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-widest ${colors.badge} px-3 py-1.5 rounded-full`}>
                    {cat.category}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                
                {/* Producer List */}
                <div className="space-y-3 pl-2">
                  {cat.producers.map((producer, idx) => {
                    const Icon = producer.icon;
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3"
                      >
                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                        <span className="text-sm font-semibold text-foreground">
                          {producer.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest pt-4">
            And many more...
          </p>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
