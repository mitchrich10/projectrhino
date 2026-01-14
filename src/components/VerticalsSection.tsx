import { FC } from "react";

const healthcareProducers = [
  { role: "Reproductive Endocrinologist", vertical: "Fertility" },
  { role: "Doctor of Veterinary Medicine", vertical: "Veterinary" },
  { role: "Physiotherapist", vertical: "Physical Therapy" },
];

const financeProducers = [
  { role: "Wealth Advisor", vertical: "Wealth Management" },
  { role: "Insurance Broker", vertical: "Insurance" },
  { role: "Chartered Professional Accountant", vertical: "Accounting" },
];

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-secondary via-secondary to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            <span className="text-primary">Producer</span> Industries
          </h2>
        </div>
        
        {/* Full-width description */}
        <p className="text-muted-foreground text-base leading-relaxed mb-12">
          From building new platforms to partnering in established companies. We work closely with operators looking to buy or scale businesses and take them to the next stage of growth.
        </p>

        {/* Two Tiles */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Healthcare Tile */}
          <div className="border-2 border-border/60 bg-card/80 backdrop-blur-sm p-8 shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
            <h4 className="text-[11px] font-black uppercase tracking-ultra mb-4 text-primary">
              Healthcare
            </h4>
            <div className="flex items-baseline justify-between gap-4 mb-3 border-b border-border/40 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Producer</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Industry</span>
            </div>
            <div className="space-y-3">
              {healthcareProducers.map((item, idx) => (
                <div key={idx} className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-bold text-foreground">{item.role}</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{item.vertical}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Finance Tile */}
          <div className="border-2 border-border/60 bg-card/80 backdrop-blur-sm p-8 shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
            <h4 className="text-[11px] font-black uppercase tracking-ultra mb-4 text-primary">
              Finance
            </h4>
            <div className="flex items-baseline justify-between gap-4 mb-3 border-b border-border/40 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Producer</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Industry</span>
            </div>
            <div className="space-y-3">
              {financeProducers.map((item, idx) => (
                <div key={idx} className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-bold text-foreground">{item.role}</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{item.vertical}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
