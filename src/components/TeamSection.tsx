import { FC } from "react";
import teamGroup from "@/assets/team-group.png";
import rhinoDetail from "@/assets/rhino-detail.jpg";
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
  <div className="group p-8 border border-border bg-card hover:shadow-md transition-all duration-300">
    <div className="w-24 h-24 rounded-full mb-6 overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
      <img src={photo} alt={name} className="w-full h-full object-cover" />
    </div>
    <h4 className="text-lg font-black uppercase tracking-tight mb-1 text-foreground group-hover:text-primary transition-colors">{name}</h4>
    <p className="text-[10px] font-bold uppercase tracking-ultra text-primary mb-4">{role}</p>
    <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
  </div>
);

const TeamSection: FC = () => {
  return (
    <section id="team" className="py-32 px-6 bg-secondary border-y border-border">
      <div className="max-w-7xl mx-auto">
        {/* About Us Header with Rhino Philosophy */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-ultra text-primary mb-4">
              About Us
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">
              The Rhino <br />Journey
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
              <img 
                src={rhinoDetail} 
                alt="Rhino detail" 
                className="w-full h-auto grayscale opacity-80"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-muted/30 blur-3xl rounded-full" />
          </div>
        </div>

        {/* Team photo */}
        <div className="mb-20">
          <div className="overflow-hidden border border-border rounded-sm">
            <img 
              src={teamGroup} 
              alt="The Rhino team" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        <div className="mb-16 text-center">
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-6">
            Meet The Team
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combined decades of technology and entrepreneurial experience
          </p>
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
