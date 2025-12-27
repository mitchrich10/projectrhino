import { FC } from "react";
import { PortfolioCard, PortfolioCardEmpty } from "./PortfolioCard";

const portfolio = [
  { 
    name: "Twig Fertility", 
    category: "Healthcare Services", 
    description: "National reproductive healthcare brand." 
  },
  { 
    name: "Stem Health", 
    category: "Executive Health", 
    description: "Proactive preventative care platform." 
  },
  { 
    name: "Arlo", 
    category: "Physical Therapy", 
    description: "Consolidation of MSK clinics." 
  },
  { 
    name: "Upper Village", 
    category: "Veterinary", 
    description: "Associate-owner clinic network." 
  },
  { 
    name: "Flint", 
    category: "Healthcare Recruiting", 
    description: "Specialized recruiting and HR." 
  }
];

const PortfolioSection: FC = () => {
  return (
    <section id="portfolio" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            The Rhino Portfolio
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px">
          {portfolio.map((p, i) => (
            <PortfolioCard 
              key={i}
              name={p.name}
              category={p.category}
              description={p.description}
            />
          ))}
          <PortfolioCardEmpty />
        </div>
      </div>
    </section>
  );
};

export { PortfolioSection };
