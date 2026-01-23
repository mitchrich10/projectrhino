import { FC } from "react";
import { Baby, Dog, TrendingUp, Shield, Calculator, Scale, Activity, Home, Users } from "lucide-react";

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
}> = {
  Healthcare: {
    icon: "text-emerald-500",
    badge: "text-emerald-600 bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  "Wealth Management": {
    icon: "text-blue-500",
    badge: "text-blue-600 bg-blue-500/10",
    border: "border-blue-500/20",
  },
  "Financial & Advisory Services": {
    icon: "text-purple-500",
    badge: "text-purple-600 bg-purple-500/10",
    border: "border-purple-500/20",
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

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-secondary via-secondary to-background">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            <span className="text-primary">Producer</span> Businesses
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            Producers are the experts whose work directly drives a company's revenue, margins, and growth.
          </p>
        </div>

        {/* Three Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const colors = categoryColors[cat.category];
            return (
              <div key={idx} className="flex flex-col">
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

        <p className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest mt-10">
          And many more...
        </p>
      </div>
    </section>
  );
};

export { VerticalsSection };
