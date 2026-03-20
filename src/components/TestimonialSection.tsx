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
        {/* Tagline + Featured Companies */}
        <div className="mb-16">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground text-center mb-12">We partner with ambitious builders to change trajectories.</p>
          
          {/* Featured Company Highlights */}
          <div className="flex justify-center items-start gap-8 md:gap-12 lg:gap-16">
            {[
              { logo: logoElective, name: "Elective", year: "2021", kpiValue: "$0M to $10M", kpiLabel: "Annual Revenue", url: "https://www.elective.com" },
              { logo: logoFispan, name: "FISPAN", year: "2018", kpiValue: "$0M to $35M", kpiLabel: "ARR", url: "https://www.fispan.com" },
              { logo: logoArticle, name: "Article", year: "2016", kpiValue: "$0M to $68M", kpiLabel: "EBITDA", url: "https://www.article.com" },
              { logo: logoThinkific, name: "Thinkific", year: "2015", kpiValue: "$0M to $83M", kpiLabel: "ARR", url: "https://www.thinkific.com" },
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
                <div className="min-h-[3.5rem] flex flex-col items-center justify-center">
                  <p className="text-xl font-black leading-tight" style={{ color: 'var(--color-blue)' }}>
                    {company.kpiValue}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {company.kpiLabel}
                  </p>
                </div>
                <div className="h-1 w-8 bg-primary/30 mx-auto mt-3 group-hover:w-full group-hover:bg-primary transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Track Record Stats */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">10 years, 3 funds, proven success</h3>
          
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-3xl mx-auto">
            {/* Companies */}
            <div className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] md:min-h-0">
              <p className="text-2xl md:text-5xl font-black leading-none mb-1 md:mb-2" style={{ color: 'var(--color-mint)' }}>35</p>
              <p className="text-[8px] md:text-xs uppercase tracking-widest text-muted-foreground text-center">Companies</p>
            </div>
            
            {/* Portfolio Annual Revenue */}
            <div className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] md:min-h-0">
              <p className="text-2xl md:text-5xl font-black leading-none mb-1 md:mb-2 mt-1 md:mt-0" style={{ color: 'var(--color-mint)' }}>$700M+</p>
              <p className="text-[8px] md:text-xs uppercase tracking-widest text-muted-foreground text-center">Portfolio Revenue</p>
            </div>
            
            {/* Exits */}
            <div className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] md:min-h-0">
              <p className="text-2xl md:text-5xl font-black leading-none mb-1 md:mb-2 -ml-1" style={{ color: 'var(--color-mint)' }}>12</p>
              <p className="text-[8px] md:text-xs uppercase tracking-widest text-muted-foreground text-center">Exits</p>
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
