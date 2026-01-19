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
import logoSuperadvisor from "@/assets/logo-superadvisor-black.png";
import logoSokanu from "@/assets/logo-sokanu.png";
import logoShopvision from "@/assets/logo-shopvision.png";
import logoPressboard from "@/assets/logo-pressboard.png";
import logoPluto from "@/assets/logo-pluto.png";
import logoOntopical from "@/assets/logo-ontopical.jpg";
import logoKlue from "@/assets/logo-klue.png";
import logoGrow from "@/assets/logo-grow.png";
import logoFispan from "@/assets/logo-fispan.png";
import logoFatigueScience from "@/assets/logo-fatigue-science.png";
import logoEdvisor from "@/assets/logo-edvisor.png";
import logoCuratio from "@/assets/logo-curatio.png";
import logoBeanworks from "@/assets/logo-beanworks.png";
import logoShowbie from "@/assets/logo-showbie.png";
import logoAskott from "@/assets/logo-askott.png";
import logoFlint from "@/assets/logo-flint.png";
import logoStemHealth from "@/assets/logo-stem-health.png";

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
    description: "Healthcare recruitment agency.",
    isRepresentative: true,
    logo: logoFlint
  },
  { 
    name: "Stem Health", 
    category: "Healthcare Services", 
    description: "Private-pay primary health.",
    isRepresentative: true,
    logo: logoStemHealth
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
    logo: logoSuperadvisor
  },
  { 
    name: "FISPAN", 
    category: "FinTech", 
    description: "Embedded banking infrastructure.",
    logo: logoFispan
  },
  { 
    name: "Marz", 
    category: "VFX", 
    description: "AI-powered visual effects.",
    logo: logoMarz
  },
  { 
    name: "Showbie", 
    category: "EdTech", 
    description: "Classroom workflow management.",
    logo: logoShowbie
  },
  { 
    name: "Edvisor", 
    category: "EdTech", 
    description: "Student recruitment platform.",
    logo: logoEdvisor
  },
  { 
    name: "Aspect Biosystems", 
    category: "Biotech", 
    description: "3D bioprinting technology platform.",
    logo: logoAspectBiosystems
  },
  { 
    name: "Fatigue Science", 
    category: "Enterprise SaaS", 
    description: "Predictive fatigue analytics.",
    logo: logoFatigueScience
  },
  { 
    name: "Klue", 
    category: "Enterprise SaaS", 
    description: "AI-powered competitive enablement.",
    logo: logoKlue
  },
  { 
    name: "Article", 
    category: "Ecommerce", 
    description: "Direct-to-consumer modern furniture.",
    logo: logoArticle
  }
];

const exitedPortfolio = [
  { name: "Askott Entertainment", acquiredBy: "FansUnite", category: "Gaming", description: "iGaming and eSports", logo: logoAskott },
  { name: "Beanworks", acquiredBy: "Quadient", category: "FinTech", description: "Accounts payable automation", logo: logoBeanworks },
  { name: "Curatio", acquiredBy: "Pemba Capital", category: "Healthcare", description: "Patient engagement platform", logo: logoCuratio },
  { name: "Grow", acquiredBy: "ATB Financial", category: "FinTech", description: "Digital banking platform", logo: logoGrow },
  { name: "OnTopical", acquiredBy: "Sovra", category: "Media", description: "Content curation platform", logo: logoOntopical },
  { name: "PeerBoard", acquiredBy: "Docebo", category: "EdTech", description: "Communities platform", logo: logoPeerboard },
  { name: "Pressboard", acquiredBy: "Impact", category: "AdTech", description: "Content marketing analytics", logo: logoPressboard },
  { name: "Sokanu", acquiredBy: "Penn Foster", category: "EdTech", description: "Career matching platform", logo: logoSokanu, invertLogo: false, bgColor: "#5b3d8c" },
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
                invertLogo={(p as any).invertLogo}
                bgColor={(p as any).bgColor}
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
                bgColor={(p as any).bgColor}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { PortfolioSection };
