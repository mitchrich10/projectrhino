

# Team Section: Card Flip Animation (Refined)

## Overview
Remove the team group photo and add an interactive card flip animation. The front shows the headshot with name/role/LinkedIn, and the back reveals portfolio companies in a 2-column layout. Candace's card will not flip since she's in Operations.

## Design Details

### Card Behavior
- **Fraser, Jay, Mitch, Nicholas**: Flip on hover to reveal portfolio
- **Candace**: No flip animation (Operations role, no portfolio)

### Back Face Design
- **Background**: Primary blue (`bg-primary`)
- **Text**: White for contrast against the blue
- **Layout**: 2-column grid for company names
- **Header**: "Portfolio" in uppercase at top
- **No scrolling**: All companies fit within the card

### Visual Layout

```text
FRONT (default)                    BACK (on hover)
+---------------------------+      +---------------------------+
|                           |      |     PORTFOLIO             |
|       [HEADSHOT]          |      |                           |
|                           |      |  Company 1  |  Company 2  |
|                           |      |  Company 3  |  Company 4  |
+---------------------------+      |  Company 5  |  Company 6  |
| Name                  [in]|      |  ...        |  ...        |
| Role                      |      |                           |
+---------------------------+      +---------------------------+
```

## Implementation Details

### TeamSection.tsx Changes

1. **Remove team group photo** - Delete import and JSX for `team-group.png`

2. **Update TeamMember interface** - Add optional `portfolio` field back

3. **Add portfolio data** (alphabetically sorted per memory):
   - Fraser Hall: Article, Aspect Biosystems, Curatio, FansUnite, Fatigue Science, Klue, Pressboard, ShopVision, Sokanu, ThinkCX, Thinkific, Tutela
   - Jay Rhind: Arlo, Beanworks, Edvisor, Elective, FISPAN, Flint, Grow Technologies, Klue, MARZ, Peerboard, Quinn AI, Showbie, Thinkific, Tutela, Twig, Upper Village
   - Mitch Richardson: Elective, MyFO, NetNow, Stem Health, Super Advisor, Twig Fertility
   - Nicholas Hyldelund: Curatio, Ontopical, Peerboard, Showbie
   - Candace Hobin: No portfolio (Operations)

4. **Redesign TeamMemberCard component**:
   - Check if `portfolio` exists to determine if card should flip
   - If no portfolio (Candace): render current static design
   - If portfolio exists: wrap in 3D flip container

5. **3D Flip Structure** (for cards with portfolio):
   ```tsx
   <div className="[perspective:1000px] aspect-[3/4]">
     <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
       {/* Front Face */}
       <div className="absolute inset-0 [backface-visibility:hidden]">
         {/* Current headshot design */}
       </div>
       {/* Back Face */}
       <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary p-6 flex flex-col">
         <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Portfolio</h4>
         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
           {portfolio.map(company => (
             <span className="text-xs text-white">{company}</span>
           ))}
         </div>
       </div>
     </div>
   </div>
   ```

6. **Candace's static card** (no flip):
   ```tsx
   <div className="relative overflow-hidden aspect-[3/4]">
     {/* Current headshot with name/role/LinkedIn overlay */}
   </div>
   ```

### Styling Notes
- Back face uses `bg-primary` (the brand blue)
- White text (`text-white`) for all content on back
- 2-column grid with small gap for readability
- Company names in small text (`text-xs`) to fit all entries
- Consistent padding (`p-6`) for visual balance

## Files to Modify
- `src/components/TeamSection.tsx` - Add flip animation, portfolio data, conditional rendering

