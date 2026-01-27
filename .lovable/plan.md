
# Add Photo Wheel Behind Active Portfolio Header

## Overview
Add a 4-column photo gallery behind the "Active Portfolio" header, using the 4 photos you uploaded. This follows the same pattern as the footer's ContactSection but with 4 images instead of 3.

## Photos to Use
1. `PXL_20250611_023430452.jpg` - Colorful retro golf outfits outdoors
2. `IMG_1629.jpg` - Joe Fortes group photo with rhino trophy
3. `IMG_5168.jpg` - Mario Kart costumes at K1 Speed
4. `IMG_9323_1_1.jpg` - Mad scientist costumes at Zeppelin

---

## Implementation

### Step 1: Copy Photos to Project Assets

Copy the 4 uploaded photos to `src/assets/`:
- `active-portfolio-1.jpg`
- `active-portfolio-2.jpg`
- `active-portfolio-3.jpg`
- `active-portfolio-4.jpg`

### Step 2: Update PortfolioSection.tsx

**Add imports at top of file:**
```tsx
import activePhoto1 from "@/assets/active-portfolio-1.jpg";
import activePhoto2 from "@/assets/active-portfolio-2.jpg";
import activePhoto3 from "@/assets/active-portfolio-3.jpg";
import activePhoto4 from "@/assets/active-portfolio-4.jpg";
```

**Replace the Active Portfolio header block (lines 120-127):**

Transform from:
```tsx
<div className="mb-12 text-center">
  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
    Active Portfolio
  </h3>
  <p className="text-lg md:text-xl text-muted-foreground mt-3 italic">The Crash — a herd of Rhinos</p>
</div>
```

To:
```tsx
<div className="mb-12 text-center relative overflow-hidden py-16">
  {/* Photo Background Grid - 4 columns */}
  <div className="absolute inset-0 z-0 grid grid-cols-4">
    <div className="relative overflow-hidden">
      <img src={activePhoto1} alt="" className="w-full h-full object-cover opacity-40" />
    </div>
    <div className="relative overflow-hidden">
      <img src={activePhoto2} alt="" className="w-full h-full object-cover opacity-40" />
    </div>
    <div className="relative overflow-hidden">
      <img src={activePhoto3} alt="" className="w-full h-full object-cover opacity-40" />
    </div>
    <div className="relative overflow-hidden">
      <img src={activePhoto4} alt="" className="w-full h-full object-cover opacity-40" />
    </div>
    {/* Gradient overlay for text readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background/40 to-background/80" />
  </div>
  
  {/* Header text - positioned above photos */}
  <div className="relative z-10">
    <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
      Active Portfolio
    </h3>
    <p className="text-lg md:text-xl text-muted-foreground mt-3 italic">The Crash — a herd of Rhinos</p>
  </div>
</div>
```

---

## Visual Result
- 4 photos displayed side-by-side behind the "Active Portfolio" header
- Low opacity (40%) keeps photos subtle - matching the footer pattern
- Gradient overlay ensures the header text remains crisp and readable
- Photos fade smoothly into the section background below

## Technical Details
- Uses `grid-cols-4` instead of the footer's `grid-cols-3`
- Same `opacity-40` as footer for consistency
- Same gradient overlay pattern: `from-secondary/60 via-background/40 to-background/80`
- `py-16` adds vertical padding to give the header breathing room with the photos
- `relative overflow-hidden` on container clips photos cleanly

## Next Steps
After implementing this for Active Portfolio, you can upload 4 more photos for the Exits header. For Exits, I'll use a warmer amber-tinted gradient overlay to reinforce the "Golden Crash" theme.
