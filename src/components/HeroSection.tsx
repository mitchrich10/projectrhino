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
              viewBox="0 0 512 512" 
              className="inline-block w-12 h-12 md:w-20 md:h-20 align-middle -mt-2"
              fill="#FF0000"
            >
              <path d="M383.8 351.7c2.5-2.5 105.2-92.4 105.2-92.4l-17.5-7.5c-10-4.9-7.4-11.5-5-17.4 2.4-7.6 20.1-67.3 20.1-67.3l-23.6 7.5c-10.6 3.5-15.5-4.9-17.5-12.4l-11.8-45.9-15.6 59.8c-2.5 10-9.9 12.4-17.4 7.5l-24.9-12.4 5.2 67.3c.9 9.9-7.9 14.7-16 9.9l-34.4-24.9L256 364l-74.7-151.8-34.4 24.9c-8.1 4.8-16.9 0-16-9.9l5.2-67.3-24.9 12.4c-7.5 4.9-14.9 2.5-17.4-7.5L82.3 119l-11.8 45.9c-2 7.5-6.9 15.9-17.5 12.4l-23.6-7.5s17.7 59.7 20.1 67.3c2.4 5.9 5 12.5-5 17.4L27 262.3s102.7 89.9 105.2 92.4c5.2 5.2 10.3 20.4 0 35.3L97.7 452l60.4-32c14.6-9.1 28.9-2.3 32 11.4l17.9 66.6 30.5-128.5c3.5-14.5 16.5-21.6 28.5-12.4l13 10 13-10c12-9.2 25-2.1 28.5 12.4l30.5 128.5 17.9-66.6c3.1-13.7 17.4-20.5 32-11.4l60.4 32-34.5-62c-10.3-14.9-5.2-30.1 0-35.3z"/>
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
