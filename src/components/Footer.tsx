import { FC } from "react";
import { Logo } from "./Navigation";

const ContactSection: FC = () => {
  return (
    <section className="py-40 px-6 border-t border-border text-center relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <span className="text-[20vw] font-black uppercase italic leading-none">RHINO</span>
      </div>

      <div className="relative z-10">
        <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-16">
          Let's Build.
        </h2>
        <a 
          href="mailto:hello@rhinovc.com" 
          className="text-2xl md:text-4xl font-light tracking-tight hover:text-muted-foreground transition-colors border-b border-border pb-2"
        >
          hello@rhinovc.com
        </a>
        <div className="mt-16 flex justify-center gap-12">
          <p className="text-[10px] font-black uppercase tracking-mega text-text-tertiary">Vancouver</p>
          <p className="text-[10px] font-black uppercase tracking-mega text-text-tertiary">Global</p>
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
