import { FC } from "react";

import { VerticalCard } from "./VerticalCard";

const verticals = [
  {
    title: "Healthcare",
    items: ["Fertility", "Veterinary", "Physical Therapy", "Imaging"],
  },
  {
    title: "Finance",
    items: ["Wealth Management", "Insurance", "Accounting", "Estate Planning"],
  },
  {
    title: "Enterprise",
    items: ["IT Services", "HR & Recruiting", "Managed Services"],
  }
];

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-20 px-6 bg-gradient-to-b from-background via-secondary to-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
              Producer Industries
            </h2>
            <div className="border-l-2 border-primary pl-6 max-w-md mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Producers are experts whose productivity translates directly into their firm's revenue, margin and growth profile.
              </p>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md">
              We invest in industries driven by skilled professionals where technology and systems unlock unique advantages.
            </p>
          </div>

          <div className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-ultra text-muted-foreground mb-4">
              Example Verticals
            </p>
            <div className="grid gap-4">
              {verticals.map((v, i) => (
                <VerticalCard 
                  key={i}
                  title={v.title}
                  items={v.items}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { VerticalsSection };
