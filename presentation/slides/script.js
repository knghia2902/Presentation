/**
 * PREZI SPATIAL CAMERA ENGINE
 * Provides authentic Prezi experience:
 * - Dynamic Infinite 2D/3D Canvas Navigation
 * - Fluid Zoom-In, Zoom-Out & Pan to Topic Clusters and Cards
 * - Interactive Click-to-Zoom on any element
 * - Drag/Pan Canvas & Mouse Wheel Zoom
 * - Step-by-step Spiral Path SVG generation & animation
 */

document.addEventListener('DOMContentLoaded', () => {
  const world = document.getElementById('prezi-world');
  const viewport = document.getElementById('prezi-viewport');
  const framesList = document.getElementById('frames-list');
  const zoomIndicator = document.getElementById('zoom-indicator');
  const currentStopTitle = document.getElementById('current-stop-title');
  const stopCounter = document.getElementById('stop-counter');

  // Navigation stops definition matching our layout
  const STOPS = [
    {
      id: 'overview',
      title: 'Toàn cảnh (Overview)',
      targetId: null,
      type: 'overview'
    },
    {
      id: 'stop-01',
      title: '01. Tựa Đề: Quy Luật Phủ Định Của Phủ Định',
      targetId: 'stop-01',
      scaleOffset: 1.05
    },
    {
      id: 'stop-02',
      title: '02. Dẫn Nhập: Vì Sao Thế Giới Luôn Đổi Mới?',
      targetId: 'stop-02',
      scaleOffset: 1.15
    },
    {
      id: 'stop-03',
      title: '03. Khái Niệm Phủ Định Biện Chứng',
      targetId: 'stop-03',
      scaleOffset: 1.25
    },
    {
      id: 'stop-04',
      title: '04. Hai Đặc Trưng: Khách Quan & Kế Thừa',
      targetId: 'stop-04',
      scaleOffset: 1.15
    },
    {
      id: 'stop-05',
      title: '05. Biện Chứng vs. Siêu Hình',
      targetId: 'stop-05',
      scaleOffset: 1.2
    },
    {
      id: 'stop-06',
      title: '06. Chu Kỳ: A → B → A\'',
      targetId: 'stop-06',
      scaleOffset: 1.1
    },
    {
      id: 'stop-07',
      title: '07. Sơ Đồ Xoáy Ốc Không Gian 3D',
      targetId: 'stop-07',
      scaleOffset: 1.15
    },
    {
      id: 'stop-08',
      title: '08. Thực Tiễn: Hạt Thóc & Cây Lúa (§755)',
      targetId: 'stop-08',
      scaleOffset: 1.15
    },
    {
      id: 'stop-09',
      title: '09. Đời Sống Hiện Đại: Smartphone & AI',
      targetId: 'stop-09',
      scaleOffset: 1.2
    },
    {
      id: 'stop-10',
      title: '10. 4 Ý Nghĩa Phương Pháp Luận',
      targetId: 'stop-10',
      scaleOffset: 1.1
    },
    {
      id: 'stop-11',
      title: '11. Tổng Kết: Triết Lý Sự Tiến Bộ',
      targetId: 'stop-11',
      scaleOffset: 1.25
    },
    {
      id: 'stop-12',
      title: '12. Thảo Luận & Mini Game Quiz QR',
      targetId: 'stop-12',
      scaleOffset: 1.25
    }
  ];

  let currentStopIndex = 0;
  let isPanning = false;
  let startX = 0, startY = 0;
  let currentCamera = { x: 0, y: 0, scale: 1 };

  // 1. Generate Sidebar items
  function buildSidebar() {
    // Keep overview item, add rest
    STOPS.slice(1).forEach((stop, index) => {
      const item = document.createElement('div');
      item.className = 'frame-thumb-item';
      item.dataset.index = index + 1;
      item.innerHTML = `
        <div class="thumb-num">${index + 1}</div>
        <div class="thumb-preview">
          <span class="thumb-label">${stop.title}</span>
        </div>
      `;
      item.addEventListener('click', () => goToStop(index + 1));
      framesList.appendChild(item);
    });

    const overviewItem = framesList.querySelector('[data-target="overview"]');
    if (overviewItem) {
      overviewItem.addEventListener('click', () => goToStop(0));
    }
  }

  // 2. Camera Transform Engine
  function applyCamera(x, y, scale, smooth = true) {
    currentCamera = { x, y, scale };
    world.style.transition = smooth ? 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
  }

  // Calculate Overview position to fit entire World on screen
  function getOverviewTransform() {
    const vpRect = viewport.getBoundingClientRect();
    const worldWidth = 3200;
    const worldHeight = 2200;

    // Margin around overview
    const scaleX = (vpRect.width * 0.92) / worldWidth;
    const scaleY = (vpRect.height * 0.92) / worldHeight;
    const fitScale = Math.min(scaleX, scaleY);

    const targetX = (vpRect.width - worldWidth * fitScale) / 2 - vpRect.width / 2;
    const targetY = (vpRect.height - worldHeight * fitScale) / 2 - vpRect.height / 2;

    return { x: targetX, y: targetY, scale: fitScale };
  }

  // Focus camera into a specific HTML element
  function getElementFocusTransform(el, scaleMultiplier = 1.0) {
    const vpRect = viewport.getBoundingClientRect();
    
    // Get target coordinates relative to prezi-world
    const elLeft = el.offsetLeft;
    const elTop = el.offsetTop;
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    // Calculate ideal zoom scale to fit element nicely in center of viewport
    const scaleX = (vpRect.width * 0.8) / elW;
    const scaleY = (vpRect.height * 0.8) / elH;
    let targetScale = Math.min(scaleX, scaleY) * scaleMultiplier;
    targetScale = Math.min(Math.max(targetScale, 0.6), 1.6); // Clamp scale

    // Calculate translate so center of element lands at center of viewport
    const targetX = -(elLeft + elW / 2) * targetScale;
    const targetY = -(elTop + elH / 2) * targetScale;

    return { x: targetX, y: targetY, scale: targetScale };
  }

  // 3. Navigation controller
  function goToStop(index, smooth = true) {
    if (index < 0 || index >= STOPS.length) return;
    currentStopIndex = index;
    const stop = STOPS[index];

    // Remove active class from cards
    document.querySelectorAll('.canvas-card').forEach(c => c.classList.remove('current-active'));

    if (stop.type === 'overview') {
      const ov = getOverviewTransform();
      applyCamera(ov.x, ov.y, ov.scale, smooth);
    } else {
      const el = document.getElementById(stop.targetId);
      if (el) {
        el.classList.add('current-active');
        const focus = getElementFocusTransform(el, stop.scaleOffset || 1.0);
        applyCamera(focus.x, focus.y, focus.scale, smooth);
      }
    }

    // Update UI indicator
    currentStopTitle.textContent = stop.title;
    stopCounter.textContent = `Trạm ${index} / ${STOPS.length - 1}`;

    // Update Sidebar active state
    document.querySelectorAll('.frame-thumb-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
      if (i === index) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // If stop 7 (spiral diagram), animate spiral paths
    if (stop.id === 'stop-07') {
      animateSpiralOnPrezi();
    }
  }

  // 4. Interactive Click-to-Zoom on any Card
  function setupClickableCards() {
    STOPS.slice(1).forEach((stop, index) => {
      const el = document.getElementById(stop.targetId);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          goToStop(index + 1);
        });
      }
    });

    // Clicking blank viewport resets to Overview
    viewport.addEventListener('click', (e) => {
      if (e.target === viewport || e.target === world || e.target.classList.contains('manuscript-watermark')) {
        goToStop(0);
      }
    });
  }

  // 5. Drag/Pan Canvas Engine
  function setupPanning() {
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.canvas-card') || e.target.closest('.nav-btn')) return;
      isPanning = true;
      startX = e.clientX - currentCamera.x;
      startY = e.clientY - currentCamera.y;
      world.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      applyCamera(newX, newY, currentCamera.scale, false);
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        world.style.transition = 'transform 0.5s ease-out';
      }
    });

    // Mouse Wheel Zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(currentCamera.scale * zoomFactor, 0.2), 2.5);
      applyCamera(currentCamera.x, currentCamera.y, newScale, true);
    }, { passive: false });
  }

  // 6. SVG Spiral Generator
  function generatePreziSpiral() {
    const turns = [
      { id: 'pz-turn-1', startY: 400, endY: 280, startRX: 170, endRX: 140, startRY: 45, endRY: 38 },
      { id: 'pz-turn-2', startY: 280, endY: 160, startRX: 140, endRX: 110, startRY: 38, endRY: 30 },
      { id: 'pz-turn-3', startY: 160, endY: 70,  startRX: 110, endRX: 85,  startRY: 30, endRY: 22 }
    ];

    const centerX = 350;
    const numPoints = 60;

    turns.forEach((turn) => {
      const pathEl = document.getElementById(turn.id);
      if (!pathEl) return;

      let d = '';
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const angle = t * 2 * Math.PI;
        const currentY = turn.startY + t * (turn.endY - turn.startY);
        const currentRX = turn.startRX + t * (turn.endRX - turn.startRX);
        const currentRY = turn.startRY + t * (turn.endRY - turn.startRY);

        const x = centerX + currentRX * Math.cos(angle);
        const y = currentY + currentRY * Math.sin(angle);

        if (i === 0) d += `M ${x} ${y} `;
        else d += `L ${x} ${y} `;
      }

      pathEl.setAttribute('d', d);
      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = len;
      pathEl.style.strokeDashoffset = len;
    });
  }

  function animateSpiralOnPrezi() {
    const t1 = document.getElementById('pz-turn-1');
    const t2 = document.getElementById('pz-turn-2');
    const t3 = document.getElementById('pz-turn-3');

    if (t1) {
      setTimeout(() => { t1.style.strokeDashoffset = 0; }, 200);
    }
    if (t2) {
      setTimeout(() => { t2.style.strokeDashoffset = 0; }, 800);
    }
    if (t3) {
      setTimeout(() => { t3.style.strokeDashoffset = 0; }, 1400);
    }
  }

  // 7. Keyboard & Button Event Handlers
  function setupControls() {
    document.getElementById('btn-next').addEventListener('click', () => {
      if (currentStopIndex < STOPS.length - 1) goToStop(currentStopIndex + 1);
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
      if (currentStopIndex > 0) goToStop(currentStopIndex - 1);
    });

    document.getElementById('btn-home').addEventListener('click', () => {
      goToStop(0);
    });

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      applyCamera(currentCamera.x, currentCamera.y, currentCamera.scale * 1.25, true);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      applyCamera(currentCamera.x, currentCamera.y, currentCamera.scale * 0.8, true);
    });

    // Toggle Sidebar
    const sidebar = document.getElementById('prezi-sidebar');
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => goToStop(currentStopIndex, true), 300);
    });

    // Present Fullscreen Mode
    document.getElementById('btn-present-mode').addEventListener('click', () => {
      document.body.classList.toggle('in-present-mode');
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setTimeout(() => goToStop(currentStopIndex, true), 300);
    });

    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentStopIndex < STOPS.length - 1) goToStop(currentStopIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentStopIndex > 0) goToStop(currentStopIndex - 1);
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'o') {
        e.preventDefault();
        goToStop(0);
      }
    });

    // Auto-fit overview on window resize
    window.addEventListener('resize', () => {
      if (currentStopIndex === 0) {
        const ov = getOverviewTransform();
        applyCamera(ov.x, ov.y, ov.scale, false);
      }
    });
  }

  // Initialize
  buildSidebar();
  setupClickableCards();
  setupPanning();
  generatePreziSpiral();
  setupControls();

  // Initial state: Show Overview
  setTimeout(() => {
    goToStop(0, false);
  }, 100);
});
