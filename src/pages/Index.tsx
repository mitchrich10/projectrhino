import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TeamSection } from "@/components/TeamSection";
import { StrategySection } from "@/components/StrategySection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { FounderQuoteSection } from "@/components/FounderQuoteSection";
import { ContactSection, Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <TestimonialSection />
      <StrategySection />
      <FounderQuoteSection />
      <PortfolioSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
