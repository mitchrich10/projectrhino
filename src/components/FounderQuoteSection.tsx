import { FC } from "react";
import lisaPhoto from "@/assets/lisa-shields.png";

const FounderQuoteSection: FC = () => {
  return (
    <section className="pt-20 pb-20 px-6 bg-gradient-to-b from-secondary to-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-border">
              <img 
                src={lisaPhoto} 
                alt="Lisa Shields" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed italic mb-6">
              "Rhino provides the critical thinking necessary to scale by constantly challenging our assumptions. They are the rare partner that asks the tough questions, and when your back is against the wall, they are the ones standing right beside you."
            </blockquote>
            <div>
              <p className="font-black uppercase tracking-tight">Lisa Shields</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Co-Founder & CEO, FISPAN
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FounderQuoteSection };
