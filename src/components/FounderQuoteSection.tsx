import { FC } from "react";

const FounderQuoteSection: FC = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-secondary to-background">
      <div className="max-w-4xl mx-auto">
        <div className="border-2 border-dashed border-border/60 bg-card/40 p-12 text-center">
          <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-2">
            Coming Soon
          </p>
          <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">
            Founder Quote
          </h4>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Placeholder for a testimonial quote from a portfolio company founder.
          </p>
          <div className="text-muted-foreground/50 italic text-lg">
            "Quote text will go here..."
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            — Founder Name, Company
          </p>
        </div>
      </div>
    </section>
  );
};

export { FounderQuoteSection };
