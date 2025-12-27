import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ThesisSection } from "@/components/ThesisSection";
import { StrategySection } from "@/components/StrategySection";
import { VerticalsSection } from "@/components/VerticalsSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { ContactSection, Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <ThesisSection />
      <StrategySection />
      <VerticalsSection />
      <PortfolioSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
