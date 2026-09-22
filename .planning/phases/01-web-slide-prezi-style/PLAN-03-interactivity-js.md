---
phase: "01-web-slide-prezi-style"
plan_id: "03-interactivity-js"
title: "JavaScript — Animations, Spiral Diagram, Prezi Camera Engine"
wave: 2
depends_on:
  - "01-foundation-html"
  - "02-foundation-css"
files_modified:
  - presentation/slides/script.js
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

# Plan 03: JavaScript — Animations, Spiral Diagram, Prezi Camera Engine

## Goal
Tạo file `presentation/slides/script.js` chứa: (1) Reveal.js initialization với Prezi-optimized config, (2) spatial parallax canvas camera engine, (3) SVG spiral 3D conical helix path generation + step-by-step animation, (4) start button interaction, (5) keyboard navigation enhancements.

## must_haves
- Reveal.js initialization with zoom transition, slow speed (800ms), auto-animate easing, overview: true
- Keyboard bindings: ESC and O for overview toggle
- Notes plugin loaded
- Spatial canvas parallax effect on slidechanged event — smooth transform on .prezi-spatial-canvas
- 12 slideCoordinates array matching research spec
- SVG spiral path generation — 3 elliptical arcs creating isometric 3D conical helix
- Fragment-synced spiral animation: fragmentshown triggers animateSpiralTurn(n)
- Fragment reverse: fragmenthidden triggers rewindSpiralTurn(n)
- Idempotent spiral state (no desync on rapid key presses)
- Start button on slide-01 advances to next slide on click

---

## Tasks

<task id="T03-01" title="Create script.js with Reveal.js initialization">
<read_first>
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 1: Prezi-Optimized Initialization)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-06, D-07, D-08, D-09, D-15)
  - presentation/slides/index.html (to verify plugin script tags exist)
</read_first>
<action>
Create file `presentation/slides/script.js`. Wrap all code in a DOMContentLoaded listener or IIFE.

Initialize Reveal.js with these exact configuration values:
- width: 1280, height: 720
- margin: 0.04
- minScale: 0.2, maxScale: 2.0
- controls: true, controlsTutorial: true, controlsLayout: 'bottom-right'
- progress: true, history: true, hash: true, center: true, touch: true, loop: false
- transition: 'zoom'
- transitionSpeed: 'slow'
- backgroundTransition: 'zoom'
- autoAnimateEasing: 'cubic-bezier(0.25, 1, 0.5, 1)'
- autoAnimateDuration: 0.9
- autoAnimateUnmatched: true
- overview: true
- keyboard: { 27: toggle overview, 79: toggle overview }
- plugins: [RevealNotes]

Chain `.then()` on Reveal.initialize() to set up post-init hooks (spatial canvas, spiral, start button).
</action>
<acceptance_criteria>
- File exists at `presentation/slides/script.js`
- Contains `Reveal.initialize({` call
- Config contains `width: 1280` and `height: 720`
- Config contains `transition: 'zoom'` (or `transition: "zoom"`)
- Config contains `transitionSpeed: 'slow'` (or `transitionSpeed: "slow"`)
- Config contains `autoAnimateDuration: 0.9`
- Config contains `autoAnimateEasing` with cubic-bezier(0.25, 1, 0.5, 1)
- Config contains `overview: true`
- Config contains keyboard object with key 27 and key 79
- Config contains `plugins:` array with `RevealNotes`
- Contains `.then(` chained after initialize
</acceptance_criteria>
</task>

<task id="T03-02" title="Spatial parallax canvas camera engine" depends_on="T03-01">
<read_first>
  - presentation/slides/script.js
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 2: Dynamic Spatial Parallax Grid)
</read_first>
<action>
Inside the .then() callback of Reveal.initialize(), add spatial parallax camera:

1. Define slideCoordinates array (12 entries matching research spec):
   Index 0: { x: 0, y: 0, scale: 1.0 }
   Index 1: { x: 1200, y: 0, scale: 1.0 }
   Index 2: { x: 2600, y: -400, scale: 1.3 }
   Index 3: { x: 3800, y: -400, scale: 1.3 }
   Index 4: { x: 5000, y: -400, scale: 1.3 }
   Index 5: { x: 3800, y: 800, scale: 0.9 }
   Index 6: { x: 5000, y: 800, scale: 1.5 }
   Index 7: { x: 6400, y: 0, scale: 1.1 }
   Index 8: { x: 7600, y: 0, scale: 1.1 }
   Index 9: { x: 4500, y: 2000, scale: 0.8 }
   Index 10: { x: 4500, y: 3200, scale: 1.2 }
   Index 11: { x: 6000, y: 3200, scale: 1.0 }

2. Define function updateSpatialCanvas(slideIndex):
   - Get canvas element: document.querySelector('.prezi-spatial-canvas')
   - If canvas is null, return early
   - Get coords from slideCoordinates[slideIndex] with fallback { x: 0, y: 0, scale: 1 }
   - Set canvas.style.transition to '1.2s cubic-bezier(0.25, 1, 0.5, 1)'
   - Set canvas.style.transform to template string: `scale(${1/coords.scale}) translate(${-coords.x * 0.15}px, ${-coords.y * 0.15}px)`

3. Register event: Reveal.on('slidechanged', event => updateSpatialCanvas(event.indexh))

4. Call updateSpatialCanvas(0) immediately for initial state
</action>
<acceptance_criteria>
- `slideCoordinates` array exists with exactly 12 objects
- First entry has x: 0, y: 0, scale: 1.0 (or 1)
- Entry at index 6 has x: 5000, y: 800, scale: 1.5
- Entry at index 11 has x: 6000, y: 3200, scale: 1.0 (or 1)
- Function `updateSpatialCanvas` exists
- `updateSpatialCanvas` queries `.prezi-spatial-canvas`
- Contains null/existence check for canvas element
- Sets `canvas.style.transform` with scale and translate
- `Reveal.on('slidechanged'` event listener exists
- `updateSpatialCanvas(0)` called for initial state
</acceptance_criteria>
</task>

<task id="T03-03" title="SVG spiral path generation — 3D conical helix" depends_on="T03-01">
<read_first>
  - presentation/slides/script.js
  - presentation/slides/index.html (SVG structure in slide-07/slide-spiral)
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 3: Visual Architecture)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-10, D-11, D-12)
</read_first>
<action>
Add spiral path generation function inside the .then() callback:

1. Define function generateSpiralPaths():
   - Constants: centerX = 400, baseY = 480, topY = 100, numPoints = 60 per turn
   - The spiral is a conical helix: radius decreases as it goes up, creating a 3D isometric perspective
   - Turn 1 (bottom): y range 480→340, radiusX range 180→150, radiusY range 45→38 (isometric squash)
   - Turn 2 (middle): y range 340→200, radiusX range 150→120, radiusY range 38→30
   - Turn 3 (top): y range 200→100, radiusX range 120→90, radiusY range 30→22
   - For each turn, generate SVG path d attribute by computing parametric ellipse points:
     For each point i from 0 to numPoints:
       t = i / numPoints
       angle = t * 2 * Math.PI (one full revolution)
       currentY = startY + t * (endY - startY)
       currentRadiusX = startRadiusX + t * (endRadiusX - startRadiusX)
       currentRadiusY = startRadiusY + t * (endRadiusY - startRadiusY)
       x = centerX + currentRadiusX * Math.cos(angle)
       y = currentY + currentRadiusY * Math.sin(angle)
     Join points with M for first, L for rest to create path d string
   - Set d attribute on elements: document.getElementById('spiral-path-1').setAttribute('d', path1)
   - Same for spiral-path-2 and spiral-path-3
   - After setting d, compute total path length using getTotalLength() and set stroke-dasharray and stroke-dashoffset to that length (so animation can reveal stroke)

2. Call generateSpiralPaths() inside .then() callback

3. Add SVG text labels after paths are generated:
   - Create SVG text element at center of each turn for labels: "A", "B", "A'"
   - Position label text at (centerX, midY of each turn)
   - Set font-family: 'Playfair Display', serif; fill: corresponding gradient color; font-size: 18
</action>
<acceptance_criteria>
- Function `generateSpiralPaths` exists
- Uses centerX = 400 (or similar center value in 800-wide viewBox)
- Generates 3 path d strings using parametric ellipse computation (cos/sin)
- Sets `d` attribute on elements with ids 'spiral-path-1', 'spiral-path-2', 'spiral-path-3'
- Computes path.getTotalLength() after setting d attribute
- Sets stroke-dasharray and stroke-dashoffset to path total length
- `generateSpiralPaths()` is called during initialization
- Creates or positions labels for the 3 turns
</acceptance_criteria>
</task>

<task id="T03-04" title="Fragment-synced spiral animation with idempotent state" depends_on="T03-03">
<read_first>
  - presentation/slides/script.js
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 3: Implementation Blueprint, Section 10: Spiral SVG Animation Desync risk)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-10)
</read_first>
<action>
Add spiral animation functions inside the .then() callback:

1. Define spiralState object: { turn1: false, turn2: false, turn3: false } — tracks which turns are currently animated

2. Define function animateSpiralTurn(turnNumber):
   - Get path element: document.getElementById('spiral-path-' + turnNumber)
   - If path is null, return
   - Idempotent check: if spiralState['turn' + turnNumber] is already true, return
   - Set spiralState['turn' + turnNumber] = true
   - Add class 'animated' to the path element (which sets stroke-dashoffset: 0 via CSS transition)

3. Define function rewindSpiralTurn(turnNumber):
   - Get path element: document.getElementById('spiral-path-' + turnNumber)
   - If path is null, return
   - Set spiralState['turn' + turnNumber] = false
   - Remove class 'animated' from path element (restoring stroke-dashoffset to full length)

4. Register fragment event listeners:
   - Reveal.on('fragmentshown', event => { ... })
     - Get fragment's data-fragment-index
     - Get current slide: Reveal.getCurrentSlide()
     - Check if current slide has id containing 'spiral' (to only trigger on spiral slide)
     - If index is '1', call animateSpiralTurn(1)
     - If index is '2', call animateSpiralTurn(2)
     - If index is '3', call animateSpiralTurn(3)
   - Reveal.on('fragmenthidden', event => { ... })
     - Same slide check
     - Call rewindSpiralTurn with appropriate turn number

5. On slidechanged, if navigating away from spiral slide, reset all spiral turns:
   - In existing slidechanged listener, if previous slide was spiral, call rewindSpiralTurn(1), rewindSpiralTurn(2), rewindSpiralTurn(3)
</action>
<acceptance_criteria>
- `spiralState` object exists with turn1, turn2, turn3 boolean properties
- `animateSpiralTurn` function exists and checks spiralState before animating (idempotent)
- `animateSpiralTurn` adds class 'animated' to spiral path element
- `rewindSpiralTurn` function exists and removes class 'animated'
- `Reveal.on('fragmentshown'` listener exists
- `Reveal.on('fragmenthidden'` listener exists
- Fragment listeners check current slide contains 'spiral' before triggering spiral animation
- Navigating away from spiral slide resets all turns
</acceptance_criteria>
</task>

<task id="T03-05" title="Start button interaction and keyboard enhancements" depends_on="T03-01">
<read_first>
  - presentation/slides/script.js
  - presentation/slides/index.html (button.start-btn on slide-01)
</read_first>
<action>
Inside the .then() callback:

1. Start button click handler:
   - Query: document.querySelector('.start-btn')
   - If element exists, add 'click' event listener that calls Reveal.next()
   - Prevent default event behavior

2. Add subtle entrance animation for title slide:
   - On Reveal ready, if current slide index is 0, add class 'active' to slide-01 after 500ms delay (for CSS-driven entrance animation)

3. Overview mode visual feedback:
   - Reveal.on('overviewshown', () => { document.body.classList.add('overview-active'); })
   - Reveal.on('overviewhidden', () => { document.body.classList.remove('overview-active'); })
</action>
<acceptance_criteria>
- Code queries '.start-btn' and adds click event listener
- Click handler calls Reveal.next()
- Overview event listeners exist for 'overviewshown' and 'overviewhidden'
- body class 'overview-active' is toggled on overview events
</acceptance_criteria>
</task>

---

## Artifacts this phase produces

### New Files
| Path | Description |
|------|-------------|
| `presentation/slides/script.js` | Reveal.js init, Prezi camera engine, spiral animation, interactions |

### Functions Created
| Function | Purpose |
|----------|---------|
| `updateSpatialCanvas(slideIndex)` | Translates prezi-spatial-canvas based on slide coordinates |
| `generateSpiralPaths()` | Generates 3 SVG path d attributes for conical helix |
| `animateSpiralTurn(turnNumber)` | Animates one spiral turn by adding 'animated' class |
| `rewindSpiralTurn(turnNumber)` | Reverses spiral turn animation |

### Constants/Data
| Name | Description |
|------|-------------|
| `slideCoordinates` | Array of 12 {x, y, scale} objects for spatial parallax |
| `spiralState` | Object tracking animation state of 3 spiral turns |

### Event Listeners
| Event | Handler |
|-------|---------|
| `Reveal.on('slidechanged')` | Updates spatial canvas + resets spiral when leaving spiral slide |
| `Reveal.on('fragmentshown')` | Triggers spiral turn animation on spiral slide |
| `Reveal.on('fragmenthidden')` | Rewinds spiral turn animation |
| `Reveal.on('overviewshown')` | Adds overview-active body class |
| `Reveal.on('overviewhidden')` | Removes overview-active body class |
| `.start-btn click` | Advances to next slide |

---

## Verification

```powershell
# 1. File exists
Test-Path "presentation/slides/script.js"

# 2. Reveal initialization
Select-String -Path "presentation/slides/script.js" -Pattern "Reveal.initialize"
# Expected: 1 match

# 3. Spatial coordinates
Select-String -Path "presentation/slides/script.js" -Pattern "slideCoordinates"
# Expected: 1+ match

# 4. Spiral functions
Select-String -Path "presentation/slides/script.js" -Pattern "generateSpiralPaths"
Select-String -Path "presentation/slides/script.js" -Pattern "animateSpiralTurn"
Select-String -Path "presentation/slides/script.js" -Pattern "rewindSpiralTurn"
# Expected: all 3 present

# 5. Fragment listeners
Select-String -Path "presentation/slides/script.js" -Pattern "fragmentshown"
Select-String -Path "presentation/slides/script.js" -Pattern "fragmenthidden"
# Expected: both present

# 6. Idempotent state
Select-String -Path "presentation/slides/script.js" -Pattern "spiralState"
# Expected: 1+ match

# 7. Overview toggle
Select-String -Path "presentation/slides/script.js" -Pattern "overviewshown"
# Expected: 1+ match

# 8. Start button
Select-String -Path "presentation/slides/script.js" -Pattern "start-btn"
# Expected: 1+ match
```

---

## Integration Test (Manual)

After all 3 plans are executed, open `presentation/slides/index.html` in a browser:

1. **SLIDE-01**: Verify 12 slides load, zoom transitions between slides
2. **SLIDE-02**: Verify Vietnamese content renders correctly with proper diacritics
3. **SLIDE-03**: Verify dark academia theme — dark background, gold headings, cream text
4. **SLIDE-04**: Press ESC — overview mode shows all slides as gallery with gold borders
5. **SLIDE-05**: Resize browser / use DevTools mobile view — responsive layout
6. **SLIDE-06**: Navigate to slide 7 (spiral) — click through fragments to see spiral animation
7. **Prezi feel**: Background parallax shifts as you navigate between slides
8. **Fragment dimming**: On theory slides (3, 4, 5, 10), bullets appear one by one with dimming effect
