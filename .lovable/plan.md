

# Brighten Quote Box Backgrounds

## Overview
Update the quote boxes (Zach Shapiro and Lisa Shields) to have a brighter, more inviting background that stands out better from the section backgrounds.

## Current State
Both quote boxes use:
- `bg-card/50` - a semi-transparent light gray overlay
- Section backgrounds are gray (`bg-secondary` and gradient from `secondary` to `background`)
- This creates a monotone, gray-on-gray appearance

## Design Approach
Add a subtle warm white or cream tint to brighten the cards and create visual contrast with the gray sections. This matches the warmer direction we took with the portfolio card hover states.

## Changes

### File: `src/components/TestimonialSection.tsx`

**Line 82 - Zach Quote Box:**
```tsx
// Current
bg-card/50 backdrop-blur-sm

// Updated - brighter white with subtle warm tint
bg-white/90 backdrop-blur-sm
```

### File: `src/components/FounderQuoteSection.tsx`

**Line 8 - Lisa Quote Box:**
```tsx
// Current
bg-card/50 backdrop-blur-sm

// Updated - matching brighter style
bg-white/90 backdrop-blur-sm
```

## Visual Result
- Cards will appear cleaner and brighter against the gray section backgrounds
- White base creates better contrast and feels more inviting
- Maintains the subtle transparency for visual interest
- Consistent styling across both testimonial quotes

## Technical Notes
- `bg-white/90` provides a crisp, bright base with slight transparency
- This creates clear separation from the `bg-secondary` section backgrounds
- The existing border and shadow effects will pop more against the brighter background

