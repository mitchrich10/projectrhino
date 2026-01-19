import { FC } from "react";
import zachPhoto from "@/assets/zach-shapiro.png";
import logoTwig from "@/assets/logo-twig.png";
import logoStemHealth from "@/assets/logo-stem-health.png";
import logoFispan from "@/assets/logo-fispan.png";
import logoUpperVillage from "@/assets/logo-upper-village.png";

const TestimonialSection: FC = () => {
  return (
    <section className="pt-24 pb-20 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Highlights */}
        <div className="mb-20">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-center mb-8 whitespace-nowrap">We partner with ambitious builders to scale enduring companies.</p>
          
          <div className="flex justify-center items-start gap-8 md:gap-16">
            {/* Investments */}
            <div className="text-center group">
              <p className="text-5xl md:text-7xl font-black text-primary leading-none h-16 md:h-20 flex items-center justify-center">35</p>
              <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Investments</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">Since Inception</p>
            </div>
            
            {/* Portfolio Annual Revenue */}
            <div className="text-center group">
              <p className="text-5xl md:text-7xl font-black text-primary leading-none h-16 md:h-20 flex items-center justify-center">$500M+</p>
              <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio Annual Revenue</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2 invisible">Since Inception</p>
            </div>
            
            {/* Exits */}
            <div className="text-center group">
              <p className="text-5xl md:text-7xl font-black text-primary leading-none h-16 md:h-20 flex items-center justify-center">11</p>
              <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Exits</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">Since Inception</p>
            </div>
          </div>

          {/* Featured Company Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {/* Company 1 - Twig */}
            <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Photo Placeholder
                </div>
              </div>
              <div className="p-5">
                <div className="h-8 mb-4">
                  <img src={logoTwig} alt="Twig Fertility" className="h-full w-auto object-contain" />
                </div>
                <p className="text-2xl font-black text-primary mb-1">7x Revenue</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Since 2022</p>
              </div>
            </div>

            {/* Company 2 - Stem Health */}
            <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Photo Placeholder
                </div>
              </div>
              <div className="p-5">
                <div className="h-8 mb-4">
                  <img src={logoStemHealth} alt="Stem Health" className="h-full w-auto object-contain" />
                </div>
                <p className="text-2xl font-black text-primary mb-1">$XX M ARR</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">KPI Placeholder</p>
              </div>
            </div>

            {/* Company 3 - FISPAN */}
            <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Photo Placeholder
                </div>
              </div>
              <div className="p-5">
                <div className="h-8 mb-4">
                  <img src={logoFispan} alt="FISPAN" className="h-full w-auto object-contain" />
                </div>
                <p className="text-2xl font-black text-primary mb-1">$35M+ ARR</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Since 2018</p>
              </div>
            </div>

            {/* Company 4 - Upper Village */}
            <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Photo Placeholder
                </div>
              </div>
              <div className="p-5">
                <div className="h-8 mb-4">
                  <img src={logoUpperVillage} alt="Upper Village" className="h-full w-auto object-contain" />
                </div>
                <p className="text-2xl font-black text-primary mb-1">$XX M ARR</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">KPI Placeholder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zach Quote */}
        <div className="flex flex-col md:flex-row items-center gap-12 bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border-2 border-border/50 hover:border-primary transition-colors duration-300">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-primary/50">
              <img 
                src={zachPhoto} 
                alt="Zach Shapiro" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed italic mb-6">
              "Rhino possesses a rare ability to master a niche industry at record speed and translate that insight into actionable support. They've been fantastic partners and instrumental in helping us evolve from a startup into a category leader."
            </blockquote>
            <div>
              <p className="font-black uppercase tracking-tight">Zach Shapiro</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                CEO & Co-Founder, Twig Fertility
              </p>
              <p className="text-sm text-primary font-semibold mt-3">
                &gt;7x annual revenue since Rhino invested in 2022
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };
