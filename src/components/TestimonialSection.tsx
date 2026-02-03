import { FC } from "react";
import zachPhoto from "@/assets/zach-shapiro.png";
import logoElective from "@/assets/logo-elective.png";
import logoArticle from "@/assets/logo-article.png";
import logoFispan from "@/assets/logo-fispan.png";
import logoThinkific from "@/assets/logo-thinkific.png";

const TestimonialSection: FC = () => {
  return (
    <section className="pt-24 pb-20 px-6 bg-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Highlights */}
        <div className="mb-20">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-center mb-8 whitespace-nowrap">We partner with ambitious builders to change trajectories.</p>
          
          <div className="flex justify-center items-start gap-8 md:gap-16 mb-16">
            {/* Companies */}
            <div className="text-center group">
              <p className="text-5xl md:text-7xl font-black text-primary leading-none h-16 md:h-20 flex items-center justify-center">35</p>
              <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Companies</p>
            </div>
            
            {/* Portfolio Annual Revenue */}
            <div className="text-center group">
              <p className="text-5xl md:text-7xl font-black text-primary leading-none h-16 md:h-20 flex items-center justify-center">$700M+</p>
              <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio Annual Revenue</p>
            </div>
            
            {/* Exits */}
            <div className="text-center group">
              <p className="text-5xl md:text-7xl font-black text-primary leading-none h-16 md:h-20 flex items-center justify-center">12</p>
              <div className="h-1 w-12 bg-primary/30 mx-auto mt-3 mb-2 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Exits</p>
            </div>
          </div>

          {/* Featured Company Highlights */}
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground text-center mb-10 font-bold">
              A few of our investments
            </p>
            
            <div className="flex justify-center items-start gap-8 md:gap-12 lg:gap-16">
              {[
                { logo: logoElective, name: "Elective", year: "2021", kpi: "TBD", url: "https://www.elective.com" },
                { logo: logoFispan, name: "FISPAN", year: "2018", kpi: "TBD", url: "https://www.fispan.com" },
                { logo: logoArticle, name: "Article", year: "2016", kpi: "TBD", url: "https://www.article.com" },
                { logo: logoThinkific, name: "Thinkific", year: "2015", kpi: "TBD", url: "https://www.thinkific.com" },
              ].map((company) => (
                <div key={company.name} className="text-center group flex-1 max-w-[180px]">
                  <a 
                    href={company.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-16 flex items-center justify-center mb-4 hover:opacity-70 transition-opacity"
                  >
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="max-h-12 w-auto object-contain mix-blend-multiply"
                    />
                  </a>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Partnered in {company.year}
                  </p>
                  <p className="text-xl font-black text-primary leading-tight min-h-[3rem] flex items-center justify-center">
                    {company.kpi}
                  </p>
                  <div className="h-1 w-8 bg-primary/30 mx-auto mt-3 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zach Quote */}
        <div className="flex flex-col md:flex-row items-center gap-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border-2 border-border/50 hover:border-primary transition-colors duration-300">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };
