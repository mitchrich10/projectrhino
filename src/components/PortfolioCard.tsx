import { FC } from "react";
import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  name: string;
  category: string;
  description: string;
  className?: string;
}

const PortfolioCard: FC<PortfolioCardProps> = ({ name, category, description, className }) => {
  return (
    <div 
      className={cn(
        "group aspect-square bg-surface-elevated border border-border flex flex-col justify-between p-12 transition-all hover:bg-secondary",
        className
      )}
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-mega text-text-tertiary mb-6">
          {category}
        </p>
        <h4 className="text-3xl font-black uppercase tracking-tighter group-hover:text-foreground transition-colors">
          {name}
        </h4>
      </div>
      <div>
        <div className="h-px w-0 bg-border mb-6 group-hover:w-full transition-all duration-500" />
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
          {description}
        </p>
      </div>
    </div>
  );
};

const PortfolioCardEmpty: FC<{ className?: string }> = ({ className }) => {
  return (
    <div 
      className={cn(
        "aspect-square border border-dashed border-border flex flex-col items-center justify-center p-12 text-center opacity-30 hover:opacity-100 transition-opacity cursor-pointer",
        className
      )}
    >
      <p className="text-[11px] font-black uppercase tracking-ultra">Build With Us</p>
      <div className="w-8 h-px bg-border mt-4" />
    </div>
  );
};

export { PortfolioCard, PortfolioCardEmpty };
