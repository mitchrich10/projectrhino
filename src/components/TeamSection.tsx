import { FC } from "react";
import { Linkedin } from "lucide-react";
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
  portfolio?: string[];
  objectPosition?: string;
  /** Optional transform to force a tighter crop inside the fixed 3:4 card */
  photoTransform?: string;
}

const team: TeamMember[] = [
  {
    name: "Fraser Hall",
    role: "Investor",
    photo: fraserPhoto,
    linkedin: "https://www.linkedin.com/in/fraser-h-b9a65b1b7/",
    portfolio: ["Article", "Aspect Biosystems", "Curatio", "FansUnite", "Fatigue Science", "Klue", "Pressboard", "ShopVision", "Sokanu", "ThinkCX", "Thinkific", "Tutela"]
  },
  {
    name: "Jay Rhind",
    role: "Investor",
    photo: jayPhoto,
    linkedin: "https://www.linkedin.com/in/jayrhind/",
    portfolio: ["Arlo", "Beanworks", "Edvisor", "Elective", "FISPAN", "Flint", "Grow Technologies", "Klue", "MARZ", "Peerboard", "Quinn AI", "Showbie", "Thinkific", "Tutela", "Twig", "Upper Village"]
  },
  {
    name: "Mitch Richardson",
    role: "Investor",
    photo: mitchPhoto,
    linkedin: "https://www.linkedin.com/in/mitchell-j-richardson/",
    portfolio: ["Elective", "MyFO", "NetNow", "Stem Health", "Super Advisor", "Twig Fertility"],
    objectPosition: "center top"
  },
  {
    name: "Nicholas Hyldelund",
    role: "Investor",
    photo: nicholasPhoto,
    linkedin: "https://www.linkedin.com/in/nicholas-hyldelund/",
    portfolio: ["Curatio", "Ontopical", "Peerboard", "Showbie"]
  },
  {
    name: "Candace Hobin",
    role: "Operations",
    photo: candacePhoto,
    linkedin: "https://www.linkedin.com/in/candacehobin/"
  }
];

const TeamMemberCard: FC<TeamMember> = ({ name, role, photo, linkedin, portfolio, objectPosition, photoTransform }) => {
  const effectivePhotoTransform =
    photoTransform ?? (name === "Mitch Richardson" ? "translateY(-10%) scale(1.18)" : undefined);
  const photoWrapperStyle = effectivePhotoTransform ? { transform: effectivePhotoTransform } : undefined;

  // Static card for members without portfolio (Candace)
  if (!portfolio) {
    return (
      <div className="relative group overflow-hidden aspect-[3/4]">
        <div className="w-full h-full" style={photoWrapperStyle}>
          <img 
            src={photo} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={objectPosition ? { objectPosition } : undefined}
          />
        </div>
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
  }

  // Flipping card for members with portfolio
  return (
    <div className="[perspective:1000px] aspect-[3/4] group">
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front Face */}
        <div className="absolute inset-0 [backface-visibility:hidden] overflow-hidden">
          <div className="w-full h-full" style={photoWrapperStyle}>
            <img 
              src={photo} 
              alt={name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={objectPosition ? { objectPosition } : undefined}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div>
              <h4 className="text-base font-black uppercase tracking-tight text-white">{name}</h4>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">{role}</p>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Portfolio</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 content-start">
            {portfolio.map((company, index) => (
              <span key={index} className="text-[11px] leading-tight text-white">{company}</span>
            ))}
          </div>
          <a 
            href={linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label={`${name}'s LinkedIn profile`}
          >
            <Linkedin size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

const TeamSection: FC = () => {
  return (
    <section id="team" className="py-32 px-6 bg-gradient-to-b from-background via-secondary to-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
            Meet <span className="text-primary">The Team</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {team.map((member, i) => (
            <TeamMemberCard key={i} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { TeamSection };
