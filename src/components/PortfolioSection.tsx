import { FC } from "react";
import { PortfolioCard, PortfolioCardEmpty } from "./PortfolioCard";

// Active Portfolio header photos
import activePhoto1 from "@/assets/active-portfolio-1.jpg";
import activePhoto2 from "@/assets/active-portfolio-2.jpg";
import activePhoto3 from "@/assets/active-portfolio-3.jpg";
import activePhoto4 from "@/assets/active-portfolio-4.jpg";

// Logo imports
import logoMarz from "@/assets/logo-marz.png";
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
import logoSuperadvisor from "@/assets/logo-superadvisor-color.png";
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
    logo: logoUpperVillage,
    logoSize: "large",
    logoOffset: -2
  },
  { 
    name: "Flint", 
    category: "Healthcare Services", 
    description: "Healthcare recruitment agency.",
    isRepresentative: true,
    logo: logoFlint,
    website: "https://www.withflint.com"
  },
  { 
    name: "Stem Health", 
    category: "Healthcare Services", 
    description: "Private-pay primary health.",
    isRepresentative: true,
    logo: logoStemHealth,
    website: "http://www.stemhealth.ca"
  },
  { 
    name: "Quinn AI", 
    category: "AI", 
    description: "AI-powered revenue operations.",
    logo: logoQuinnAI,
    website: "http://quinn-ai.com"
  },
  { 
    name: "ShopVision", 
    category: "AI", 
    description: "AI-powered eCommerce analytics.",
    logo: logoShopvision,
    logoSize: "large",
    website: "https://www.shopvision.ai"
  },
  { 
    name: "NetNow", 
    category: "FinTech", 
    description: "B2B credit and payments platform.",
    logo: logoNetNow,
    website: "http://www.netnow.io"
  },
  { 
    name: "Pluto", 
    category: "FinTech", 
    description: "Spend management and payments.",
    logo: logoPluto,
    logoSize: "small",
    website: "https://www.getpluto.com"
  },
  { 
    name: "Elective", 
    category: "Lending", 
    description: "BNPL for digital entrepreneurs.",
    logo: logoElective,
    logoSize: "small",
    website: "http://www.elective.com"
  },
  { 
    name: "MYFO", 
    category: "FinTech", 
    description: "Family office technology.",
    logo: logoMyfo,
    logoSize: "xxlarge",
    website: "https://www.myfotech.com"
  },
  { 
    name: "Twig Fertility", 
    category: "Healthcare Services", 
    description: "Reproductive healthcare.",
    isRepresentative: true,
    logo: logoTwig,
    website: "https://twigfertility.com"
  },
  { 
    name: "SuperAdvisor", 
    category: "FinTech", 
    description: "Wealth management technology.",
    logo: logoSuperadvisor,
    website: "http://www.superadvisor.ai"
  },
  { 
    name: "FISPAN", 
    category: "FinTech", 
    description: "Embedded banking infrastructure.",
    logo: logoFispan,
    logoSize: "large",
    website: "http://www.fispan.com"
  },
  { 
    name: "Marz", 
    category: "VFX", 
    description: "AI-powered visual effects.",
    logo: logoMarz,
    logoSize: "large",
    website: "https://monstersaliensrobotszombies.com"
  },
  { 
    name: "Showbie", 
    category: "EdTech", 
    description: "Classroom workflow management.",
    logo: logoShowbie,
    logoSize: "xlarge",
    website: "http://www.showbie.com"
  },
  { 
    name: "Edvisor", 
    category: "EdTech", 
    description: "Student recruitment platform.",
    logo: logoEdvisor,
    logoSize: "small",
    website: "http://www.edvisor.io"
  },
  { 
    name: "Aspect Biosystems", 
    category: "Biotech", 
    description: "3D bioprinting technology platform.",
    logo: logoAspectBiosystems,
    logoSize: "xlarge",
    website: "http://www.aspectbiosystems.com"
  },
  { 
    name: "Fatigue Science", 
    category: "Enterprise SaaS", 
    description: "Predictive fatigue analytics.",
    logo: logoFatigueScience,
    website: "http://www.fatiguescience.com"
  },
  { 
    name: "Klue", 
    category: "Enterprise SaaS", 
    description: "AI-powered competitive enablement.",
    logo: logoKlue,
    website: "http://www.klue.com"
  },
  { 
    name: "Article", 
    category: "Ecommerce", 
    description: "Direct-to-consumer modern furniture.",
    logo: logoArticle,
    website: "http://www.article.com"
  }
];

const exitedPortfolio = [
  { name: "Askott Entertainment", acquiredBy: "FansUnite", category: "Gaming", description: "iGaming and eSports", logo: logoAskott, website: "http://www.askottentertainment.com" },
  { name: "Beanworks", acquiredBy: "Quadient", category: "FinTech", description: "Accounts payable automation", logo: logoBeanworks, website: "http://www.beanworks.com" },
  { name: "Curatio", acquiredBy: "Pemba Capital", category: "Healthcare", description: "Patient engagement platform", logo: logoCuratio, website: "http://www.curatio.me" },
  { name: "Grow", acquiredBy: "ATB Financial", category: "FinTech", description: "Digital banking platform", logo: logoGrow, website: "http://www.poweredbygrow.com" },
  { name: "OnTopical", acquiredBy: "Sovra", category: "Media", description: "Content curation platform", logo: logoOntopical, logoSize: "xlarge", website: "https://www.ontopical.com" },
  { name: "PeerBoard", acquiredBy: "Docebo", category: "EdTech", description: "Communities platform", logo: logoPeerboard },
  { name: "Pressboard", acquiredBy: "Impact", category: "AdTech", description: "Content marketing analytics", logo: logoPressboard },
  { name: "Sokanu", acquiredBy: "Penn Foster", category: "EdTech", description: "Career matching platform", logo: logoSokanu, invertLogo: false, bgColor: "#5b3d8c", website: "http://www.sokanu.com" },
  { name: "ThinkCX", acquiredBy: "OpenSignal", category: "Analytics", description: "Market intelligence for telecommunications", logo: logoThinkCX },
  { name: "Thinkific", acquiredBy: "IPO: TSX", category: "EdTech", description: "Online course platform", logo: logoThinkific, website: "http://www.thinkific.com" },
  { name: "Tutela", acquiredBy: "Comlinkdata", category: "Telecom", description: "Mobile network analytics", logo: logoTutela }
];

const PortfolioSection: FC = () => {
  return (
    <section id="portfolio" className="pt-32 pb-16 px-6 bg-gradient-to-b from-secondary via-background to-background">
      <div className="max-w-7xl mx-auto">
        {/* Active Portfolio */}
        <div className="mb-24">
          <div className="mb-12 text-center relative overflow-hidden py-16">
            {/* Photo Background Grid - 4 columns */}
            <div className="absolute inset-0 z-0 grid grid-cols-4">
              <div className="relative overflow-hidden">
                <img src={activePhoto1} alt="" className="w-full h-full object-cover opacity-40" />
              </div>
            <div className="relative overflow-hidden">
              <img src={activePhoto2} alt="" className="w-full h-full object-cover object-top opacity-40" />
            </div>
            <div className="relative overflow-hidden">
              <img src={activePhoto4} alt="" className="w-full h-full object-cover object-bottom opacity-40" />
            </div>
            <div className="relative overflow-hidden">
              <img src={activePhoto3} alt="" className="w-full h-full object-cover opacity-40" />
            </div>
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background/40 to-background/80" />
            </div>
            
            {/* Header text - positioned above photos */}
            <div className="relative z-10">
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
                Active Portfolio
              </h3>
              <p className="text-lg md:text-xl text-muted-foreground mt-3 italic">The Crash — a herd of Rhinos</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activePortfolio.map((p, i) => (
              <PortfolioCard 
                key={i}
                name={p.name}
                description={p.description}
                logo={p.logo}
                logoSize={(p as any).logoSize}
                logoOffset={(p as any).logoOffset}
                invertLogo={(p as any).invertLogo}
                bgColor={(p as any).bgColor}
                website={(p as any).website}
                variant="active"
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
            <p className="text-lg md:text-xl text-muted-foreground mt-3 italic">The Golden Crash</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exitedPortfolio.map((p, i) => (
              <PortfolioCard 
                key={i}
                name={p.name}
                description={p.description}
                acquiredBy={p.acquiredBy}
                logo={p.logo}
                logoSize={(p as any).logoSize}
                logoOffset={(p as any).logoOffset}
                invertLogo={p.invertLogo}
                bgColor={(p as any).bgColor}
                website={(p as any).website}
                variant="exited"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { PortfolioSection };
