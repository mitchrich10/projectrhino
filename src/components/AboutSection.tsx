import { FC } from "react";
import rhinoDetail from "@/assets/rhino-detail.jpg";
const AboutSection: FC = () => {
  return <section id="about" className="py-32 px-6 bg-gradient-to-b from-background via-secondary to-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-4">
              About Us
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">HOW WE INVEST<br />Journey
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              Since 2015, we've been partnering with ambitious builders across industries.
            </p>
            <p className="text-xl text-foreground leading-relaxed italic border-l-2 border-border pl-8 mb-6">
              "Rhinos are tough, thick-skinned, and carry scars on their backs. This is what we believe it takes to build a successful company."
            </p>
            <p className="text-base text-foreground font-medium">
              We earn the right to be the partner of choice to the entrepreneurs we work with.
            </p>
          </div>
          <div className="relative">
            <div className="relative z-10 p-4 border border-border bg-background/40 backdrop-blur-sm">
              <img src={rhinoDetail} alt="Rhino detail" className="w-full h-auto grayscale opacity-80" />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-muted/30 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </section>;
};
export { AboutSection };