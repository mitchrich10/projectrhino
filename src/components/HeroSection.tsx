import { FC } from "react";
import { ArrowRight } from "lucide-react";
import { RhinoButton } from "./RhinoButton";
import rhinoHeads from "@/assets/rhino-heads.png";

const HeroSection: FC = () => {
  return (
    <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
      {/* Background Image - Rhino Heads */}
      <div className="absolute inset-0 z-0">
        <img 
          src={rhinoHeads} 
          alt="Rhino sculptures" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8 text-foreground">
            Scaling Producer Industries.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium mb-10 max-w-2xl leading-relaxed">
            You deserve a capital partner who thinks like an operator. Rhino works with entrepreneurs to build, acquire, and scale market-leading platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <RhinoButton className="group hover:gap-4">
              Partner with Us <ArrowRight className="w-4 h-4" />
            </RhinoButton>
          </div>
          <div className="border-l-2 border-primary pl-6 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-2">
              Producer Definition
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Producers are experts whose productivity translates directly into their firm's revenue, margin and growth profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
