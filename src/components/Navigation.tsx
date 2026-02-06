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
          "h-16 w-auto object-contain",
          !dark && "invert"
        )}
      />
    </Link>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  dark?: boolean;
}

const NavLink: FC<NavLinkProps> = ({ href, children, onClick, dark = false }) => {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className={cn(
        "text-xs font-bold transition-colors duration-200 uppercase tracking-widest",
        dark ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"
      )}
    >
      {children}
    </a>
  );
};

interface NavigationProps {
  variant?: "dark" | "light";
}

const Navigation: FC<NavigationProps> = ({ variant = "dark" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLightVariant = variant === "light";
  // For light variant (contact page), text should be dark. For dark variant (homepage), text stays white always.
  const isDarkText = isLightVariant;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        scrolled 
          ? isLightVariant 
            ? "bg-background/95 backdrop-blur-md py-4 border-b border-border"
            : "bg-black/95 backdrop-blur-md py-4 border-b border-white/10"
          : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo dark={isDarkText} />
        
        <div className="hidden md:flex gap-10 items-center">
          <NavLink href="/#strategy" dark={isDarkText}>How We Invest</NavLink>
          <NavLink href="/#portfolio" dark={isDarkText}>Portfolio</NavLink>
          <NavLink href="/#team" dark={isDarkText}>The Team</NavLink>
          <Link to="/contact">
            <RhinoButton size="sm">Contact</RhinoButton>
          </Link>
        </div>

        <button 
          className={cn("md:hidden", isDarkText ? "text-foreground" : "text-white")}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6 md:hidden">
          <NavLink href="/#strategy" onClick={() => setIsMenuOpen(false)}>How We Invest</NavLink>
          <NavLink href="/#portfolio" onClick={() => setIsMenuOpen(false)}>Portfolio</NavLink>
          <NavLink href="/#team" onClick={() => setIsMenuOpen(false)}>The Team</NavLink>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export { Navigation, Logo };
