import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

const StatCard: FC<StatCardProps> = ({ title, description, icon, className }) => {
  return (
    <div 
      className={cn(
        "p-10 border-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-300",
        className
      )}
    >
      <div className="mb-8 text-muted-foreground">{icon}</div>
      <h4 className="text-sm font-black uppercase tracking-widest mb-4">{title}</h4>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  );
};

export { StatCard };
