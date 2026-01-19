import { FC } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  name: string;
  category?: string;
  description: string;
  isRepresentative?: boolean;
  acquiredBy?: string;
  logo?: string;
  logoSize?: "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";
  invertLogo?: boolean;
  bgColor?: string;
  website?: string;
  className?: string;
}

const PortfolioCard: FC<PortfolioCardProps> = ({ name, description, acquiredBy, logo, logoSize = "normal", invertLogo = false, bgColor, website, className }) => {
  const logoClasses = {
    xsmall: "max-h-5 max-w-[100px]",
    small: "max-h-6 max-w-[120px]",
    normal: "max-h-8 max-w-[140px]",
    large: "max-h-12 max-w-[160px]",
    xlarge: "max-h-16 max-w-[180px]",
    xxlarge: "max-h-20 max-w-[200px]"
  }[logoSize];

  const content = logo ? (
    <div className="h-12 flex items-center justify-center">
      {bgColor ? (
        <div className="p-2 rounded" style={{ backgroundColor: bgColor }}>
          <img 
            src={logo} 
            alt={`${name} logo`} 
            className={cn(
              logoClasses, 
              "w-auto h-auto object-contain",
              invertLogo ? "invert" : ""
            )}
          />
        </div>
      ) : (
        <img 
          src={logo} 
          alt={`${name} logo`} 
          className={cn(
            logoClasses, 
            "w-auto h-auto object-contain",
            invertLogo ? "invert" : "mix-blend-multiply dark:mix-blend-normal dark:brightness-0 dark:invert"
          )}
        />
      )}
    </div>
  ) : (
    <div className="h-12 flex items-center justify-center">
      <h4 className="text-base font-black uppercase tracking-tighter transition-colors text-foreground group-hover:text-primary text-center">
        {name}
      </h4>
    </div>
  );

  return (
    <div 
      className={cn(
        "group bg-card border border-border flex flex-col p-4 transition-all hover:shadow-md h-[140px]",
        className
      )}
    >
      {website ? (
        <a 
          href={website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          {content}
        </a>
      ) : (
        content
      )}
      <div className="text-center mt-auto">
        <div className="h-px w-0 bg-primary mb-2 mx-auto group-hover:w-full transition-all duration-500" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {description}
        </p>
        {acquiredBy && (
          <p className="text-[9px] font-bold uppercase tracking-wider text-primary mt-2">
            {acquiredBy.startsWith("IPO") ? acquiredBy : `Acquired by ${acquiredBy}`}
          </p>
        )}
      </div>
    </div>
  );
};

const PortfolioCardEmpty: FC<{ className?: string }> = ({ className }) => {
  return (
    <Link 
      to="/contact"
      className={cn(
        "h-[140px] border border-dashed border-border flex flex-col items-center justify-center p-4 text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer bg-card",
        className
      )}
    >
      <p className="text-[10px] font-black uppercase tracking-ultra text-foreground">Build With Us</p>
      <div className="w-6 h-px bg-primary mt-3" />
    </Link>
  );
};

export { PortfolioCard, PortfolioCardEmpty };