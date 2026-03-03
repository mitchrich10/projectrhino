import { FC, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RhinoButton } from "./RhinoButton";
import { Link } from "react-router-dom";
import logo from "@/assets/rhino-logo-black.png";

const Logo: FC<{ className?: string; dark?: boolean }> = ({ className, dark = false }) => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Link to="/" onClick={handleClick} className={cn("flex items-center", className)}>
      <img 
        src={logo} 
        alt="Rhino" 
        className={cn(
          "h-6 md:h-12 w-auto object-contain",
          !dark && "invert"
        )}
      />
    </Link>
  );
};

interface NavigationProps {
  variant?: "dark" | "light";
}

const Navigation: FC<NavigationProps> = ({ variant = "dark" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLightVariant = variant === "light";
  const isDarkText = isLightVariant;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const close = () => setIsMenuOpen(false);

  const linkClass = cn(
    "text-xs font-bold transition-colors duration-200 uppercase tracking-widest",
    isDarkText ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"
  );

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? isLightVariant 
            ? "bg-background/95 backdrop-blur-md pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-border"
            : "bg-black/95 backdrop-blur-md pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-white/10"
          : "bg-transparent pt-[max(2rem,env(safe-area-inset-top))] pb-8"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo dark={isDarkText} />

        {/* Desktop nav — hidden when menu is open */}
        {/* Always-visible hamburger button */}
        <button 
          className={cn(isDarkText ? "text-foreground" : "text-white")}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6">
          <a href="/#strategy" onClick={close} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">How We Invest</a>
          <a href="/#portfolio" onClick={close} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">Portfolio</a>
          <a href="/#team" onClick={close} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">The Team</a>
          <a
            href="https://platformeleven.io/rhino-ventures"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest"
          >
            LP Portal
          </a>
          <Link to="/partner-login" onClick={close} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">
            Rhino Community Portal
          </Link>
          <Link to="/contact" onClick={close} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export { Navigation, Logo };
