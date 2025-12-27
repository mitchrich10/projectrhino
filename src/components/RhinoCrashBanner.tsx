import { FC } from "react";
import rhinoCrash from "@/assets/rhino-crash.png";

const RhinoCrashBanner: FC = () => {
  return (
    <div className="relative w-full h-32 md:h-48 overflow-hidden bg-gradient-to-r from-background via-secondary to-background border-y border-border">
      {/* Dust particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-muted-foreground animate-dust-drift"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${60 + Math.random() * 30}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Running rhinos */}
      <div className="absolute inset-0 flex items-center animate-run-across">
        <img 
          src={rhinoCrash} 
          alt="Crash of rhinos running" 
          className="h-full w-auto object-contain opacity-70"
        />
      </div>
      
      {/* Ground line */}
      <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export { RhinoCrashBanner };
