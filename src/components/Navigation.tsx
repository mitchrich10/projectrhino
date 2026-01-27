import { FC, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RhinoButton } from "./RhinoButton";
import { Link } from "react-router-dom";

const Logo: FC<{ className?: string }> = ({ className }) => (
  <Link to="/" className={cn("flex items-center", className)}>
    <span className="text-xl font-black tracking-wide uppercase text-white">RHINO</span>
  </Link>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: FC<NavLinkProps> = ({ href, children, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If on a different page, navigate home then scroll
        window.location.href = `/${href}`;
      }
    }
    onClick?.();
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className="text-xs font-bold text-white/80 hover:text-white transition-colors duration-200 uppercase tracking-widest"
    >
      {children}
    </a>
  );
};

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
          ? "bg-black/95 backdrop-blur-md py-4 border-b border-white/10" 
          : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo />
        
        <div className="hidden md:flex gap-10 items-center">
          <NavLink href="#strategy">How We Invest</NavLink>
          <NavLink href="#portfolio">Portfolio</NavLink>
          <NavLink href="#team">The Team</NavLink>
          <Link to="/contact">
            <RhinoButton size="sm">Contact</RhinoButton>
          </Link>
        </div>

        <button 
          className="md:hidden text-white" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6 md:hidden">
          <NavLink href="#strategy" onClick={() => setIsMenuOpen(false)}>How We Invest</NavLink>
          <NavLink href="#portfolio" onClick={() => setIsMenuOpen(false)}>Portfolio</NavLink>
          <NavLink href="#team" onClick={() => setIsMenuOpen(false)}>The Team</NavLink>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export { Navigation, Logo };
