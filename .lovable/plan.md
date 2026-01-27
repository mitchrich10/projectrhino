
# Update Active Portfolio Card Hover Effect

## Overview
Replace the current dark blue tint (`hover:bg-primary/10`) with a warmer, lighter color wash that feels more inviting - similar to the amber effect on exited cards but with a different hue.

## Design Approach
- Use a soft, warm sky blue or cyan tint instead of the saturated primary blue
- Maintain visual distinction from the amber/gold exit cards
- Keep the hover shadow but with a warmer tone to match

## Changes

### File: `src/components/PortfolioCard.tsx`

**Current (line 67):**
```tsx
: "bg-white border-border hover:bg-primary/10 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-t-2 border-t-primary/20";
```

**Updated:**
```tsx
: "bg-white border-border hover:bg-sky-50/70 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-200/40 transition-all duration-300 border-t-2 border-t-primary/20";
```

**Also update the divider border (line 106):**
```tsx
// Change from group-hover:border-primary/50 to match the new warm hover
group-hover:border-sky-400/50
```

## Visual Result
- Background tint: Light sky blue (`sky-50/70`) - warm and inviting
- Border on hover: Sky blue (`sky-400`) - vibrant but not overwhelming  
- Shadow: Soft sky glow (`sky-200/40`) - creates warmth and lift
- Creates a nice visual pairing with amber exit cards while maintaining distinction

## Technical Notes
- `sky-50` is a very light, warm blue (warmer than primary)
- This mirrors the exited card pattern (`amber-50/50`, `amber-400`, `amber-200/40`)
- The top border accent stays primary blue (`border-t-primary/20`) to maintain brand consistency
