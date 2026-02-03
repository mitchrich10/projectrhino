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
  logoOffset?: number;
  invertLogo?: boolean;
  bgColor?: string;
  website?: string;
  className?: string;
  variant?: "active" | "exited";
}

const PortfolioCard: FC<PortfolioCardProps> = ({ name, description, acquiredBy, logo, logoSize = "normal", logoOffset = 0, invertLogo = false, bgColor, website, className, variant = "active" }) => {
  const logoClasses = {
    xsmall: "max-h-5 max-w-[100px]",
    small: "max-h-6 max-w-[120px]",
    normal: "max-h-8 max-w-[140px]",
    large: "max-h-12 max-w-[160px]",
    xlarge: "max-h-16 max-w-[180px]",
    xxlarge: "max-h-20 max-w-[200px]"
  }[logoSize];

  const content = logo ? (
    <div className="h-12 flex items-center justify-center" style={{ marginTop: logoOffset ? `${logoOffset * 0.25}rem` : undefined }}>
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
            invertLogo ? "invert" : "mix-blend-multiply"
          )}
        />
      )}
    </div>
  ) : (
    <div className="h-12 flex items-center justify-center -mt-4">
      <h4 className="text-xl font-black uppercase tracking-tighter transition-colors text-foreground group-hover:text-primary text-center">
        {name}
      </h4>
    </div>
  );

  const variantStyles = variant === "exited" 
    ? "bg-white border-border hover:bg-amber-50/50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-200/40 relative overflow-hidden border-t-2 border-t-amber-100"
    : "bg-white border-border hover:bg-sky-50/70 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-200/40 transition-all duration-300 border-t-2 border-t-primary/20";

  const contentArea = (
    <div className="flex-1 flex items-center justify-center">
      {content}
    </div>
  );

  return (
    <div 
      className={cn(
        "group flex flex-col p-4 transition-all hover:shadow-lg h-[140px] border",
        variantStyles,
        className
      )}
    >
      {website ? (
        <a 
          href={website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          {contentArea}
        </a>
      ) : (
        contentArea
      )}
      <div className="text-center mt-auto pt-3 border-t border-border/50 group-hover:border-sky-400/50 transition-colors">
        {variant === "active" && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {acquiredBy && (
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-wider text-primary",
            variant === "active" && "mt-2"
          )}>
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