import { FC } from "react";
import { Linkedin } from "lucide-react";
import teamGroup from "@/assets/team-group.png";
import fraserPhoto from "@/assets/team-fraser.png";
import jayPhoto from "@/assets/team-jay.png";
import candacePhoto from "@/assets/team-candace.png";
import nicholasPhoto from "@/assets/team-nicholas.png";
import mitchPhoto from "@/assets/team-mitch.png";

interface TeamMember {
  name: string;
  role: string;
  photo: string;
  linkedin: string;
}

const team: TeamMember[] = [
  {
    name: "Fraser Hall",
    role: "Investor",
    photo: fraserPhoto,
    linkedin: "https://www.linkedin.com/in/fraser-h-b9a65b1b7/"
  },
  {
    name: "Jay Rhind",
    role: "Investor",
    photo: jayPhoto,
    linkedin: "https://www.linkedin.com/in/jayrhind/"
  },
  {
    name: "Mitch Richardson",
    role: "Investor",
    photo: mitchPhoto,
    linkedin: "https://www.linkedin.com/in/mitchell-j-richardson/"
  },
  {
    name: "Nicholas Hyldelund",
    role: "Investor",
    photo: nicholasPhoto,
    linkedin: "https://www.linkedin.com/in/nicholas-hyldelund/"
  },
  {
    name: "Candace Hobin",
    role: "Operations",
    photo: candacePhoto,
    linkedin: "https://www.linkedin.com/in/candacehobin/"
  }
];

const TeamMemberCard: FC<TeamMember> = ({ name, role, photo, linkedin }) => (
  <div className="relative group overflow-hidden aspect-[3/4]">
    <img 
      src={photo} 
      alt={name} 
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-base font-black uppercase tracking-tight text-white">{name}</h4>
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">{role}</p>
        </div>
        <a 
          href={linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/80 hover:text-primary transition-colors"
          aria-label={`${name}'s LinkedIn profile`}
        >
          <Linkedin size={20} />
        </a>
      </div>
    </div>
  </div>
);

const TeamSection: FC = () => {
  return (
    <section id="team" className="py-32 px-6 bg-gradient-to-b from-background via-secondary to-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
            Meet <span className="text-primary">The Team</span>
          </h3>
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
