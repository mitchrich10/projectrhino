import { FC, useState } from "react";
import { resolvePartnershipLogo, badgeColorFor, PartnershipLogoSource } from "@/lib/partnershipLogo";

interface Props extends PartnershipLogoSource {
  name: string;
  size?: "sm" | "lg";
}

/**
 * Renders a partnership logo if available, otherwise a circular fallback badge
 * with the first letter and a brand-tinted background.
 */
const PartnerLogoOrBadge: FC<Props> = ({ name, size = "sm", ...source }) => {
  const [failed, setFailed] = useState(false);
  const url = failed ? null : resolvePartnershipLogo(source);

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        decoding="async"
        className="object-contain block mx-auto"
        style={{
          width: "100%",
          maxHeight: size === "lg" ? 56 : 48,
          maxWidth: 180,
        }}
        onError={() => setFailed(true)}
      />
    );
  }

  const diameter = size === "lg" ? 56 : 48;
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold mx-auto select-none"
      style={{
        width: diameter,
        height: diameter,
        backgroundColor: badgeColorFor(name),
        fontSize: size === "lg" ? 22 : 18,
        fontFamily: "'DM Sans', sans-serif",
      }}
      aria-label={name}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
};

export default PartnerLogoOrBadge;
