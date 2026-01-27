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
        "p-10 border-l-4 border-l-primary border-2 border-slate-200 bg-slate-50/80 shadow-md hover:bg-sky-50 hover:border-sky-300 hover:border-l-sky-500 hover:shadow-lg hover:shadow-sky-200/40 transition-all duration-300",
        className
      )}
    >
      <div className="mb-8 text-primary">{icon}</div>
      <h4 className="text-sm font-black uppercase tracking-widest mb-4">{title}</h4>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  );
};

export { StatCard };
