

## Comparison Section Redesign - Highlight Rhino

### Current State
The section uses a 5-column grid where all three approaches (Traditional PE, Rhino, Venture Capital) have similar visual weight. The only differentiation is color (primary blue for Rhino vs muted slate for others).

### Proposed Design: Elevated Center Card

Transform the layout into three distinct cards where Rhino's card is prominently elevated and styled:

**Layout Structure:**
- Three side-by-side cards on desktop, stacked on mobile
- PE card (left) - muted, recessed appearance
- Rhino card (center) - elevated, highlighted with primary accents
- VC card (right) - muted, recessed appearance

**Rhino Card (Center) - Hero Treatment:**
- Larger scale (wider on desktop)
- Primary blue top border accent
- Subtle glow/shadow effect (shadow-primary/20)
- Slightly lighter background (bg-slate-800)
- Larger text size for bullet points
- "VS" badges positioned at the edges pointing to the other cards

**PE and VC Cards (Sides) - Subdued Treatment:**
- Darker background (bg-slate-950 or transparent)
- Smaller text, muted colors (text-slate-500)
- No border accent
- Reduced opacity or scale

**Visual Hierarchy:**
```text
+------------------+   +------------------------+   +------------------+
|  Traditional PE  |   |        RHINO           |   |  Venture Capital |
|  (muted, small)  |VS |  (elevated, primary)   |VS |  (muted, small)  |
|                  |   |                        |   |                  |
| - Point 1       |   | - Point 1 (bold)       |   | - Point 1       |
| - Point 2       |   | - Point 2 (bold)       |   | - Point 2       |
| - Point 3       |   | - Point 3 (bold)       |   | - Point 3       |
| - Point 4       |   | - Point 4 (bold)       |   | - Point 4       |
+------------------+   +------------------------+   +------------------+
```

---

### Technical Details

**File to Modify:** `src/components/ComparisonSection.tsx`

**Changes:**
1. Replace the 5-column grid with a 3-card flex/grid layout
2. Create card containers with distinct styling per column type
3. Add visual hierarchy through:
   - Scale differences (Rhino card 1.5x wider)
   - Background contrast (slate-800 vs slate-950)
   - Border accents (primary top border on Rhino)
   - Shadow/glow on Rhino card
   - Typography weight and size differences
4. Position "VS" badges between cards as floating elements
5. Ensure responsive behavior - cards stack vertically on mobile with Rhino card first

**Styling Approach:**
- Rhino card: `bg-slate-800 border-t-4 border-primary shadow-lg shadow-primary/10 p-8`
- Side cards: `bg-slate-950/50 p-6 opacity-80`
- Keep the closing quote statement unchanged

