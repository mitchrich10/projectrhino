import { FC, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RhinoButton } from "./RhinoButton";

const Logo: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center", className)}>
    <span className="text-xl font-black tracking-tighter uppercase">RHINO</span>
  </div>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: FC<NavLinkProps> = ({ href, children, onClick }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest"
  >
    {children}
  </a>
);

const Navigation: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          ? "bg-background/95 backdrop-blur-md py-4 border-b border-border" 
          : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo />
        
        <div className="hidden md:flex gap-10 items-center">
          <NavLink href="#thesis">Thesis</NavLink>
          <NavLink href="#team">Team</NavLink>
          <NavLink href="#strategy">Strategy</NavLink>
          <NavLink href="#verticals">Verticals</NavLink>
          <NavLink href="#portfolio">Portfolio</NavLink>
          <RhinoButton size="sm">Contact</RhinoButton>
        </div>

        <button 
          className="md:hidden text-foreground" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6 md:hidden">
          <NavLink href="#thesis" onClick={() => setIsMenuOpen(false)}>Thesis</NavLink>
          <NavLink href="#team" onClick={() => setIsMenuOpen(false)}>Team</NavLink>
          <NavLink href="#strategy" onClick={() => setIsMenuOpen(false)}>Strategy</NavLink>
          <NavLink href="#verticals" onClick={() => setIsMenuOpen(false)}>Verticals</NavLink>
          <NavLink href="#portfolio" onClick={() => setIsMenuOpen(false)}>Portfolio</NavLink>
          <NavLink href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
        </div>
      )}
    </nav>
  );
};

export { Navigation, Logo };
