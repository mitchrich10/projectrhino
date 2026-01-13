import { FC } from "react";
import { PortfolioCard, PortfolioCardEmpty } from "./PortfolioCard";

// Logo imports
import logoMarz from "@/assets/logo-marz.jpg";
import logoQuinnAI from "@/assets/logo-quinn-ai.png";
import logoUpperVillage from "@/assets/logo-upper-village.png";
import logoNetNow from "@/assets/logo-netnow.png";
import logoArticle from "@/assets/logo-article.png";
import logoAspectBiosystems from "@/assets/logo-aspect-biosystems.png";
import logoTutela from "@/assets/logo-tutela.png";
import logoThinkCX from "@/assets/logo-thinkcx.png";
import logoPeerboard from "@/assets/logo-peerboard.png";
import logoMyfo from "@/assets/logo-myfo.png";
import logoElective from "@/assets/logo-elective.png";
import logoTwig from "@/assets/logo-twig.png";
import logoThinkific from "@/assets/logo-thinkific.png";
import logoSuperadvisor from "@/assets/logo-superadvisor.png";
import logoSokanu from "@/assets/logo-sokanu.png";
import logoShopvision from "@/assets/logo-shopvision.png";
import logoPressboard from "@/assets/logo-pressboard.png";
import logoPluto from "@/assets/logo-pluto.png";

const activePortfolio = [
  { 
    name: "Arlo", 
    category: "Healthcare Services", 
    description: "Consolidation of MSK clinics.",
    isRepresentative: true
  },
  { 
    name: "Upper Village", 
    category: "Healthcare Services", 
    description: "Animal health.",
    isRepresentative: true,
    logo: logoUpperVillage
  },
  { 
    name: "Flint", 
    category: "Healthcare Services", 
    description: "Specialized recruiting and HR.",
    isRepresentative: true
  },
  { 
    name: "Stem Health", 
    category: "Healthcare Services", 
    description: "Private-pay primary health.",
    isRepresentative: true
  },
  { 
    name: "Quinn AI", 
    category: "AI", 
    description: "AI-powered revenue operations.",
    logo: logoQuinnAI
  },
  { 
    name: "ShopVision", 
    category: "AI", 
    description: "AI-powered eCommerce analytics.",
    logo: logoShopvision
  },
  { 
    name: "NetNow", 
    category: "FinTech", 
    description: "B2B credit and payments platform.",
    logo: logoNetNow
  },
  { 
    name: "Pluto", 
    category: "FinTech", 
    description: "Spend management and payments.",
    logo: logoPluto
  },
  { 
    name: "Elective", 
    category: "Lending", 
    description: "BNPL for digital entrepreneurs.",
    logo: logoElective
  },
  { 
    name: "MYFO", 
    category: "FinTech", 
    description: "Family office technology.",
    logo: logoMyfo
  },
  { 
    name: "Twig Fertility", 
    category: "Healthcare Services", 
    description: "Reproductive healthcare.",
    isRepresentative: true,
    logo: logoTwig
  },
  { 
    name: "SuperAdvisor", 
    category: "FinTech", 
    description: "Wealth management technology.",
    logo: logoSuperadvisor,
    invertLogo: true
  },
  { 
    name: "FISPAN", 
    category: "FinTech", 
    description: "Embedded banking infrastructure." 
  },
  { 
    name: "Marz", 
    category: "VFX", 
    description: "AI-powered visual effects.",
    logo: logoMarz,
    logoSize: "large"
  },
  { 
    name: "Showbie", 
    category: "EdTech", 
    description: "Classroom workflow management." 
  },
  { 
    name: "Edvisor", 
    category: "EdTech", 
    description: "Student recruitment platform." 
  },
  { 
    name: "Aspect Biosystems", 
    category: "Biotech", 
    description: "3D bioprinting technology platform.",
    logo: logoAspectBiosystems,
    logoSize: "xlarge"
  },
  { 
    name: "Fatigue Science", 
    category: "Enterprise SaaS", 
    description: "Predictive fatigue analytics." 
  },
  { 
    name: "Klue", 
    category: "Enterprise SaaS", 
    description: "AI-powered competitive enablement." 
  },
  { 
    name: "Article", 
    category: "Ecommerce", 
    description: "Direct-to-consumer modern furniture.",
    logo: logoArticle
  }
];

const exitedPortfolio = [
  { name: "Askott Entertainment", acquiredBy: "FansUnite", category: "Gaming", description: "iGaming and eSports" },
  { name: "Beanworks", acquiredBy: "Quadient", category: "FinTech", description: "Accounts payable automation" },
  { name: "Curatio", acquiredBy: "Pemba Capital", category: "Healthcare", description: "Patient engagement platform" },
  { name: "Grow", acquiredBy: "ATB Financial", category: "FinTech", description: "Digital banking platform" },
  { name: "OnTopical", acquiredBy: "Sovra", category: "Media", description: "Content curation platform" },
  { name: "PeerBoard", acquiredBy: "Docebo", category: "EdTech", description: "Communities platform", logo: logoPeerboard },
  { name: "Pressboard", acquiredBy: "Impact", category: "AdTech", description: "Content marketing analytics", logo: logoPressboard },
  { name: "Sokanu", acquiredBy: "Penn Foster", category: "EdTech", description: "Career matching platform", logo: logoSokanu, invertLogo: true },
  { name: "ThinkCX", acquiredBy: "OpenSignal", category: "Analytics", description: "Market intelligence for telecommunications", logo: logoThinkCX },
  { name: "Thinkific", acquiredBy: "IPO: TSX", category: "EdTech", description: "Online course platform", logo: logoThinkific },
  { name: "Tutela", acquiredBy: "Comlinkdata", category: "Telecom", description: "Mobile network analytics", logo: logoTutela }
];

const PortfolioSection: FC = () => {
  return (
    <section id="portfolio" className="pt-32 pb-16 px-6 bg-gradient-to-b from-secondary via-background to-background">
      <div className="max-w-7xl mx-auto">
        {/* Active Portfolio */}
        <div className="mb-24">
          <div className="mb-12 text-center">
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
              Active Portfolio
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activePortfolio.map((p, i) => (
              <PortfolioCard 
                key={i}
                name={p.name}
                description={p.description}
                logo={p.logo}
                logoSize={p.logoSize as "normal" | "large" | "xlarge"}
                invertLogo={p.invertLogo}
              />
            ))}
            <PortfolioCardEmpty />
          </div>
        </div>

        {/* Exited Investments */}
        <div>
          <div className="mb-12 text-center">
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
              Exits
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exitedPortfolio.map((p, i) => (
              <PortfolioCard 
                key={i}
                name={p.name}
                description={p.description}
                acquiredBy={p.acquiredBy}
                logo={p.logo}
                invertLogo={p.invertLogo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { PortfolioSection };
