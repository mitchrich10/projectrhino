import { FC } from "react";
import { Link } from "react-router-dom";
import { Shield, DollarSign, Layers, Baby, Dog, TrendingUp, Calculator, Scale, Activity, Home, Users } from "lucide-react";
import { StatCard } from "./StatCard";

const strategyItems = [
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
    desc: "Path to cash flow generation, but comfortable investing pre-profitability.", 
    icon: <Layers className="w-5 h-5" /> 
  }
];

type Category = "Healthcare" | "Wealth Management" | "Financial & Advisory Services";

interface Producer {
  icon: typeof Baby;
  title: string;
}

interface CategoryData {
  category: Category;
  producers: Producer[];
}

const categoryColors: Record<Category, { 
  icon: string; 
  badge: string;
  border: string;
  leftBorder: string;
}> = {
  Healthcare: {
    icon: "text-emerald-500",
    badge: "text-emerald-600 bg-emerald-500/10",
    border: "border-emerald-500/20",
    leftBorder: "border-l-emerald-400",
  },
  "Wealth Management": {
    icon: "text-blue-500",
    badge: "text-blue-600 bg-blue-500/10",
    border: "border-blue-500/20",
    leftBorder: "border-l-blue-400",
  },
  "Financial & Advisory Services": {
    icon: "text-purple-500",
    badge: "text-purple-600 bg-purple-500/10",
    border: "border-purple-500/20",
    leftBorder: "border-l-purple-400",
  },
};

const categories: CategoryData[] = [
  {
    category: "Healthcare",
    producers: [
      { icon: Baby, title: "Reproductive Endocrinologist" },
      { icon: Activity, title: "Physiotherapist" },
      { icon: Dog, title: "Doctor of Veterinary Medicine" },
    ],
  },
  {
    category: "Wealth Management",
    producers: [
      { icon: TrendingUp, title: "Wealth Advisor" },
      { icon: Shield, title: "Insurance Broker" },
      { icon: Home, title: "Mortgage Broker" },
    ],
  },
  {
    category: "Financial & Advisory Services",
    producers: [
      { icon: Calculator, title: "Chartered Professional Accountant" },
      { icon: Scale, title: "Estate & Trust Advisor" },
      { icon: Users, title: "Corporate Benefits Advisor" },
    ],
  },
];

const StrategySection: FC = () => {
  return (
    <section id="strategy" className="py-20 px-6 bg-gradient-to-b from-background via-background to-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Where We Partner */}
        <div className="border-2 border-border/50 bg-white/95 backdrop-blur-sm p-10 md:p-14 shadow-lg">
          <div className="mb-10">
            <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground mb-4">
              Where We <span className="text-primary">Partner</span>
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              From building new platforms to partnering in established companies. We work closely with operators looking to build, buy or scale businesses and take them to the next stage of growth.
            </p>
          </div>

          {/* Strategy Tiles */}
          <div className="grid md:grid-cols-3 gap-4">
            {strategyItems.map((item, i) => (
              <StatCard 
                key={i}
                title={item.title}
                description={item.desc}
                icon={item.icon}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-primary/40 my-10" />

          {/* Producer Businesses */}
          <div className="mb-10">
            <h5 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mb-4">
              <span className="text-primary">Producer</span> Businesses
            </h5>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              Producers are the experts whose work directly drives a company's revenue, margins, and growth.
            </p>
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const colors = categoryColors[cat.category];
              return (
                <div key={idx} className={`flex flex-col pl-4 border-l-4 ${colors.leftBorder} hover:translate-x-1 transition-all duration-300`}>
                  {/* Category Header */}
                  <div className={`mb-4 pb-3 border-b ${colors.border}`}>
                    <span className={`text-xs font-bold uppercase tracking-widest ${colors.badge} px-3 py-1 rounded-full`}>
                      {cat.category}
                    </span>
                  </div>
                  
                  {/* Producer List */}
                  <div className="space-y-3">
                    {cat.producers.map((producer, pIdx) => {
                      const Icon = producer.icon;
                      return (
                        <div 
                          key={pIdx}
                          className="flex items-center gap-3"
                        >
                          <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
                          <span className="text-sm font-medium text-foreground">
                            {producer.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest mt-8">
            And many more...
          </p>

          {/* Bottom Statement */}
          <p className="text-foreground text-base md:text-lg font-medium leading-relaxed mt-10 text-center italic">
            If you're looking for growth capital but don't fit neatly into venture or private equity playbooks,{" "}
            <Link 
              to="/contact" 
              className="text-primary font-semibold hover:underline transition-all"
            >
              that's where we partner.
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export { StrategySection };
