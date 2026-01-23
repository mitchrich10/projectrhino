import { FC } from "react";
import teamGroup from "@/assets/team-group.png";
import fraserPhoto from "@/assets/team-fraser.png";
import jayPhoto from "@/assets/team-jay.png";
import candacePhoto from "@/assets/team-candace.png";
import nicholasPhoto from "@/assets/team-nicholas.png";
import mitchPhoto from "@/assets/team-mitch.jpg";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
  portfolio?: string[];
}

const team: TeamMember[] = [
  {
    name: "Fraser Hall",
    role: "Investor",
    bio: "Co-founder and former Chairman of Recon Instruments. After a successful exit to Intel in 2015, Fraser co-founded Rhino to support entrepreneurs underserved in Western Canada.",
    photo: fraserPhoto,
    portfolio: ["Article", "Aspect Biosystems", "Fatigue Sciences", "Klue", "ShopVision", "Thinkific"]
  },
  {
    name: "Jay Rhind",
    role: "Investor",
    bio: "Co-founded Rhino in 2015. Intensely focused on finding companies not well served by the traditional venture model. Former Adjunct Professor at UBC.",
    photo: jayPhoto,
    portfolio: ["Edvisor", "Elective", "FISPAN", "Flint", "MARZ", "Quinn AI", "Showbie", "Twig Fertility", "Upper Village"]
  },
  {
    name: "Candace Hobin",
    role: "Operations",
    bio: "Responsible for organizing events, LP communications, marketing, and fund management. Background in traditional finance and client relations.",
    photo: candacePhoto
  },
  {
    name: "Nicholas Hyldelund",
    role: "Investor",
    bio: "Originally from Denmark, passionate about technologies with global impact. Responsible for deal sourcing, due diligence, and supporting portfolio companies.",
    photo: nicholasPhoto,
    portfolio: ["Ontopical"]
  },
  {
    name: "Mitch Richardson",
    role: "Investor",
    bio: "Deeply driven to support founders in reaching ambitious goals. Previously spent five years with a Canadian financial services company across North America and Asia.",
    photo: mitchPhoto,
    portfolio: ["MyFO", "NetNow", "Stem Health", "Super Advisor", "Twig Fertility"]
  }
];

const TeamMemberCard: FC<TeamMember> = ({ name, role, bio, photo, portfolio }) => (
  <div className="group p-8 border border-border bg-card hover:shadow-md transition-all duration-300 flex flex-col">
    <div className="w-32 h-32 rounded-full mb-6 overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
      <img src={photo} alt={name} className="w-full h-full object-cover" />
    </div>
    <h4 className="text-lg font-black uppercase tracking-tight mb-1 text-foreground group-hover:text-primary transition-colors">{name}</h4>
    <p className="text-[10px] font-bold uppercase tracking-ultra text-primary mb-4">{role}</p>
    <p className="text-xs text-muted-foreground leading-relaxed flex-grow">{bio}</p>
    {portfolio && portfolio.length > 0 && (
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[9px] font-bold uppercase tracking-ultra text-muted-foreground mb-2">Portfolio</p>
        <p className="text-[11px] text-foreground">{portfolio.join(" · ")}</p>
      </div>
    )}
  </div>
);

const TeamSection: FC = () => {
  return (
    <section id="team" className="py-32 px-6 bg-gradient-to-b from-background via-secondary to-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-4">
            Meet <span className="text-primary">The Team</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Decades of combined technology and entrepreneurial experience
          </p>
        </div>

        {/* Team photo */}
        <div className="mb-12">
          <div className="overflow-hidden rounded-sm">
            <img 
              src={teamGroup} 
              alt="The Rhino team" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member, i) => (
            <TeamMemberCard key={i} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { TeamSection };
