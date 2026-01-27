

# Fix Photo Positioning Behind Active Portfolio Header

## Problem
The "Active Portfolio" header text is covering faces in the middle 2 photos (Joe Fortes and K1 Speed photos).

## Solution
Swap positions 3 and 4 so the K1 Speed photo moves to the far right edge, and also add `object-position` adjustments to better frame the faces in each photo.

---

## Changes

### File: `src/components/PortfolioSection.tsx`

**Swap photo positions 3 and 4 (lines 227-232):**

Current order:
- Position 3: activePhoto3 (K1 Speed)
- Position 4: activePhoto4 (Zeppelin)

New order:
- Position 3: activePhoto4 (Zeppelin)
- Position 4: activePhoto3 (K1 Speed)

**Also add object-position to better frame faces:**
- Use `object-top` or `object-bottom` on specific photos to shift the crop point away from where the header overlays

```tsx
{/* Photo Background Grid - 4 columns */}
<div className="absolute inset-0 z-0 grid grid-cols-4">
  <div className="relative overflow-hidden">
    <img src={activePhoto1} alt="" className="w-full h-full object-cover opacity-40" />
  </div>
  <div className="relative overflow-hidden">
    <img src={activePhoto2} alt="" className="w-full h-full object-cover object-top opacity-40" />
  </div>
  <div className="relative overflow-hidden">
    <img src={activePhoto4} alt="" className="w-full h-full object-cover object-top opacity-40" />
  </div>
  <div className="relative overflow-hidden">
    <img src={activePhoto3} alt="" className="w-full h-full object-cover opacity-40" />
  </div>
  {/* Gradient overlay for text readability */}
  <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background/40 to-background/80" />
</div>
```

---

## Visual Result
- K1 Speed (Mario Kart) photo moves to far right where faces won't be covered
- Zeppelin photo moves to position 3
- `object-top` on middle photos shifts the image crop upward, showing more of the top of the photo (where faces typically are) rather than center-cropping

## Technical Note
- `object-top` changes the crop anchor point from center to top
- If faces are at the bottom of any photo, we can use `object-bottom` instead

