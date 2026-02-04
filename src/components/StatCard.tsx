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
        "relative p-10 border-l-4 border-l-primary border-[3px] border-slate-300 bg-white shadow-lg shadow-slate-200/50 hover:bg-sky-50 hover:border-sky-300 hover:border-l-sky-500 hover:shadow-xl hover:shadow-sky-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* Icon container with background */}
      <div className="relative mb-6 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
        <div className="text-primary [&>svg]:w-7 [&>svg]:h-7">{icon}</div>
      </div>
      
      <h4 className="text-sm font-black uppercase tracking-widest mb-4 text-foreground">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export { StatCard };
