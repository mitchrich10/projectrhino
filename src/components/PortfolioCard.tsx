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

const RhinoIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.5 2 5.5 4 4 7L2 8V11L4 12C4 12 5 14 6 15L5 18L7 20L9 18C10 18.5 11 19 12 19C13 19 14 18.5 15 18L17 20L19 18L18 15C19 14 20 12 20 12L22 11V8L20 7C18.5 4 15.5 2 12 2ZM8 9C8.55 9 9 9.45 9 10C9 10.55 8.55 11 8 11C7.45 11 7 10.55 7 10C7 9.45 7.45 9 8 9ZM16 9C16.55 9 17 9.45 17 10C17 10.55 16.55 11 16 11C15.45 11 15 10.55 15 10C15 9.45 15.45 9 16 9Z"/>
  </svg>
);

const PortfolioCard: FC<PortfolioCardProps> = ({ name, category, description, isRepresentative, acquiredBy, className }) => {
  return (
    <div 
      className={cn(
        "group bg-card border border-border flex flex-col justify-between p-8 transition-all hover:shadow-md",
        acquiredBy ? "min-h-[180px]" : "aspect-square",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-mega text-text-tertiary">
            {category}
          </p>
          {isRepresentative && (
            <RhinoIcon className="text-primary" />
          )}
        </div>
        <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
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
