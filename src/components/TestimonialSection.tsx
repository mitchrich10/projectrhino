import { FC } from "react";
import zachPhoto from "@/assets/zach-shapiro.png";

const highlights = [
  { value: "35", label: "Investments" },
  { value: "11", label: "Exits" },
];

const TestimonialSection: FC = () => {
  return (
    <section className="pt-24 pb-20 px-6 bg-secondary">
      <div className="max-w-4xl mx-auto">
        {/* Highlights */}
        <div className="mb-20">
          <p className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">We partner with ambitious builders to scale enduring companies.</p>
          <div className="flex justify-center items-end gap-8 md:gap-16">
            {highlights.map((item, idx) => (
              <div key={idx} className="text-center group">
                <p className="text-5xl md:text-7xl font-black text-primary leading-none">{item.value}</p>
                <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-center mt-6">Since Inception</p>
        </div>

        {/* Zach Quote */}
        <div className="flex flex-col md:flex-row items-center gap-12 bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-border/50">
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
              "What stood out immediately was how quickly Rhino got under the hood of our business. They possess a rare ability to master a niche industry at record speed and translate that insight into actionable support. They've been fantastic partners and instrumental in helping us evolve from a startup into a category leader."
            </blockquote>
            <div>
              <p className="font-black uppercase tracking-tight">Zach Shapiro</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                CEO & Co-Founder, Twig Fertility
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };
