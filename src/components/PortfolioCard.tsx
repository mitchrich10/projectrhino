import { FC } from "react";
import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  name: string;
  category: string;
  description: string;
  isRepresentative?: boolean;
  acquiredBy?: string;
  className?: string;
}

const PortfolioCard: FC<PortfolioCardProps> = ({ name, category, description, isRepresentative, acquiredBy, className }) => {
  return (
    <div 
      className={cn(
        "group bg-card border flex flex-col justify-between p-8 transition-all hover:shadow-md",
        isRepresentative ? "border-primary border-2" : "border-border",
        acquiredBy ? "min-h-[180px]" : "aspect-square",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-mega",
            isRepresentative ? "text-primary" : "text-text-tertiary"
          )}>
            {category}
          </p>
        </div>
        <h4 className={cn(
          "text-2xl font-black uppercase tracking-tighter transition-colors",
          isRepresentative ? "text-primary" : "text-foreground group-hover:text-primary"
        )}>
          {name}
        </h4>
      </div>
      <div>
        <div className="h-px w-0 bg-primary mb-4 group-hover:w-full transition-all duration-500" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
        {acquiredBy && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mt-3">
            Acquired by {acquiredBy}
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
        "aspect-square border border-dashed border-border flex flex-col items-center justify-center p-12 text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer bg-card",
        className
      )}
    >
      <p className="text-[11px] font-black uppercase tracking-ultra text-foreground">Build With Us</p>
      <div className="w-8 h-px bg-primary mt-4" />
    </div>
  );
};

export { PortfolioCard, PortfolioCardEmpty };
