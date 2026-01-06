import { FC } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Navigation";
import vancouverSkyline from "@/assets/vancouver-skyline.jpg";

const ContactSection: FC = () => {
  return (
    <section className="py-40 px-6 text-center relative overflow-hidden bg-gradient-to-b from-secondary to-background">
      {/* Vancouver Skyline Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={vancouverSkyline} 
          alt="Vancouver skyline" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />
      </div>

      <div className="relative z-10">
        <Link to="/contact">
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-16 text-foreground hover:text-primary transition-colors cursor-pointer">
            Let's Build.
          </h2>
        </Link>
        <a 
          href="mailto:hello@rhinovc.com" 
          className="text-2xl md:text-4xl font-light tracking-tight hover:text-primary transition-colors border-b border-border pb-2 text-foreground"
        >
          hello@rhinovc.com
        </a>
        <div className="mt-16">
          <p className="text-sm font-medium text-muted-foreground">
            Investing out of Vancouver in exceptional companies across Canada
          </p>
        </div>
      </div>
    </section>
  );
};

const Footer: FC = () => {
  return (
    <footer className="py-12 px-6 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="opacity-40 hover:opacity-100 transition-opacity">
          <Logo />
        </div>
        <div className="flex gap-12">
          <a 
            href="#" 
            className="text-[10px] text-text-tertiary font-black uppercase tracking-widest hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
          <a 
            href="#" 
            className="text-[10px] text-text-tertiary font-black uppercase tracking-widest hover:text-foreground transition-colors"
          >
            Privacy
          </a>
        </div>
        <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest">
          © 2025 Rhino GP Inc.
        </p>
      </div>
    </footer>
  );
};

export { ContactSection, Footer };
