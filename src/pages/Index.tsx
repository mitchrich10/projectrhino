import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { RhinoCrashBanner } from "@/components/RhinoCrashBanner";
import { ThesisSection } from "@/components/ThesisSection";
import { TeamSection } from "@/components/TeamSection";
import { StrategySection } from "@/components/StrategySection";
import { VerticalsSection } from "@/components/VerticalsSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { ContactSection, Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <RhinoCrashBanner />
      <ThesisSection />
      <TeamSection />
      <StrategySection />
      <VerticalsSection />
      <PortfolioSection />
      <TestimonialSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
