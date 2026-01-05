import { FC } from "react";
import zachPhoto from "@/assets/zach-shapiro.png";

const TestimonialSection: FC = () => {
  return (
    <section className="py-32 px-6 bg-secondary">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-border">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };
