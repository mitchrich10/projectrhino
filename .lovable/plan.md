

# Move LinkedIn Icon to Back of Flipping Cards

## The Problem
The LinkedIn icon on the front face of team member cards becomes unclickable because hovering triggers the card flip animation before the click can register.

## Solution
Move the LinkedIn icon to the back face of the card, positioning it in the bottom-right corner. This allows users to:
1. Hover to flip the card
2. See the portfolio companies
3. Click LinkedIn while viewing the portfolio

## Design

### Back Face Layout (Updated)
```text
+---------------------------+
|     PORTFOLIO             |
|                           |
|  Company 1  |  Company 2  |
|  Company 3  |  Company 4  |
|  Company 5  |  Company 6  |
|  ...        |  ...        |
|                       [in]|
+---------------------------+
```

## Implementation Details

### TeamSection.tsx Changes

1. **Remove LinkedIn from front face** (lines 104-113)
   - Delete the LinkedIn anchor tag from the front face
   - Simplify the bottom overlay to just show name and role

2. **Add LinkedIn to back face** (around line 119-126)
   - Position the icon at the bottom-right of the back face
   - Use the same styling: white icon with primary hover color
   - Keep the portfolio grid above it

3. **Updated back face structure**:
   ```tsx
   <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary p-4 flex flex-col">
     <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Portfolio</h4>
     <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 flex-1">
       {portfolio.map((company, index) => (
         <span key={index} className="text-[10px] leading-tight text-white">{company}</span>
       ))}
     </div>
     <a 
       href={linkedin} 
       target="_blank" 
       rel="noopener noreferrer"
       className="self-end text-white/80 hover:text-white transition-colors mt-2"
       aria-label={`${name}'s LinkedIn profile`}
     >
       <Linkedin size={16} />
     </a>
   </div>
   ```

## Notes
- Candace's static card keeps LinkedIn on the front (no flip animation)
- Icon size reduced slightly to `16` to fit the compact back layout
- Icon uses `self-end` to align to the right within the flex column

## Files to Modify
- `src/components/TeamSection.tsx` - Move LinkedIn from front to back face

