import { FC } from "react";
import teamGroup from "@/assets/team-group.png";
import fraserPhoto from "@/assets/team-fraser.png";
import jayPhoto from "@/assets/team-jay.png";
import candacePhoto from "@/assets/team-candace.png";
import nicholasPhoto from "@/assets/team-nicholas.png";
import mitchPhoto from "@/assets/team-mitch.jpg";
import foundersHike from "@/assets/founders-hike.jpg";
import foundersPickleball from "@/assets/founders-pickleball.jpg";
import foundersOntopical from "@/assets/founders-ontopical.jpg";

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
    portfolio: ["Company A", "Company B", "Company C"]
  },
  {
    name: "Jay Rhind",
    role: "Investor",
    bio: "Co-founded Rhino in 2015. Intensely focused on finding companies not well served by the traditional venture model. Former Adjunct Professor at UBC.",
    photo: jayPhoto,
    portfolio: ["Company D", "Company E", "Company F"]
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
    portfolio: ["Company G", "Company H", "Company I"]
  },
  {
    name: "Mitch Richardson",
    role: "Investor",
    bio: "Deeply driven to support founders in reaching ambitious goals. Previously spent five years with a Canadian financial services company across North America and Asia.",
    photo: mitchPhoto,
    portfolio: ["Company J", "Company K", "Company L"]
  }
];

const TeamMemberCard: FC<TeamMember> = ({ name, role, bio, photo, portfolio }) => (
  <div className="group p-8 border border-border bg-card hover:shadow-md transition-all duration-300 flex flex-col">
    <div className="w-24 h-24 rounded-full mb-6 overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
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
    <section id="team" className="pt-6 pb-32 px-6 bg-gradient-to-b from-background via-secondary to-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Founder relationship photos - closer to portfolio */}
        <div className="mb-20">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">
            Building relationships with our founders
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="group">
              <div className="overflow-hidden rounded-sm aspect-[4/3]">
                <img 
                  src={foundersHike} 
                  alt="ShopVision and Rhino team hiking" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">ShopVision & Rhino team</p>
            </div>
            <div className="group">
              <div className="overflow-hidden rounded-sm aspect-[4/3]">
                <img 
                  src={foundersPickleball} 
                  alt="FSPAN and Rhino team at pickleball event" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">FSPAN & Rhino team</p>
            </div>
            <div className="group">
              <div className="overflow-hidden rounded-sm aspect-[4/3]">
                <img 
                  src={foundersOntopical} 
                  alt="Ontopical and Rhino team celebrating" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Ontopical & Rhino team</p>
            </div>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-4">
            Meet The Team
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
