import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TeamSection } from "@/components/TeamSection";
import { StrategySection } from "@/components/StrategySection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { FounderQuoteSection } from "@/components/FounderQuoteSection";
import { ContactSection, Footer } from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

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
