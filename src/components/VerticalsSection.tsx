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
    items: ["IT Services", "Technical Services", "HR & Recruiting", "Managed Services"],
  }
];

const VerticalsSection: FC = () => {
  return (
    <section id="verticals" className="py-32 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-ultra text-muted-foreground mb-4">
              Example Verticals
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">
              Producer Industries
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md mb-8">
              We invest in industries driven by skilled professionals where technology and systems unlock unique advantages. Here are some examples:
            </p>
            <div className="border-l-2 border-primary pl-6 max-w-md">
              <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-2">
                Producer Definition
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Producers are experts whose productivity translates directly into their firm's revenue, margin and growth profile.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-4">
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
    </section>
  );
};

export { VerticalsSection };
