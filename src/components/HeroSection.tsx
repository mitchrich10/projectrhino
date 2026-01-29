import { FC, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { RhinoButton } from "./RhinoButton";
import rhinoDetail from "@/assets/rhino-detail.jpg";
import mapleLeaf from "@/assets/maple-leaf.png";

const rotatingWords = [
  "Producer",
  "Wealth",
  "Health",
  "Insurance",
  "Mortgage",
];

const HeroSection: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <section className="relative min-h-screen flex items-center px-6 overflow-hidden bg-black">
      {/* Background Image - Rhino Breaking Through */}
      <div className="absolute inset-0 z-0">
        <img src={rhinoDetail} alt="Rhino breaking through" className="w-full h-full object-cover opacity-70" />
        {/* Lighter black gradient from left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8 text-white">
            Scaling{" "}
            <span 
              className={`text-primary inline-block transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              {rotatingWords[currentIndex]}
            </span>
            {" "}Businesses
            <img src={mapleLeaf} alt="Canadian maple leaf" className="inline-block h-[0.5em] ml-2 align-baseline" />
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed text-white/80 font-medium">You deserve a capital partner who <span className="text-primary font-bold">amplifies your success</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/contact">
              <RhinoButton className="group hover:gap-4">
                Partner with Us <ArrowRight className="w-4 h-4" />
              </RhinoButton>
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export { HeroSection };