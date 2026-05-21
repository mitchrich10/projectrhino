import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
import { companyLogos } from "@/lib/companyLogos";

interface SubPageHeaderProps {
  /** Layout width — matches the page's main content width. */
  maxWidth?: "max-w-3xl" | "max-w-4xl" | "max-w-6xl" | "max-w-7xl";
  /** Company info to show partner branding on the right (optional). */
  company?: { company_name: string; logo_key: string | null } | null;
  /** Show admin link when current user is a Rhino admin. */
  isAdmin?: boolean;
  /** Sign-out handler — if provided, renders the Sign Out button. */
  onSignOut?: () => void | Promise<void>;
  /** Override the back-link target. Defaults to /portal. */
  backTo?: string;
  /** Override the back-link label. Defaults to "← Back to Portal". */
  backLabel?: string;
}

/**
 * Shared header for portal sub-pages (FinancingGuide, Onboarding, etc.).
 * Provides Rhino logo, back-to-portal link, optional company badge,
 * sign-out, admin link, and a mobile menu — all from one place.
 */
const SubPageHeader: FC<SubPageHeaderProps> = ({
  maxWidth = "max-w-6xl",
  company = null,
  isAdmin = false,
  onSignOut,
  backTo = "/portal",
  backLabel = "← Back to Portal",
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const logoSrc = company?.logo_key ? companyLogos[company.logo_key] : null;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#CDD8E3]">
      <div className={`${maxWidth} mx-auto px-6 h-16 flex items-center justify-between gap-4`}>
        <Link to="/" className="flex-shrink-0">
          <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to={backTo}
            className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A] hover:text-[#173660] transition-colors"
          >
            {backLabel}
          </Link>
          {company &&
            (logoSrc ? (
              <img src={logoSrc} alt={company.company_name} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-[#173660]">
                {company.company_name}
              </span>
            ))}
          {onSignOut && (
            <button
              onClick={() => onSignOut()}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5C6B7A] hover:text-[#173660] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8] hover:opacity-70 transition-opacity"
            >
              Admin
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-[#173660]"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#CDD8E3] bg-white px-6 py-4 flex flex-col gap-4">
          <Link to={backTo} className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A]">
            {backLabel}
          </Link>
          {onSignOut && (
            <button
              onClick={() => onSignOut()}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5C6B7A]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8]">
              Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default SubPageHeader;
