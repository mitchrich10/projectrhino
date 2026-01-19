import { FC } from "react";
import { Baby, Dog, Activity, TrendingUp, Shield, Calculator, MoreHorizontal } from "lucide-react";

const verticals = [
  { icon: Baby, industry: "Fertility", producer: "Reproductive Endocrinologist" },
  { icon: Dog, industry: "Veterinary", producer: "Doctor of Veterinary Medicine" },
  { icon: Activity, industry: "Physical Therapy", producer: "Physiotherapist" },
  { icon: TrendingUp, industry: "Wealth Management", producer: "Wealth Advisor" },
  { icon: Shield, industry: "Insurance", producer: "Insurance Broker" },
  { icon: Calculator, industry: "Accounting", producer: "Chartered Professional Accountant" },
];

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-secondary via-secondary to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            <span className="text-primary">Producer</span> Businesses
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto mb-3">
            Producers are the experts whose work directly drives a company's revenue, margins, and growth.
          </p>
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            Examples across industries
          </p>
        </div>

        {/* Icon Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {verticals.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group border-2 border-border/60 bg-card/80 backdrop-blur-sm p-8 shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-2">
                  {item.industry}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.producer}
                </p>
              </div>
            );
          })}

          {/* "And More" Hint Card */}
          <div className="border-2 border-dashed border-border/40 bg-card/40 backdrop-blur-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 p-4 rounded-full bg-muted/50">
              <MoreHorizontal className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold">
              And many more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
