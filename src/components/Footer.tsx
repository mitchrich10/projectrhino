import { FC } from "react";
import { Link } from "react-router-dom";
import madScientist from "@/assets/active-portfolio-4.jpg";
import foundersPickleball from "@/assets/founders-pickleball.jpg";
import foundersKlue from "@/assets/founders-klue.jpg";


const ContactSection: FC = () => {
  return (
    <section className="py-20 px-6 text-center relative overflow-hidden bg-gradient-to-b from-secondary to-background min-h-[400px]">
      {/* Founder Photos Background */}
      <div className="absolute inset-0 z-0 grid grid-cols-3">
        <div className="relative overflow-hidden">
          <img 
            src={madScientist} 
            alt="ShopVision and Rhino team" 
            className="w-full h-full object-cover object-[center_70%] opacity-45"
          />
        </div>
        <div className="relative overflow-hidden">
          <img 
            src={foundersPickleball} 
            alt="FSPAN and Rhino team" 
            className="w-full h-full object-cover opacity-45"
          />
        </div>
        <div className="relative overflow-hidden">
          <img 
            src={foundersKlue} 
            alt="Klue celebration" 
            className="w-full h-full object-cover object-top opacity-45"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="text-left">
          <Link to="/contact">
            <h2 className="text-[3.2rem] md:text-[6.8rem] font-black uppercase tracking-tighter text-foreground hover:text-primary transition-colors cursor-pointer mb-6">
              Let's Build.
            </h2>
          </Link>
        </div>
        <div className="text-left mt-12">
          <p className="text-sm font-medium text-foreground/80 drop-shadow-sm">
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
      <div className="max-w-7xl mx-auto flex justify-end">
        <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest">
          2026 Rhino
        </p>
      </div>
    </footer>
  );
};

export { ContactSection, Footer };
