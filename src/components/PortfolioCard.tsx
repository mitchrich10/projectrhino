import { FC } from "react";
import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  name: string;
  category: string;
  description: string;
  isRepresentative?: boolean;
  acquiredBy?: string;
  logo?: string;
  website?: string;
  className?: string;
}

const PortfolioCard: FC<PortfolioCardProps> = ({ name, category, description, isRepresentative, acquiredBy, logo, website, className }) => {
  const content = logo ? (
    <div className="w-full h-10 flex items-center justify-center">
      <img 
        src={logo} 
        alt={`${name} logo`} 
        className="max-h-10 max-w-[120px] w-auto h-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:brightness-0 dark:invert"
      />
    </div>
  ) : (
    <h4 className="text-lg font-black uppercase tracking-tighter transition-colors text-foreground group-hover:text-primary text-center">
      {name}
    </h4>
  );

  return (
    <div 
      className={cn(
        "group bg-card border border-border flex flex-col justify-between p-4 transition-all hover:shadow-md min-h-[120px]",
        className
      )}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[9px] font-black uppercase tracking-mega text-text-tertiary">
            {category}
          </p>
          {isRepresentative && (
            <span className="text-[8px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Producer
            </span>
          )}
        </div>
        {website ? (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
      <div className="text-center">
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
    <div 
      className={cn(
        "min-h-[120px] border border-dashed border-border flex flex-col items-center justify-center p-4 text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer bg-card",
        className
      )}
    >
      <p className="text-[10px] font-black uppercase tracking-ultra text-foreground">Build With Us</p>
      <div className="w-6 h-px bg-primary mt-3" />
    </div>
  );
};

export { PortfolioCard, PortfolioCardEmpty };
