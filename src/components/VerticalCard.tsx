import { FC } from "react";
import { cn } from "@/lib/utils";

interface VerticalCardProps {
  title: string;
  items: string[];
  className?: string;
}

const VerticalCard: FC<VerticalCardProps> = ({ title, items, className }) => {
  return (
    <div 
      className={cn(
        "border border-border bg-background/60 backdrop-blur-sm p-8 hover:bg-surface-hover hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group",
        className
      )}
    >
      <h4 className="text-[11px] font-black uppercase tracking-ultra mb-6 text-muted-foreground group-hover:text-foreground transition-colors">
        {title}
      </h4>
      <div className="flex flex-wrap gap-x-10 gap-y-4">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export { VerticalCard };
