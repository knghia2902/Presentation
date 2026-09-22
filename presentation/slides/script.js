document.addEventListener('DOMContentLoaded', () => {
  // T03-01: Reveal.js initialization
  Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.0,
    controls: true,
    controlsTutorial: true,
    controlsLayout: 'bottom-right',
    progress: true,
    history: true,
    hash: true,
    center: true,
    touch: true,
    loop: false,
    transition: 'zoom',
    transitionSpeed: 'slow',
    backgroundTransition: 'zoom',
    autoAnimateEasing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    autoAnimateDuration: 0.9,
    autoAnimateUnmatched: true,
    overview: true,
    keyboard: {
      27: () => Reveal.toggleOverview(),
      79: () => Reveal.toggleOverview()
    },
    plugins: [RevealNotes]
  }).then(() => {
    // T03-02: Spatial parallax canvas camera engine
    const slideCoordinates = [
      { x: 0, y: 0, scale: 1.0 },
      { x: 1200, y: 0, scale: 1.0 },
      { x: 2600, y: -400, scale: 1.3 },
      { x: 3800, y: -400, scale: 1.3 },
      { x: 5000, y: -400, scale: 1.3 },
      { x: 3800, y: 800, scale: 0.9 },
      { x: 5000, y: 800, scale: 1.5 },
      { x: 6400, y: 0, scale: 1.1 },
      { x: 7600, y: 0, scale: 1.1 },
      { x: 4500, y: 2000, scale: 0.8 },
      { x: 4500, y: 3200, scale: 1.2 },
      { x: 6000, y: 3200, scale: 1.0 }
    ];

    function updateSpatialCanvas(slideIndex) {
      const canvas = document.querySelector('.prezi-spatial-canvas');
      if (!canvas) return;
      
      const coords = slideCoordinates[slideIndex] || { x: 0, y: 0, scale: 1.0 };
      canvas.style.transition = '1.2s cubic-bezier(0.25, 1, 0.5, 1)';
      canvas.style.transform = `scale(${1 / coords.scale}) translate(${-coords.x * 0.15}px, ${-coords.y * 0.15}px)`;
    }

    Reveal.on('slidechanged', event => {
      updateSpatialCanvas(event.indexh);
      
      // T03-04: Reset spiral when navigating away
      const prevSlide = event.previousSlide;
      if (prevSlide && prevSlide.id && prevSlide.id.includes('spiral')) {
        rewindSpiralTurn(1);
        rewindSpiralTurn(2);
        rewindSpiralTurn(3);
      }
    });

    updateSpatialCanvas(0); // Initial state

    // T03-03: SVG spiral path generation
    function generateSpiralPaths() {
      const centerX = 400;
      const numPoints = 60;
      
      const turns = [
        { id: 'spiral-path-1', startY: 480, endY: 340, startRX: 180, endRX: 150, startRY: 45, endRY: 38, label: "A", color: "url(#grad-v1)" },
        { id: 'spiral-path-2', startY: 340, endY: 200, startRX: 150, endRX: 120, startRY: 38, endRY: 30, label: "B", color: "url(#grad-v2)" },
        { id: 'spiral-path-3', startY: 200, endY: 100, startRX: 120, endRX: 90, startRY: 30, endRY: 22, label: "A'", color: "url(#grad-v3)" }
      ];

      const svgEl = document.querySelector('.spiral-svg');

      turns.forEach((turn, index) => {
        const pathEl = document.getElementById(turn.id);
        if (!pathEl) return;
        
        let d = '';
        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const angle = t * 2 * Math.PI;
          const currentY = turn.startY + t * (turn.endY - turn.startY);
          const currentRadiusX = turn.startRX + t * (turn.endRX - turn.startRX);
          const currentRadiusY = turn.startRY + t * (turn.endRY - turn.startRY);
          
          const x = centerX + currentRadiusX * Math.cos(angle);
          const y = currentY + currentRadiusY * Math.sin(angle);
          
          if (i === 0) d += `M ${x} ${y} `;
          else d += `L ${x} ${y} `;
        }
        
        pathEl.setAttribute('d', d);
        const length = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = length;
        pathEl.style.strokeDashoffset = length;
        
        // Add SVG text label
        if (svgEl) {
          const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textEl.setAttribute('x', centerX);
          const midY = turn.startY + (turn.endY - turn.startY) / 2;
          textEl.setAttribute('y', midY);
          textEl.setAttribute('font-family', "'Playfair Display', serif");
          textEl.setAttribute('fill', turn.color);
          textEl.setAttribute('font-size', '18');
          textEl.setAttribute('text-anchor', 'middle');
          textEl.textContent = turn.label;
          svgEl.appendChild(textEl);
        }
      });
    }

    generateSpiralPaths();

    // T03-04: Fragment-synced spiral animation with idempotent state
    const spiralState = { turn1: false, turn2: false, turn3: false };

    function animateSpiralTurn(turnNumber) {
      const path = document.getElementById('spiral-path-' + turnNumber);
      if (!path) return;
      if (spiralState['turn' + turnNumber]) return;
      
      spiralState['turn' + turnNumber] = true;
      path.classList.add('animated');
      path.style.transition = 'stroke-dashoffset 1s ease-in-out';
      path.style.strokeDashoffset = 0;
    }

    function rewindSpiralTurn(turnNumber) {
      const path = document.getElementById('spiral-path-' + turnNumber);
      if (!path) return;
      
      spiralState['turn' + turnNumber] = false;
      path.classList.remove('animated');
      const length = path.getTotalLength();
      path.style.strokeDashoffset = length;
    }

    Reveal.on('fragmentshown', event => {
      const currentSlide = Reveal.getCurrentSlide();
      if (currentSlide && currentSlide.id && currentSlide.id.includes('spiral')) {
        const idx = event.fragment.getAttribute('data-fragment-index');
        if (idx === '1') animateSpiralTurn(1);
        if (idx === '2') animateSpiralTurn(2);
        if (idx === '3') animateSpiralTurn(3);
      }
    });

    Reveal.on('fragmenthidden', event => {
      const currentSlide = Reveal.getCurrentSlide();
      if (currentSlide && currentSlide.id && currentSlide.id.includes('spiral')) {
        const idx = event.fragment.getAttribute('data-fragment-index');
        if (idx === '1') rewindSpiralTurn(1);
        if (idx === '2') rewindSpiralTurn(2);
        if (idx === '3') rewindSpiralTurn(3);
      }
    });

    // T03-05: Start button interaction and keyboard enhancements
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Reveal.next();
      });
    }

    const state = Reveal.getState();
    if (state.indexh === 0) {
      setTimeout(() => {
        const slide01 = document.getElementById('slide-01');
        if (slide01) slide01.classList.add('active');
      }, 500);
    }

    Reveal.on('overviewshown', () => {
      document.body.classList.add('overview-active');
    });

    Reveal.on('overviewhidden', () => {
      document.body.classList.remove('overview-active');
    });
  });
});
