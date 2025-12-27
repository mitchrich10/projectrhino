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
}

const team: TeamMember[] = [
  {
    name: "Fraser Hall",
    role: "Investor",
    bio: "Co-founder and former Chairman of Recon Instruments. After a successful exit to Intel in 2015, Fraser co-founded Rhino to support entrepreneurs underserved in Western Canada.",
    photo: fraserPhoto
  },
  {
    name: "Jay Rhind",
    role: "Investor",
    bio: "Co-founded Rhino in 2015. Intensely focused on finding companies not well served by the traditional venture model. Former Adjunct Professor at UBC.",
    photo: jayPhoto
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
    photo: nicholasPhoto
  },
  {
    name: "Mitch Richardson",
    role: "Investor, CFA",
    bio: "Deeply driven to support founders in reaching ambitious goals. Previously spent five years with a Canadian financial services company across North America and Asia.",
    photo: mitchPhoto
  }
];

const TeamMemberCard: FC<TeamMember> = ({ name, role, bio, photo }) => (
  <div className="group p-8 border border-border bg-surface-elevated hover:bg-muted/30 transition-all duration-300">
    <div className="w-24 h-24 rounded-full mb-6 overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
      <img src={photo} alt={name} className="w-full h-full object-cover" />
    </div>
    <h4 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">{name}</h4>
    <p className="text-[10px] font-bold uppercase tracking-ultra text-primary/80 mb-4">{role}</p>
    <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
  </div>
);

const TeamSection: FC = () => {
  return (
    <section id="team" className="py-32 px-6 bg-secondary border-y border-border">
      <div className="max-w-7xl mx-auto">
        {/* Hero team photo */}
        <div className="mb-20 relative">
          <div className="aspect-[21/9] overflow-hidden border border-border">
            <img 
              src={teamGroup} 
              alt="The Rhino team" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
        </div>

        <div className="mb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-ultra text-muted-foreground mb-4">
            About Us
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            Meet The Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combined decades of technology and entrepreneurial experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {team.map((member, i) => (
            <TeamMemberCard key={i} {...member} />
          ))}
          <div className="p-8 border border-dashed border-border bg-background/50 flex items-center justify-center">
            <a 
              href="#contact" 
              className="text-[11px] font-black uppercase tracking-ultra text-muted-foreground hover:text-foreground transition-colors"
            >
              Join Our Team →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TeamSection };
