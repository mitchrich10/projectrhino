
# Comparison Block: Private Equity vs. Rhino

## Overview
Create a comparison section contrasting Traditional Private Equity with Rhino's philosophy, placed **after the Zach Shapiro quote** in TestimonialSection.

## Placement
The component will be added to `Index.tsx` after `<TestimonialSection />` and before `<StrategySection />`.

## Visual Layout

```text
+------------------------------------------------------------------+
|              PRIVATE EQUITY vs. RHINO                            |
+------------------------------------------------------------------+
|  +----------------------------+  +----------------------------+  |
|  | TRADITIONAL PRIVATE EQUITY |  | RHINO                      |  |
|  | (muted styling)            |  | (primary accent)           |  |
|  |                            |  |                            |  |
|  | • Financial optimization   |  | • Business fundamentals    |  |
|  |   first                    |  |   first                    |  |
|  | • Leverage and cost-       |  | • Organic growth before    |  |
|  |   cutting drive returns    |  |   financial engineering    |  |
|  | • Shorter time horizons    |  | • Long-term partners,      |  |
|  |                            |  |   not exit timers          |  |
|  | • Low tolerance for        |  | • Comfortable investing    |  |
|  |   experimentation          |  |   through uncertainty      |  |
|  +----------------------------+  +----------------------------+  |
|                                                                  |
|  "We're not here to optimize your business for a quick sale.     |
|   We're here to help you build one that lasts."                  |
+------------------------------------------------------------------+
```

## Implementation

### 1. Create `src/components/ComparisonSection.tsx`
- Section with `bg-secondary` background to flow from TestimonialSection
- Heading: "Private Equity vs. Rhino"
- Two-column responsive grid (`grid-cols-1 md:grid-cols-2`)
- **Traditional PE column**: Muted styling (`bg-slate-100`, `border-slate-200`)
- **Rhino column**: Primary accent (`bg-white`, `border-l-4 border-primary`)
- Closing statement centered below in italic

### 2. Edit `src/pages/Index.tsx`
- Import `ComparisonSection`
- Add `<ComparisonSection />` after `<TestimonialSection />` and before `<StrategySection />`

## Content

**Traditional Private Equity:**
- Financial optimization first
- Leverage and cost-cutting drive returns
- Shorter time horizons
- Low tolerance for experimentation or temporary losses

**Rhino:**
- Business fundamentals first
- Organic growth before financial engineering
- Long-term partners, not exit timers
- Comfortable investing through uncertainty, learning, and iteration

**Closing:**
"We're not here to optimize your business for a quick sale. We're here to help you build one that lasts."

## Files to Modify
| File | Action |
|------|--------|
| `src/components/ComparisonSection.tsx` | Create new component |
| `src/pages/Index.tsx` | Import and add after TestimonialSection |
