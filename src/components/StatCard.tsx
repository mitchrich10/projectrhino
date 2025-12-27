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
        "p-10 hover:bg-surface-hover transition-colors border-r border-border last:border-r-0",
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
