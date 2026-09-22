/**
 * PREZI SPATIAL CAMERA ENGINE (Updated with full stops & rich thumbnails)
 * Provides authentic Prezi experience matching user screenshot & link:
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
      scaleOffset: 1.05,
      previewImg: 'assets/images/thumb_overview.png'
    },
    {
      id: 'stop-02',
      title: '02. Vị Trí Quy Luật & Karl Marx',
      targetId: 'stop-02',
      scaleOffset: 1.15,
      previewImg: 'assets/images/karl_marx.jpg'
    },
    {
      id: 'stop-03',
      title: '03. Khái Niệm Phủ Định Biện Chứng',
      targetId: 'stop-03',
      scaleOffset: 1.25,
      previewImg: 'assets/images/bust_portrait_card.png'
    },
    {
      id: 'stop-04',
      title: '04. Tiến Trình Phát Triển Tự Nhiên & Tư Duy',
      targetId: 'stop-04',
      scaleOffset: 1.2,
      previewImg: 'assets/images/thumb_evolution_card.png'
    },
    {
      id: 'stop-05',
      title: '05. Các Nguyên Lý Cơ Bản',
      targetId: 'stop-05',
      scaleOffset: 1.15,
      previewImg: 'assets/images/antique_book.jpg'
    },
    {
      id: 'stop-06',
      title: '06. Kế Thừa: Biện Chứng vs. Siêu Hình',
      targetId: 'stop-06',
      scaleOffset: 1.25,
      previewImg: 'assets/images/thumb_overview.png'
    },
    {
      id: 'stop-07',
      title: '07. Phân Tích & Chu Kỳ Phát Triển',
      targetId: 'stop-07',
      scaleOffset: 1.15,
      previewImg: 'assets/images/thumb_overview.png'
    },
    {
      id: 'stop-08',
      title: '08. Sơ Đồ Xoáy Ốc Không Gian 3D',
      targetId: 'stop-08',
      scaleOffset: 1.15,
      previewImg: 'assets/images/thumb_overview.png'
    },
    {
      id: 'stop-09',
      title: '09. Ứng Dụng Trong Triết Học & Hegel',
      targetId: 'stop-09',
      scaleOffset: 1.2,
      previewImg: 'assets/images/hegel.jpg'
    },
    {
      id: 'stop-10',
      title: '10. Ví Dụ Sinh Học: Hạt Lúa (§755)',
      targetId: 'stop-10',
      scaleOffset: 1.2,
      previewImg: 'assets/images/rice_field.jpg'
    },
    {
      id: 'stop-11',
      title: '11. Ví Dụ Công Nghệ: Điện Thoại Thông Minh',
      targetId: 'stop-11',
      scaleOffset: 1.2,
      previewImg: 'assets/images/smartphone_tech.jpg'
    },
    {
      id: 'stop-12',
      title: '12. Kết Luận & Triết Lý Tiến Bộ',
      targetId: 'stop-12',
      scaleOffset: 1.15,
      previewImg: 'assets/images/greek_statue.jpg'
    },
    {
      id: 'stop-13',
      title: '13. 4 Ý Nghĩa Phương Pháp Luận',
      targetId: 'stop-13',
      scaleOffset: 1.25,
      previewImg: 'assets/images/vintage_note_paper.png'
    },
    {
      id: 'stop-14',
      title: '14. Giao Lưu & Mini Game Quiz QR',
      targetId: 'stop-14',
      scaleOffset: 1.25,
      previewImg: 'assets/images/thumb_overview.png'
    }
  ];

  let currentStopIndex = 0;
  let isPanning = false;
  let startX = 0, startY = 0;
  let currentCamera = { x: 0, y: 0, scale: 1 };

  // 1. Generate Sidebar items
  function buildSidebar() {
    STOPS.slice(1).forEach((stop, index) => {
      const item = document.createElement('div');
      item.className = 'frame-thumb-item';
      item.dataset.index = index + 1;
      item.innerHTML = `
        <div class="thumb-card-preview">
          <img src="${stop.previewImg || 'assets/images/thumb_overview.png'}" alt="Thumb" class="thumb-img-card">
          <div class="thumb-badge-index">${index + 1}</div>
        </div>
        <span class="thumb-caption">${stop.title.split(':')[0]}</span>
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
    const worldWidth = 3400;
    const worldHeight = 2400;

    const scaleX = (vpRect.width * 0.94) / worldWidth;
    const scaleY = (vpRect.height * 0.94) / worldHeight;
    const fitScale = Math.min(scaleX, scaleY);

    const targetX = (vpRect.width - worldWidth * fitScale) / 2 - vpRect.width / 2;
    const targetY = (vpRect.height - worldHeight * fitScale) / 2 - vpRect.height / 2;

    return { x: targetX, y: targetY, scale: fitScale };
  }

  // Focus camera into a specific HTML element
  function getElementFocusTransform(el, scaleMultiplier = 1.0) {
    const vpRect = viewport.getBoundingClientRect();
    
    const elLeft = el.offsetLeft;
    const elTop = el.offsetTop;
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    const scaleX = (vpRect.width * 0.82) / elW;
    const scaleY = (vpRect.height * 0.82) / elH;
    let targetScale = Math.min(scaleX, scaleY) * scaleMultiplier;
    targetScale = Math.min(Math.max(targetScale, 0.6), 1.6);

    const targetX = -(elLeft + elW / 2) * targetScale;
    const targetY = -(elTop + elH / 2) * targetScale;

    return { x: targetX, y: targetY, scale: targetScale };
  }

  // 3. Navigation controller
  function goToStop(index, smooth = true) {
    if (index < 0 || index >= STOPS.length) return;
    currentStopIndex = index;
    const stop = STOPS[index];

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

    currentStopTitle.textContent = stop.title;
    stopCounter.textContent = `Trạm ${index} / ${STOPS.length - 1}`;

    document.querySelectorAll('.frame-thumb-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
      if (i === index) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    if (stop.id === 'stop-08') {
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

    viewport.addEventListener('click', (e) => {
      if (e.target === viewport || e.target === world || e.target.classList.contains('bg-manuscript-layer') || e.target.classList.contains('bg-splash-layer')) {
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
      { id: 'pz-turn-1', startY: 380, endY: 260, startRX: 165, endRX: 135, startRY: 45, endRY: 36 },
      { id: 'pz-turn-2', startY: 260, endY: 150, startRX: 135, endRX: 105, startRY: 36, endRY: 28 },
      { id: 'pz-turn-3', startY: 150, endY: 65,  startRX: 105, endRX: 80,  startRY: 28, endRY: 20 }
    ];

    const centerX = 340;
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

    if (t1) setTimeout(() => { t1.style.strokeDashoffset = 0; }, 200);
    if (t2) setTimeout(() => { t2.style.strokeDashoffset = 0; }, 800);
    if (t3) setTimeout(() => { t3.style.strokeDashoffset = 0; }, 1400);
  }

  // 7. Keyboard & Controls
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

    const sidebar = document.getElementById('prezi-sidebar');
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => goToStop(currentStopIndex, true), 300);
    });

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
