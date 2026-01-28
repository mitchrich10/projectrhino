

# Team Section Redesign

## Overview
Transform the team section from detailed cards to a clean, image-focused layout with headshots and bottom-aligned overlaid names/titles with LinkedIn profile links.

## Design Approach

### Visual Layout
```text
+---------------------------+
|                           |
|                           |
|       [HEADSHOT]          |
|                           |
|                           |
+---------------------------+
| Name                  [in]|
| Role                      |
+---------------------------+
         ↑
   Bottom-aligned with 
   ~16px padding from edge
```

- Name, role, and LinkedIn icon aligned to bottom edge with consistent padding
- Subtle gradient overlay from transparent to dark at the bottom for text readability
- LinkedIn icon positioned at bottom-right corner
- Hover effect: slight image zoom and LinkedIn icon highlight

## Implementation Details

### TeamSection.tsx Changes

1. **Simplify team data structure**:
   - Remove `bio` and `portfolio` fields
   - Add `linkedin` field with provided URLs

2. **LinkedIn URLs**:
   - Fraser Hall: `https://www.linkedin.com/in/fraser-h-b9a65b1b7/`
   - Jay Rhind: `https://www.linkedin.com/in/jayrhind/`
   - Mitch Richardson: `https://www.linkedin.com/in/mitchell-j-richardson/`
   - Nicholas Hyldelund: `https://www.linkedin.com/in/nicholas-hyldelund/`
   - Candace Hobin: `https://www.linkedin.com/in/candacehobin/`

3. **Redesign TeamMemberCard component**:
   - Container: `relative`, `overflow-hidden`, `group` for hover states
   - Image: `aspect-[3/4]` ratio for portrait orientation, `object-cover`
   - Gradient overlay: `bg-gradient-to-t from-black/70 via-black/20 to-transparent` covering bottom third
   - Text container: Absolutely positioned at `bottom-0`, `left-0`, `right-0` with `p-4` padding
   - Name: White text, bold, uppercase tracking
   - Role: Smaller white text with slight opacity
   - LinkedIn icon: Positioned bottom-right, white, with hover highlight effect
   - Hover: Subtle image scale (`group-hover:scale-105`) with transition

4. **Keep existing elements**:
   - Team group photo at top
   - Section header "Meet The Team"
   - 3-column responsive grid (5 members)

## Files to Modify
- `src/components/TeamSection.tsx` - Complete redesign of the card component and data structure

