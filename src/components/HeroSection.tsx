import { FC } from "react";
import { ArrowRight } from "lucide-react";
import { RhinoButton } from "./RhinoButton";
import rhinoHeads from "@/assets/rhino-heads.png";
import mapleLeaf from "@/assets/maple-leaf.png";

const HeroSection: FC = () => {
  return (
    <section className="relative min-h-screen flex items-center px-6 overflow-hidden bg-black">
      {/* Background - Rhino bursting through */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
        <img 
          src={rhinoHeads} 
          alt="Rhino sculptures" 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto object-contain object-right opacity-90 translate-x-[5%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </div>

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8 text-white">
            Scaling Canadian <span className="text-primary">Producer</span> Businesses<img src={mapleLeaf} alt="Canadian maple leaf" className="inline-block h-[0.5em] ml-2 align-baseline" />
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mb-10 max-w-2xl leading-relaxed">
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
