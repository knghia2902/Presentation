---
phase: "01-web-slide-prezi-style"
plan_id: "02-foundation-css"
title: "CSS Theme — Dark Academia + Prezi Styling"
wave: 1
depends_on: []
files_modified:
  - presentation/slides/style.css
requirements:
  - SLIDE-01
  - SLIDE-02
  - SLIDE-03
  - SLIDE-04
  - SLIDE-05
  - SLIDE-06
autonomous: true
estimated_effort: "large"
---

# Plan 02: CSS Theme — Dark Academia + Prezi Styling

## Goal
Tạo file `presentation/slides/style.css` chứa toàn bộ theme dark academia, typography tiếng Việt, responsive layout, fragment animations, overview mode styling, và spatial canvas effects cho Prezi feel.

## must_haves
- CSS custom properties (variables) cho color palette dark academia
- Reveal.js global overrides (font-family, color, background)
- Typography hierarchy: Playfair Display cho headings, Be Vietnam Pro cho body
- Academic card component styling with frosted glass and corner brackets
- Fragment focus-dimming animation (current-fragment = 1.0, visible = 0.5)
- Step-list bullet animation with translateY entrance
- Overview mode dark academia gallery styling
- Progress bar gold gradient styling
- Mobile orientation tip responsive display
- Responsive media queries for tablet and mobile
- Two-column layout, comparison table, cycle diagram, example flow, methodology grid
- Spiral stage and SVG container styling
- Prezi spatial canvas background styling

---

## Tasks

<task id="T02-01" title="Create style.css with CSS custom properties and base theme">
<read_first>
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 4: Color Palette Architecture)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-13, D-14)
</read_first>
<action>
Create file `presentation/slides/style.css`. Define `:root` CSS custom properties block with exact values:
- --bg-abyss: #0c0d14
- --bg-surface: #141724
- --bg-card-glass: rgba(20, 23, 36, 0.75)
- --border-card: rgba(212, 175, 55, 0.22)
- --gold-primary: #d4af37
- --gold-radiant: #ffd700
- --gold-dim: #997b2c
- --amber-warm: #e5a93c
- --text-parchment: #f7f2e7
- --text-muted: #b8b1a2
- --text-subtle: #7a7365
- --crimson-negation: #b83b46
- --green-affirmation: #3d8b5f

Set `.reveal` base styles:
- font-family: 'Be Vietnam Pro', -apple-system, sans-serif
- font-size: 24px
- font-weight: 400
- color: var(--text-parchment)

Set `.reveal .slides` background: var(--bg-abyss)

Set body background: var(--bg-abyss)
</action>
<acceptance_criteria>
- File exists at `presentation/slides/style.css`
- Contains `:root {` block with all 13 CSS custom properties listed above
- `--bg-abyss` is exactly `#0c0d14`
- `--gold-primary` is exactly `#d4af37`
- `--text-parchment` is exactly `#f7f2e7`
- `.reveal` rule sets font-family containing 'Be Vietnam Pro'
- `.reveal` rule sets color to `var(--text-parchment)`
- body or .reveal background uses `var(--bg-abyss)` or `#0c0d14`
</acceptance_criteria>
</task>

<task id="T02-02" title="Typography hierarchy — headings and subtitles" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 4: Typography Hierarchy)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-14)
</read_first>
<action>
Add to style.css:
- `.reveal h1, .reveal h2, .reveal h3, .reveal h4` — font-family: 'Playfair Display', Georgia, serif; font-weight: 700; color: var(--gold-primary); text-transform: none; letter-spacing: 0.02em; line-height: 1.35
- `.reveal h1` — font-size: 2.8em; font-weight: 900
- `.reveal h2` — font-size: 2.2em; margin-bottom: 0.25em; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6)
- `.reveal h3` — font-size: 1.5em
- `.academic-title` — additional gold text-shadow glow
- `.academic-subtitle` — font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.1em; color: var(--gold-dim); margin-bottom: 1.2em
- `.card-heading` — font-size: 1.3em; color: var(--gold-primary); margin-bottom: 0.5em
</action>
<acceptance_criteria>
- `.reveal h1, .reveal h2, .reveal h3, .reveal h4` rule exists with font-family containing 'Playfair Display'
- `.reveal h2` rule sets font-size to 2.2em
- `.academic-subtitle` rule sets font-style to italic and color to var(--gold-dim)
- `.reveal h1` sets font-weight: 900
- Line-height of 1.35 is present on heading rules
</acceptance_criteria>
</task>

<task id="T02-03" title="Academic card component with frosted glass and corner brackets" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 4: Academic Cards)
</read_first>
<action>
Add to style.css:
- `.academic-card` — background: var(--bg-card-glass); border: 1px solid var(--border-card); border-radius: 8px; padding: 24px 30px; backdrop-filter: blur(12px); box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05); position: relative
- `.academic-card::before` — content: ''; position: absolute; width: 12px; height: 12px; border: 2px solid var(--gold-primary); pointer-events: none; top: -2px; left: -2px; border-right: none; border-bottom: none
- `.academic-card::after` — same structure; bottom: -2px; right: -2px; border-left: none; border-top: none
</action>
<acceptance_criteria>
- `.academic-card` rule exists with backdrop-filter: blur(12px)
- `.academic-card` has border: 1px solid var(--border-card)
- `.academic-card::before` exists with top: -2px and left: -2px
- `.academic-card::after` exists with bottom: -2px and right: -2px
- Both pseudo-elements have border: 2px solid var(--gold-primary)
</acceptance_criteria>
</task>

<task id="T02-04" title="Fragment focus-dimming animation and step-list bullets" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 5: Fragment Animations)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-16)
</read_first>
<action>
Add to style.css:
- `.reveal .slides section ul.step-list` — list-style: none; padding: 0; text-align: left
- `.reveal .slides section ul.step-list li.fragment` — opacity: 0; transform: translateY(15px); transition: opacity 0.4s ease, transform 0.4s ease, color 0.3s ease; padding: 8px 0; border-bottom: 1px solid rgba(212,175,55,0.1)
- `.reveal .slides section ul.step-list li.fragment.visible` — opacity: 0.5; transform: translateY(0)
- `.reveal .slides section ul.step-list li.fragment.current-fragment` — opacity: 1.0; color: #ffffff; text-shadow: 0 0 12px rgba(212, 175, 55, 0.4)
- `.reveal .slides section ul.step-list li.fragment.current-fragment::marker` — color: var(--gold-radiant)
- `.step-list li strong` — color: var(--gold-primary); font-weight: 600
</action>
<acceptance_criteria>
- Rule for `.reveal .slides section ul.step-list li.fragment` exists with opacity: 0 and transform: translateY(15px)
- Rule for `li.fragment.visible` exists with opacity: 0.5
- Rule for `li.fragment.current-fragment` exists with opacity: 1.0 or opacity: 1
- `li.fragment.current-fragment` has text-shadow containing rgba(212, 175, 55
- `.step-list li strong` has color: var(--gold-primary)
</acceptance_criteria>
</task>

<task id="T02-05" title="Overview mode gallery styling" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 6: Overview Mode Styling)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-08)
</read_first>
<action>
Add to style.css:
- `.reveal.overview .slides section` — border: 1px solid rgba(212, 175, 55, 0.35) !important; border-radius: 8px !important; background: #12141f !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important; transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important
- `.reveal.overview .slides section:hover` — border-color: var(--gold-primary) !important; box-shadow: 0 0 25px rgba(212, 175, 55, 0.5) !important; cursor: pointer; transform: translateY(-8px) scale(1.03) !important
- `.reveal.overview .slides section::after` — content: attr(data-slide-num); position: absolute; top: 10px; right: 15px; font-family: 'Playfair Display', serif; font-size: 16px; color: var(--gold-primary); opacity: 0.8
</action>
<acceptance_criteria>
- `.reveal.overview .slides section` rule exists with border containing rgba(212, 175, 55, 0.35)
- `.reveal.overview .slides section:hover` rule exists with border-color: var(--gold-primary)
- `.reveal.overview .slides section::after` rule exists with content: attr(data-slide-num)
- Hover rule includes `transform` with scale(1.03)
</acceptance_criteria>
</task>

<task id="T02-06" title="Progress bar gold gradient" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 7: Progress Bar)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-15)
</read_first>
<action>
Add to style.css:
- `.reveal .progress` — height: 3px; background: rgba(255, 255, 255, 0.08)
- `.reveal .progress span` — background: linear-gradient(90deg, #997b2c 0%, #d4af37 50%, #ffd700 100%); box-shadow: 0 0 10px rgba(212, 175, 55, 0.8), 0 0 3px #ffffff; transition: transform 800ms cubic-bezier(0.25, 1, 0.5, 1)
</action>
<acceptance_criteria>
- `.reveal .progress` rule exists with height: 3px
- `.reveal .progress span` rule has background containing linear-gradient with #997b2c, #d4af37, #ffd700
- `.reveal .progress span` has box-shadow containing rgba(212, 175, 55
- Transition on progress span is 800ms
</acceptance_criteria>
</task>

<task id="T02-07" title="Layout components — two-column, comparison, cycle, example-flow, methodology-grid" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-03)
</read_first>
<action>
Add layout component styles to style.css:

1. Two-column layout:
- `.two-column` — display: grid; grid-template-columns: 1fr 1fr; gap: 24px; text-align: left

2. Comparison table:
- `.comparison-table` — display: grid; grid-template-columns: 1fr 1fr; gap: 30px
- `.compare-col` — padding: 20px; border-radius: 8px; text-align: left
- `.compare-col.dialectical` — border-left: 4px solid var(--green-affirmation); background: rgba(61, 139, 95, 0.1)
- `.compare-col.metaphysical` — border-left: 4px solid var(--crimson-negation); background: rgba(184, 59, 70, 0.1)

3. Cycle diagram:
- `.cycle-diagram` — display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap
- `.cycle-step` — background: var(--bg-card-glass); border: 1px solid var(--border-card); border-radius: 8px; padding: 16px 20px; min-width: 180px; text-align: center
- `.cycle-step.step-affirm` — border-top: 3px solid var(--gold-primary)
- `.cycle-step.step-negate` — border-top: 3px solid var(--crimson-negation)
- `.cycle-step.step-synthesis` — border-top: 3px solid var(--gold-radiant)
- `.cycle-arrow` — font-size: 2em; color: var(--gold-dim)

4. Example flow:
- `.example-flow` — display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap
- `.example-step` — background: var(--bg-card-glass); border: 1px solid var(--border-card); border-radius: 12px; padding: 20px; text-align: center; min-width: 200px; max-width: 260px
- `.example-step .step-icon` — font-size: 2.5em; margin-bottom: 8px
- `.flow-arrow` — font-size: 2em; color: var(--gold-dim)

5. Methodology grid:
- `.methodology-grid` — display: grid; grid-template-columns: 1fr 1fr; gap: 20px
- `.method-card` — text-align: left; padding: 18px 22px
- `.method-card h4` — color: var(--gold-primary); margin-bottom: 6px

6. Summary and title elements:
- `.keyword-badge` — display: inline-block; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 6px 16px; border-radius: 20px; font-weight: 600; margin: 4px
- `.lenin-quote` — font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.2em; color: var(--text-parchment); border-left: 3px solid var(--gold-primary); padding-left: 20px; margin: 20px 0
- `.title-meta` — margin-top: 2em; color: var(--text-muted)
- `.start-btn` — background: transparent; border: 2px solid var(--gold-primary); color: var(--gold-primary); padding: 12px 30px; font-size: 1em; font-family: 'Be Vietnam Pro', sans-serif; border-radius: 30px; cursor: pointer; transition: all 0.3s ease; margin-top: 1.5em
- `.start-btn:hover` — background: var(--gold-primary); color: var(--bg-abyss)
- `.qr-placeholder` — border: 2px dashed var(--gold-dim); border-radius: 12px; padding: 30px; margin: 20px auto; max-width: 300px; text-align: center; color: var(--text-muted)
- `.key-insight` — font-size: 1.1em; color: var(--gold-primary); font-weight: 500; margin-top: 1em
- `.closing-message` — font-size: 1.15em; color: var(--text-parchment); margin-top: 1em
- `.step-badge` — display: inline-block; background: rgba(212, 175, 55, 0.2); color: var(--gold-primary); padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 8px
- `.step-badge.crimson` — background: rgba(184, 59, 70, 0.2); color: var(--crimson-negation)
- `.step-badge.gold-glow` — background: rgba(255, 215, 0, 0.2); color: var(--gold-radiant); box-shadow: 0 0 10px rgba(255, 215, 0, 0.3)
</action>
<acceptance_criteria>
- `.two-column` rule uses display: grid with grid-template-columns: 1fr 1fr
- `.comparison-table` uses display: grid
- `.compare-col.dialectical` has border-left with var(--green-affirmation) or #3d8b5f
- `.compare-col.metaphysical` has border-left with var(--crimson-negation) or #b83b46
- `.cycle-diagram` uses display: flex
- `.cycle-step.step-affirm` has border-top with var(--gold-primary)
- `.example-flow` uses display: flex
- `.methodology-grid` uses display: grid with grid-template-columns: 1fr 1fr
- `.keyword-badge` exists with border-radius: 20px
- `.lenin-quote` has font-style: italic and border-left with var(--gold-primary)
- `.start-btn` exists with border: 2px solid var(--gold-primary)
- `.qr-placeholder` exists with border: 2px dashed
- `.step-badge` exists
- `.step-badge.crimson` exists
</acceptance_criteria>
</task>

<task id="T02-08" title="Responsive and mobile styles" depends_on="T02-07">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 8: Responsive Design)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-13)
</read_first>
<action>
Add to style.css:

1. Mobile orientation tip:
- `.mobile-orient-tip` — display: none; position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(20, 23, 36, 0.95); border: 1px solid var(--gold-primary); color: var(--text-parchment); font-size: 13px; padding: 6px 16px; border-radius: 20px; z-index: 1000; pointer-events: none; font-family: 'Be Vietnam Pro', sans-serif
- `@media (max-width: 768px) and (orientation: portrait) { .mobile-orient-tip { display: block; } }`

2. Tablet breakpoint (max-width: 1024px):
- `.two-column, .comparison-table, .methodology-grid` — grid-template-columns: 1fr (stack to single column)
- `.example-flow, .cycle-diagram` — flex-direction: column

3. Mobile breakpoint (max-width: 480px):
- `.reveal` font-size: 18px
- `.academic-card` padding: 16px 18px
- `.example-step` min-width: unset; width: 100%

4. Prezi spatial canvas:
- `.prezi-spatial-canvas` — position: fixed; top: 0; left: 0; width: 200vw; height: 200vh; z-index: -1; background: radial-gradient(ellipse at center, #141724 0%, #0c0d14 70%); transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: none; will-change: transform
- `.prezi-spatial-canvas::before` — content: ''; position: absolute; width: 100%; height: 100%; background-image: radial-gradient(circle, rgba(212,175,55,0.08) 1px, transparent 1px); background-size: 60px 60px; opacity: 0.4

5. Scope reset for overview mode:
- `.reveal.overview ~ .prezi-spatial-canvas` — transform: none !important; opacity: 0.3
</action>
<acceptance_criteria>
- `.mobile-orient-tip` rule exists with display: none and position: fixed
- Media query `(max-width: 768px) and (orientation: portrait)` exists and sets .mobile-orient-tip display: block
- Media query for max-width: 1024px exists and changes grid layouts to single column
- Media query for max-width: 480px exists
- `.prezi-spatial-canvas` rule exists with position: fixed and z-index: -1
- `.prezi-spatial-canvas` has transition property containing cubic-bezier
- `.prezi-spatial-canvas::before` exists with background-image containing radial-gradient
- Overview mode scope reset rule exists (`.reveal.overview` related)
</acceptance_criteria>
</task>

<task id="T02-09" title="Spiral SVG and slide-specific styling" depends_on="T02-01">
<read_first>
  - presentation/slides/style.css
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 3: Spiral diagram)
</read_first>
<action>
Add to style.css:

1. Spiral stage:
- `.spiral-stage` — display: flex; align-items: flex-start; gap: 30px; margin-top: 1em
- `.spiral-svg` — flex: 1 1 55%; max-width: 500px; height: auto
- `.spiral-captions` — flex: 1 1 40%; display: flex; flex-direction: column; gap: 12px

2. Spiral SVG paths:
- `.spiral-turn` — fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 1000; stroke-dashoffset: 1000; transition: stroke-dashoffset 1.5s ease-in-out
- `.spiral-turn.turn-1` — stroke: url(#grad-v1)
- `.spiral-turn.turn-2` — stroke: url(#grad-v2)
- `.spiral-turn.turn-3` — stroke: url(#grad-v3); filter: url(#gold-glow)
- `.spiral-turn.animated` — stroke-dashoffset: 0

3. Spiral axis:
- `.spiral-axis` — stroke-dasharray: 6, 6; opacity: 0.6

4. Spiral caption cards:
- `.card-v1, .card-v2, .card-v3` — background: var(--bg-card-glass); border-radius: 8px; padding: 12px 16px; text-align: left; border-left: 3px solid
- `.card-v1` — border-color: var(--gold-primary)
- `.card-v2` — border-color: var(--crimson-negation)
- `.card-v3` — border-color: var(--gold-radiant); box-shadow: 0 0 15px rgba(255, 215, 0, 0.2)

5. Responsive spiral (max-width: 1024px):
- `.spiral-stage` — flex-direction: column; align-items: center
- `.spiral-svg` — max-width: 100%
</action>
<acceptance_criteria>
- `.spiral-stage` uses display: flex
- `.spiral-svg` exists with max-width: 500px
- `.spiral-turn` rule exists with stroke-dasharray: 1000 and stroke-dashoffset: 1000
- `.spiral-turn.animated` sets stroke-dashoffset: 0
- `.card-v1` has border-color: var(--gold-primary)
- `.card-v2` has border-color: var(--crimson-negation)
- `.card-v3` has border-color: var(--gold-radiant)
- Media query exists for spiral-stage flex-direction: column
</acceptance_criteria>
</task>

---

## Artifacts this phase produces

### New Files
| Path | Description |
|------|-------------|
| `presentation/slides/style.css` | Complete dark academia CSS theme with all component styles |

### CSS Custom Properties
- `--bg-abyss`, `--bg-surface`, `--bg-card-glass`, `--border-card`
- `--gold-primary`, `--gold-radiant`, `--gold-dim`, `--amber-warm`
- `--text-parchment`, `--text-muted`, `--text-subtle`
- `--crimson-negation`, `--green-affirmation`

### CSS Classes Created
- **Base**: `.reveal` overrides, heading hierarchy, `.academic-title`, `.academic-subtitle`
- **Components**: `.academic-card` (with `::before`, `::after`), `.step-list`, `.keyword-badge`, `.step-badge`, `.start-btn`, `.qr-placeholder`, `.key-insight`, `.closing-message`, `.lenin-quote`
- **Layouts**: `.two-column`, `.comparison-table`, `.compare-col`, `.cycle-diagram`, `.cycle-step`, `.cycle-arrow`, `.example-flow`, `.example-step`, `.flow-arrow`, `.methodology-grid`, `.method-card`
- **Spiral**: `.spiral-stage`, `.spiral-svg`, `.spiral-turn`, `.spiral-turn.animated`, `.spiral-axis`, `.spiral-captions`, `.card-v1`, `.card-v2`, `.card-v3`
- **Fragment**: `li.fragment.visible`, `li.fragment.current-fragment`
- **Overview**: `.reveal.overview .slides section` gallery
- **Progress**: `.reveal .progress`, `.reveal .progress span`
- **Responsive**: `.mobile-orient-tip`, `.prezi-spatial-canvas`

---

## Verification

```powershell
# 1. File exists
Test-Path "presentation/slides/style.css"

# 2. CSS custom properties count
(Select-String -Path "presentation/slides/style.css" -Pattern "--[a-z]" -AllMatches).Matches.Count
# Expected: 13+ custom properties

# 3. Font families present
Select-String -Path "presentation/slides/style.css" -Pattern "Playfair Display"
Select-String -Path "presentation/slides/style.css" -Pattern "Be Vietnam Pro"
# Expected: both present

# 4. Academic card styling
Select-String -Path "presentation/slides/style.css" -Pattern "academic-card"
# Expected: 3+ matches (base, ::before, ::after)

# 5. Fragment dimming
Select-String -Path "presentation/slides/style.css" -Pattern "current-fragment"
# Expected: 1+ match

# 6. Overview mode
Select-String -Path "presentation/slides/style.css" -Pattern "\.reveal\.overview"
# Expected: 2+ matches

# 7. Progress bar gradient
Select-String -Path "presentation/slides/style.css" -Pattern "progress.*span"
# Expected: 1+ match with gradient

# 8. Media queries
(Select-String -Path "presentation/slides/style.css" -Pattern "@media" -AllMatches).Matches.Count
# Expected: 3+ media queries

# 9. Spatial canvas
Select-String -Path "presentation/slides/style.css" -Pattern "prezi-spatial-canvas"
# Expected: 2+ matches
```
