import { FC } from "react";
import { PortfolioCard, PortfolioCardEmpty } from "./PortfolioCard";

const activePortfolio = [
  { 
    name: "Arlo", 
    category: "Physical Therapy", 
    description: "Consolidation of MSK clinics.",
    isRepresentative: true
  },
  { 
    name: "Article", 
    category: "Ecommerce", 
    description: "Direct-to-consumer modern furniture." 
  },
  { 
    name: "Aspect Biosystems", 
    category: "Biotech", 
    description: "3D bioprinting technology platform." 
  },
  { 
    name: "Contact", 
    category: "Marketing", 
    description: "Influencer marketing platform." 
  },
  { 
    name: "Edvisor", 
    category: "EdTech", 
    description: "Student recruitment platform." 
  },
  { 
    name: "Elective", 
    category: "EdTech", 
    description: "Live virtual learning marketplace." 
  },
  { 
    name: "Fatigue Science", 
    category: "Workforce Analytics", 
    description: "Predictive fatigue analytics." 
  },
  { 
    name: "FISPAN", 
    category: "FinTech", 
    description: "Embedded banking infrastructure." 
  },
  { 
    name: "Flint", 
    category: "Healthcare Recruiting", 
    description: "Specialized recruiting and HR.",
    isRepresentative: true
  },
  { 
    name: "Klue", 
    category: "Competitive Intelligence", 
    description: "AI-powered competitive enablement." 
  },
  { 
    name: "Marz", 
    category: "VFX", 
    description: "AI-powered visual effects." 
  },
  { 
    name: "MYFO", 
    category: "FinTech", 
    description: "Family office technology." 
  },
  { 
    name: "NetNow", 
    category: "FinTech", 
    description: "B2B credit and payments platform." 
  },
  { 
    name: "Pluto", 
    category: "FinTech", 
    description: "Investment and trading platform." 
  },
  { 
    name: "Quinn AI", 
    category: "AI", 
    description: "AI-powered business tools." 
  },
  { 
    name: "ShopVision", 
    category: "Retail Tech", 
    description: "Retail analytics platform." 
  },
  { 
    name: "Showbie", 
    category: "EdTech", 
    description: "Classroom workflow management." 
  },
  { 
    name: "Side Door", 
    category: "Music", 
    description: "Artist-hosted concert marketplace." 
  },
  { 
    name: "Stem Health", 
    category: "Healthcare Services", 
    description: "Proactive preventative care platform.",
    isRepresentative: true
  },
  { 
    name: "SuperAdvisor", 
    category: "FinTech", 
    description: "Expert network platform." 
  },
  { 
    name: "Twig Fertility", 
    category: "Healthcare Services", 
    description: "National reproductive healthcare brand.",
    isRepresentative: true
  },
  { 
    name: "Upper Village", 
    category: "Healthcare Services", 
    description: "Associate-owner clinic network.",
    isRepresentative: true
  }
];

const exitedPortfolio = [
  { name: "Askott Entertainment", acquiredBy: "FansUnite", category: "Gaming", description: "Acquired by FansUnite" },
  { name: "Beanworks", acquiredBy: "Quadient", category: "FinTech", description: "Accounts payable automation" },
  { name: "Curatio", acquiredBy: "Pemba Capital", category: "Healthcare", description: "Patient engagement platform" },
  { name: "Grow", acquiredBy: "ATB Financial", category: "FinTech", description: "Digital banking platform" },
  { name: "OnTopical", acquiredBy: "Sovra", category: "Media", description: "Content curation platform" },
  { name: "PeerBoard", acquiredBy: "Docebo", category: "EdTech", description: "Learning technology" },
  { name: "Pressboard", acquiredBy: "Impact", category: "AdTech", description: "Content marketing analytics" },
  { name: "Sokanu", acquiredBy: "Penn Foster", category: "EdTech", description: "Career matching platform" },
  { name: "ThinkCX", acquiredBy: "OpenSignal", category: "Analytics", description: "Customer experience analytics" },
  { name: "Thinkific", acquiredBy: "TSX (IPO)", category: "EdTech", description: "Online course platform" },
  { name: "Tutela", acquiredBy: "Comlinkdata", category: "Telecom", description: "Mobile network analytics" }
];

const PortfolioSection: FC = () => {
  return (
    <section id="portfolio" className="py-32 px-6 bg-gradient-to-b from-secondary via-background to-background">
      <div className="max-w-7xl mx-auto">
        {/* Active Portfolio */}
        <div className="mb-24">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-4">
              Current Investments
            </p>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
              Active Portfolio
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activePortfolio.map((p, i) => (
              <PortfolioCard 
                key={i}
                name={p.name}
                category={p.category}
                description={p.description}
                isRepresentative={p.isRepresentative}
              />
            ))}
            <PortfolioCardEmpty />
          </div>
        </div>

        {/* Exited Investments */}
        <div>
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-ultra text-muted-foreground mb-4">
              Successful Outcomes
            </p>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
              Exits
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exitedPortfolio.map((p, i) => (
              <PortfolioCard 
                key={i}
                name={p.name}
                category={p.category}
                description={p.description}
                acquiredBy={p.acquiredBy}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { PortfolioSection };
