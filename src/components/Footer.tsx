import { FC } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Navigation";
import foundersHike from "@/assets/founders-hike.jpg";
import foundersPickleball from "@/assets/founders-pickleball.jpg";
import foundersOntopical from "@/assets/founders-ontopical.jpg";

const ContactSection: FC = () => {
  return (
    <section className="py-20 px-6 text-center relative overflow-hidden bg-gradient-to-b from-secondary to-background min-h-[400px]">
      {/* Founder Photos Background */}
      <div className="absolute inset-0 z-0 grid grid-cols-3">
        <div className="relative overflow-hidden">
          <img 
            src={foundersHike} 
            alt="ShopVision and Rhino team" 
            className="w-full h-full object-cover object-[center_75%] opacity-40"
          />
        </div>
        <div className="relative overflow-hidden">
          <img 
            src={foundersPickleball} 
            alt="FSPAN and Rhino team" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative overflow-hidden">
          <img 
            src={foundersOntopical} 
            alt="Ontopical and Rhino team" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background/40 to-background/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full text-left">
        <Link to="/contact">
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-foreground hover:text-primary transition-colors cursor-pointer mb-6 leading-[0.85]">
            Let's<br />Build.
          </h2>
        </Link>
        <a 
          href="mailto:hello@rhinovc.com" 
          className="text-2xl md:text-4xl font-light tracking-tight hover:text-primary transition-colors border-b border-border pb-2 text-foreground"
        >
          hello@rhinovc.com
        </a>
        <p className="text-sm font-medium text-muted-foreground mt-4">
          Investing out of Vancouver in exceptional companies across Canada
        </p>
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
