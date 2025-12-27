import { FC } from "react";
import rhinoDetail from "@/assets/rhino-detail.jpg";

const ThesisSection: FC = () => {
  return (
    <section id="thesis" className="py-32 px-6 border-y border-border bg-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter mb-8">
            The Rhino <br />Journey
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed italic border-l-2 border-border pl-8 mb-8">
            "Rhinos are tough, thick-skinned, and carry scars on their backs. This is what we believe it takes to build a successful company."
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
            Resilience as a Core Thesis
          </p>
        </div>
        <div className="order-1 md:order-2 relative">
          <div className="relative z-10 p-4 border border-border bg-background/40 backdrop-blur-sm">
            <img 
              src={rhinoDetail} 
              alt="Rhino detail" 
              className="w-full h-auto grayscale opacity-80"
            />
          </div>
          {/* Decorative element */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-muted/30 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
};

export { ThesisSection };
