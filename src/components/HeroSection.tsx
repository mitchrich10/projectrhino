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
            Scaling Canadian <span className="text-primary">Producer</span> Businesses.{" "}
            <svg 
              viewBox="0 0 24 24" 
              className="inline-block w-12 h-12 md:w-20 md:h-20 align-middle -mt-2"
              fill="#FF0000"
            >
              <path d="M12 2L9.5 7.5L4 6L6.5 10L2 12L6.5 14L4 18L9.5 16.5L12 22L14.5 16.5L20 18L17.5 14L22 12L17.5 10L20 6L14.5 7.5L12 2Z" />
            </svg>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium mb-10 max-w-2xl leading-relaxed">
            You deserve a capital partner who thinks like an <span className="text-primary font-semibold">operator</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <RhinoButton className="group hover:gap-4">
              Partner with Us <ArrowRight className="w-4 h-4" />
            </RhinoButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
