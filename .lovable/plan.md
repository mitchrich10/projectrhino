

# Brighten & Add Depth to "Where We Partner" Section

## Overview
Transform the flat, monotone gray "Where We Partner" section into a brighter, more visually engaging layout with depth and warmth.

## Current Issues
- Main container uses `bg-card/80` - a dull semi-transparent gray
- Strategy tiles (StatCards) also use `bg-card/80` - creating gray-on-gray flatness
- No visual hierarchy or depth between elements
- Section gradient (`from-background via-background to-secondary`) is all gray tones

## Design Approach
1. **Brighten the main container** to a clean white base (matching the quote boxes)
2. **Add depth to StatCards** with a subtle warm white background and enhanced hover states
3. **Enhance the Producer Businesses grid** with subtle background cards for each category
4. **Add visual accents** like subtle gradients or colored top borders

---

## Changes

### File: `src/components/StrategySection.tsx`

**Line 90 - Main Container:**
Update from dull gray to bright white with better shadow:
```tsx
// From
<div className="border-2 border-border/60 bg-card/80 backdrop-blur-sm p-10 md:p-14">

// To  
<div className="border-2 border-border/50 bg-white/95 backdrop-blur-sm p-10 md:p-14 shadow-lg">
```

**Lines 130-155 - Producer Category Cards:**
Wrap each category column in a subtle background card for depth:
```tsx
// From
<div key={idx} className="flex flex-col">

// To
<div key={idx} className="flex flex-col bg-white/60 p-6 rounded-lg border border-border/30 hover:border-primary/30 hover:shadow-md transition-all duration-300">
```

### File: `src/components/StatCard.tsx`

**Lines 13-17 - Card Styling:**
Update to bright white with warmer hover (matching portfolio cards):
```tsx
// From
"p-10 border-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-300"

// To
"p-10 border-2 border-border/40 bg-white shadow-sm hover:bg-sky-50/70 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-200/40 transition-all duration-300"
```

---

## Visual Result
- **Main container**: Clean white (`bg-white/95`) with soft shadow - pops off the gray section background
- **Strategy tiles**: Solid white (`bg-white`) with warm sky-blue hover states (consistent with portfolio cards)
- **Producer categories**: Subtle white cards (`bg-white/60`) with gentle borders - creates layered depth
- **Overall**: Brighter, more inviting with clear visual hierarchy

## Technical Notes
- Uses `bg-white/95` for main container to maintain slight transparency
- Strategy card hover matches portfolio cards (`sky-50/70`, `sky-400`, `sky-200/40`)
- Producer cards get subtle rounded corners (`rounded-lg`) to differentiate from main container's sharp edges
- All changes maintain the existing spacing and layout structure

