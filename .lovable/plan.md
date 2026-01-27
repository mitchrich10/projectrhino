
# Add Real Depth to "Where We Partner" Section

## The Problem
We swapped gray-on-gray for white-on-white - everything inside the main container is now white (`bg-white`, `bg-white/95`, `bg-white/60`), creating the same flatness just in a different shade.

## The Solution: Layered Contrast with Color Accents
Instead of making everything the same color, create a clear visual hierarchy:

1. **Keep the main container bright** - white pops off the gray section background
2. **Give StatCards a subtle tinted background** - light sky/slate tint, NOT white
3. **Remove the redundant white cards around Producer categories** - they just add clutter
4. **Add colored left borders to StatCards** - matches the primary brand color for accent
5. **Enhance Producer cards with stronger category-colored accents**

---

## Changes

### File: `src/components/StatCard.tsx`

Update to use a subtle gray-blue tint with a left accent border:
```tsx
// Current
"p-10 border-2 border-border/40 bg-white shadow-sm hover:bg-sky-50/70 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-200/40 transition-all duration-300"

// Updated - subtle tinted background with left accent
"p-10 border-l-4 border-l-primary border border-border/30 bg-slate-50/80 shadow-sm hover:bg-sky-50 hover:border-sky-300 hover:border-l-sky-500 hover:shadow-lg hover:shadow-sky-200/40 transition-all duration-300"
```

**Visual effect:**
- `bg-slate-50/80` - very light blue-gray tint (not pure white)
- `border-l-4 border-l-primary` - bold left accent in brand blue
- Creates visual distinction from the white main container

---

### File: `src/components/StrategySection.tsx`

**Producer Category Cards (Line 130):**
Replace the white overlay with category-colored left borders and no background:
```tsx
// Current
"flex flex-col bg-white/60 p-6 rounded-lg border border-border/30 hover:border-primary/30 hover:shadow-md transition-all duration-300"

// Updated - open layout with colored left border
"flex flex-col pl-4 border-l-4 ${colors.leftBorder} hover:translate-x-1 transition-all duration-300"
```

**Add `leftBorder` to categoryColors (Lines 40-55):**
```tsx
Healthcare: {
  ...
  leftBorder: "border-l-emerald-400",
},
"Wealth Management": {
  ...
  leftBorder: "border-l-blue-400",
},
"Financial & Advisory Services": {
  ...
  leftBorder: "border-l-purple-400",
},
```

---

## Visual Result
- **Main container**: Clean white - pops against gray section background
- **StatCards**: Subtle slate tint + bold primary left accent - clearly distinct from container
- **Producer categories**: Open layout with category-colored left borders - no redundant white boxes
- **Overall**: Real layered depth with color accents breaking the monotony

## Technical Notes
- Uses `slate-50/80` for StatCards - a cooler gray-blue that contrasts with pure white
- Left border accents (4px) add visual punch without heavy shadows
- Producer cards lose the boxed look, gaining an elegant "content indent" style
- Hover on producers adds subtle `translate-x-1` for tactile feedback
