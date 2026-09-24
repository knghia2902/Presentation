/**
 * PREZI SPATIAL CAMERA ENGINE (Updated with full stops & rich thumbnails)
 * Provides authentic Prezi experience matching user screenshot & link:
 * - Dynamic Infinite 2D/3D Canvas Navigation
 * - Fluid Zoom-In, Zoom-Out & Pan to Topic Clusters and Cards
 * - Interactive Click-to-Zoom on any element
 * - Drag/Pan Canvas & Mouse Wheel Zoom
 * - Step-by-step Spiral Path SVG generation & animation
 */

function initPreziApp() {
  const world = document.getElementById('prezi-world');
  const viewport = document.getElementById('prezi-viewport');
  const framesList = document.getElementById('frames-list');
  const zoomIndicator = document.getElementById('zoom-indicator');
  const currentStopTitle = document.getElementById('current-stop-title');
  const stopCounter = document.getElementById('stop-counter');

  // Dynamic Navigation stops definition
  let STOPS = [
    {
      id: 'overview',
      title: 'Toàn cảnh (Overview)',
      targetId: 'overview-frame-box',
      type: 'overview'
    }
  ];
  window.STOPS = STOPS;

  // Dynamically sync STOPS and frame numbers from existing cards and slide frames on canvas
  function syncStopsFromDOM() {
    const existingCards = Array.from(world.querySelectorAll('.canvas-slide-frame, .canvas-card, .canvas-item')).filter(el => !el.classList.contains('prezi-textbox') && !el.classList.contains('custom-added-text-box') && !el.classList.contains('user-image-wrapper') && el.id !== 'overview-frame-box');
    if (existingCards.length === 0 && typeof ensureOverviewFrameBox === 'function') {
      ensureOverviewFrameBox();
    }
    const newStops = [
      {
        id: 'overview',
        title: 'Toàn cảnh (Overview)',
        targetId: 'overview-frame-box',
        type: 'overview'
      }
    ];

    existingCards.forEach((card, idx) => {
      const num = idx + 1;
      const cardId = card.id || `frame-${num < 10 ? '0' + num : num}`;
      card.id = cardId;

      // Do NOT display number badge inside slide frames (User: "bỏ số 1 ở góc bên trái khung đi")
      card.querySelectorAll('.card-step-badge').forEach(b => b.remove());

      const titleEl = card.querySelector('h1, h2, h3, h4, .card-title-prezi, .card-title-large, .hero-title');
      const titleText = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : `Frame ${num}`;

      // Only show user-placed image in thumbnail, never use obsolete Marx/philosophy portrait
      const userImg = card.querySelector('.user-placed-image, img');
      const previewImg = (userImg && !userImg.src.includes('thumb_overview.png')) ? userImg.src : null;

      newStops.push({
        id: cardId,
        title: `${num < 10 ? '0' + num : num}. ${titleText}`,
        targetId: cardId,
        scaleOffset: 1.0,
        previewImg: previewImg
      });
    });

    STOPS = newStops;
    window.STOPS = STOPS;
    buildSidebar();
    if (currentStopIndex >= STOPS.length) {
      currentStopIndex = Math.max(0, STOPS.length - 1);
    }
    updateNavControls();
  }
  window.syncStopsFromDOM = syncStopsFromDOM;

  function updateNavControls() {
    if (currentStopIndex >= STOPS.length) {
      currentStopIndex = Math.max(0, STOPS.length - 1);
    }
    const stop = STOPS[currentStopIndex] || STOPS[0];
    if (currentStopTitle && stop) {
      currentStopTitle.textContent = stop.title;
    }
    if (stopCounter) {
      stopCounter.textContent = STOPS.length <= 1 ? 'Chưa có frame' : (currentStopIndex === 0 ? 'Overview' : `Frame ${currentStopIndex} / ${STOPS.length - 1}`);
    }
    document.querySelectorAll('.frame-thumb-item').forEach((item, i) => {
      item.classList.toggle('active', i === currentStopIndex);
    });
  }
  window.updateNavControls = updateNavControls;

  let currentStopIndex = 0;
  let isPanning = false;
  let startX = 0, startY = 0;
  let currentCamera = { x: 0, y: 0, scale: 1 };

  // 1. Generate Sidebar items
  function buildSidebar() {
    const overviewItem = framesList.querySelector('[data-target="overview"]');
    framesList.innerHTML = '';
    if (overviewItem) {
      framesList.appendChild(overviewItem);
      overviewItem.onclick = () => goToStop(0);
    } else {
      const ov = document.createElement('div');
      ov.className = 'frame-thumb-item' + (currentStopIndex === 0 ? ' active' : '');
      ov.dataset.target = 'overview';
      ov.dataset.index = 0;
      ov.innerHTML = `
        <div class="thumb-card-preview overview-card-blank">
          <div class="thumb-home-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#374151"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
        </div>
        <span class="thumb-caption">Overview</span>
      `;
      ov.onclick = () => goToStop(0);
      framesList.appendChild(ov);
    }

    STOPS.slice(1).forEach((stop, index) => {
      const stopIndex = index + 1;
      const item = document.createElement('div');
      item.className = 'frame-thumb-item' + (currentStopIndex === stopIndex ? ' active' : '');
      item.dataset.index = stopIndex;
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
        <div class="thumb-card-preview blank-frame-preview">
          ${stop.previewImg ? `<img src="${stop.previewImg}" alt="Thumb" class="thumb-img-card">` : `<div class="thumb-blank-slide"></div>`}
          <div class="thumb-badge-index">${stopIndex}</div>
          <button class="thumb-delete-btn" title="Xóa Frame ${stopIndex} (Delete)" type="button">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 12z"/>
            </svg>
          </button>
        </div>
        <span class="thumb-caption">Frame ${stopIndex}</span>
      `;

      const delBtn = item.querySelector('.thumb-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetEl = document.getElementById(stop.targetId);
          if (targetEl) {
            deleteCard(targetEl, true);
          }
        });
      }

      item.addEventListener('click', () => {
        goToStop(stopIndex);
        const targetEl = document.getElementById(stop.targetId);
        if (targetEl) {
          document.querySelectorAll('.canvas-slide-frame.selected, .canvas-empty-frame-box.selected, .canvas-card.card-selected, .prezi-textbox.selected, .user-image-wrapper.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
          targetEl.classList.add('selected');
        }
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          e.stopPropagation();
          const targetEl = document.getElementById(stop.targetId);
          if (targetEl) {
            deleteCard(targetEl, true);
          }
        }
      });

      framesList.appendChild(item);
    });
  }

  // 2. Camera Transform Engine
  function applyCamera(x, y, scale, smooth = true) {
    currentCamera = { x, y, scale };
    world.style.transition = smooth ? 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
  }

  // Computes the unobstructed Safe Work Area between sidebars and controls
  function getSafeWorkArea() {
    const vpRect = viewport ? viewport.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
    const leftSidebar = document.getElementById('prezi-sidebar');
    const isPresent = document.body.classList.contains('in-present-mode');
    const isLeftCollapsed = leftSidebar ? leftSidebar.classList.contains('collapsed') : false;

    // Left inset: In presentation mode = 24px margin. In edit mode:
    // If expanded: 210px sidebar + 12px margin + 18px breathing room = 240px.
    // If collapsed: small chevron tab = 48px.
    const leftInset = isPresent ? 24 : (isLeftCollapsed ? 48 : 240);

    // Right inset: Right sidebar is 320px flex child when open, so vpRect.width already reflects it.
    const rightInset = 24;
    const topInset = 20;
    const bottomInset = isPresent ? 24 : 70;

    const safeW = Math.max(300, vpRect.width - leftInset - rightInset);
    const safeH = Math.max(200, vpRect.height - topInset - bottomInset);

    // Center coordinates inside viewport
    const centerX = leftInset + safeW / 2;
    const centerY = topInset + safeH / 2;

    return {
      safeW,
      safeH,
      centerX,
      centerY,
      vpRect
    };
  }
  window.getSafeWorkArea = getSafeWorkArea;

  // Calculate Overview position to fit entire World or existing cards on screen
  function getOverviewTransform() {
    const safe = getSafeWorkArea();
    if (typeof ensureOverviewFrameBox === 'function') ensureOverviewFrameBox();
    const overviewBox = document.getElementById('overview-frame-box');
    const cards = Array.from(world.querySelectorAll('.canvas-slide-frame, .canvas-card, .canvas-item, .user-image-wrapper'))
      .filter(el => el.id !== 'overview-frame-box' && !el.classList.contains('prezi-textbox'));

    if (cards.length === 0) {
      const fw = overviewBox ? overviewBox.offsetWidth : 860;
      const fh = overviewBox ? overviewBox.offsetHeight : 484;
      const fLeft = overviewBox ? overviewBox.offsetLeft : 1270;
      const fTop = overviewBox ? overviewBox.offsetTop : 958;
      const cx = fLeft + fw / 2;
      const cy = fTop + fh / 2;

      const scaleX = (safe.safeW * 0.82) / fw;
      const scaleY = (safe.safeH * 0.82) / fh;
      const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25);
      return {
        x: safe.centerX - cx * fitScale,
        y: safe.centerY - cy * fitScale,
        scale: Math.round(fitScale * 100) / 100
      };
    }

    let minX = overviewBox ? overviewBox.offsetLeft : Infinity;
    let minY = overviewBox ? overviewBox.offsetTop : Infinity;
    let maxX = overviewBox ? (overviewBox.offsetLeft + overviewBox.offsetWidth) : -Infinity;
    let maxY = overviewBox ? (overviewBox.offsetTop + overviewBox.offsetHeight) : -Infinity;

    cards.forEach(c => {
      const left = c.offsetLeft;
      const top = c.offsetTop;
      const right = left + c.offsetWidth;
      const bottom = top + c.offsetHeight;
      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    });

    const pad = 100;
    const w = Math.max(maxX - minX + pad * 2, 860);
    const h = Math.max(maxY - minY + pad * 2, 484);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const scaleX = (safe.safeW * 0.82) / w;
    const scaleY = (safe.safeH * 0.82) / h;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.20), 1.25);

    return {
      x: safe.centerX - cx * fitScale,
      y: safe.centerY - cy * fitScale,
      scale: Math.round(fitScale * 100) / 100
    };
  }

  // Focus camera into a specific HTML element using exact coordinates relative to #prezi-world
  function getElementFocusTransform(el, scaleMultiplier = 1.0) {
    const safe = getSafeWorkArea();
    const wRect = world.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const currentScale = currentCamera.scale || 1;

    // Element's unscaled world coordinates relative to (0,0) of #prezi-world
    const elWorldX = (elRect.left - wRect.left) / currentScale;
    const elWorldY = (elRect.top - wRect.top) / currentScale;
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    const elCenterX = elWorldX + elW / 2;
    const elCenterY = elWorldY + elH / 2;

    const scaleX = (safe.safeW * 0.88) / elW;
    const scaleY = (safe.safeH * 0.88) / elH;
    let targetScale = Math.min(scaleX, scaleY) * scaleMultiplier;
    // Allow clean zoom bounds so cards comfortably fill the viewport
    targetScale = Math.min(Math.max(targetScale, 0.4), 2.0);

    // Target (X, Y) centers the specific element in the safe visible area
    const targetX = safe.centerX - elCenterX * targetScale;
    const targetY = safe.centerY - elCenterY * targetScale;

    return { x: targetX, y: targetY, scale: targetScale };
  }
  window.getElementFocusTransform = getElementFocusTransform;
  window.goToStop = goToStop;
  window.applyCamera = applyCamera;

  // 3. Navigation controller
  function goToStop(index, smooth = true) {
    if (index < 0 || index >= STOPS.length) return;
    currentStopIndex = index;
    const stop = STOPS[index];

    document.querySelectorAll('.canvas-card').forEach(c => c.classList.remove('current-active', 'card-selected'));
    document.querySelectorAll('.canvas-slide-frame').forEach(f => f.classList.remove('current-active', 'selected'));
    document.querySelectorAll('.canvas-empty-frame-box').forEach(b => b.classList.remove('selected', 'current-active'));

    if (stop.type === 'overview' || stop.targetId === 'overview-frame-box') {
      const ovBox = document.getElementById('overview-frame-box') || (typeof ensureOverviewFrameBox === 'function' ? ensureOverviewFrameBox() : null);
      if (ovBox) {
        ovBox.classList.add('selected', 'current-active');
        const focus = getElementFocusTransform(ovBox, 1.0);
        applyCamera(focus.x, focus.y, focus.scale, smooth);
      } else {
        const ov = getOverviewTransform();
        applyCamera(ov.x, ov.y, ov.scale, smooth);
      }
    } else {
      const el = document.getElementById(stop.targetId);
      if (el) {
        el.classList.add('current-active');
        const focus = getElementFocusTransform(el, stop.scaleOffset || 1.0);
        applyCamera(focus.x, focus.y, focus.scale, smooth);
      }
    }

    if (currentStopTitle && stop) {
      currentStopTitle.textContent = stop.title;
    }
    if (stopCounter) {
      stopCounter.textContent = index === 0 ? 'Overview' : `Frame ${index} / ${STOPS.length - 1}`;
    }

    document.querySelectorAll('.frame-thumb-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
      if (i === index && item.scrollIntoView) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    if (stop.id === 'stop-08') {
      animateSpiralOnPrezi();
    }
  }

  // 4. Card Selection, 8-Direction Resizing, Drag & Drop, and Action Bar Engine
  function saveCardsLayout() {
    const layout = {};
    document.querySelectorAll('.canvas-card, .canvas-item').forEach(c => {
      if (c.id && (c.style.width || c.style.height || c.style.transform)) {
        layout[c.id] = {
          w: c.style.width || '',
          h: c.style.height || '',
          t: c.style.transform || ''
        };
      }
    });
    try {
      localStorage.setItem('prezi_cards_layout_v2', JSON.stringify(layout));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }

  function restoreCardsLayout() {
    try {
      const raw = localStorage.getItem('prezi_cards_layout_v2');
      if (!raw) return;
      const layout = JSON.parse(raw);
      Object.keys(layout).forEach(id => {
        const c = document.getElementById(id);
        if (c) {
          if (layout[id].w) c.style.width = layout[id].w;
          if (layout[id].h) c.style.height = layout[id].h;
          if (layout[id].t) c.style.transform = layout[id].t;
        }
      });
    } catch (e) {
      console.warn('Failed to restore card layout', e);
    }
  }

  function setupCardInteractions() {
    const cards = document.querySelectorAll('.canvas-card, .canvas-item');
    
    // Inject 8 resize handles & floating action bar to every card
    cards.forEach(card => {
      const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
      handles.forEach(h => {
        if (!card.querySelector(`.card-resize-handle.handle-${h}`)) {
          const handleEl = document.createElement('div');
          handleEl.className = `card-resize-handle handle-${h}`;
          handleEl.dataset.handle = h;
          card.appendChild(handleEl);
        }
      });

      // Remove any leftover action bar from past versions
      card.querySelectorAll('.card-action-bar').forEach(b => b.remove());
    });

    restoreCardsLayout();

    // Card Selection & Direct Dragging (Prezi style - no clunky action bar)
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // If in present mode, ignore edit selection
        if (document.body.classList.contains('in-present-mode')) return;

        // If clicking on resize handle, handled by resize mousedown
        if (e.target.classList.contains('card-resize-handle')) return;

        // Select this card for editing and resizing
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => {
          if (c !== card) c.classList.remove('card-selected');
        });
        card.classList.add('card-selected');

        // Highlight corresponding stop in sidebar without moving camera!
        const stopIdx = STOPS.findIndex(s => s.targetId === card.id);
        if (stopIdx >= 0) {
          currentStopIndex = stopIdx;
          if (currentStopTitle && STOPS[stopIdx]) {
            currentStopTitle.textContent = STOPS[stopIdx].title;
          }
          if (stopCounter) {
            stopCounter.textContent = stopIdx === 0 ? 'Overview' : `Frame ${stopIdx} / ${STOPS.length - 1}`;
          }
          document.querySelectorAll('.frame-thumb-item').forEach((item, i) => {
            item.classList.toggle('active', i === stopIdx);
          });
        }
      });

      // Double-click to zoom camera into card or deep-zoom into sub-item
      card.addEventListener('dblclick', (e) => {
        // If double clicked on a cycle-box or s-cap, deep zoom into that sub-item!
        const subBox = e.target.closest('.cycle-box, .s-cap, .cmp-box, .card-media-col');
        if (subBox) {
          e.stopPropagation();
          const focus = getElementFocusTransform(subBox, 1.4);
          applyCamera(focus.x, focus.y, focus.scale, true);
          return;
        }

        e.stopPropagation();
        const stopIdx = STOPS.findIndex(s => s.targetId === card.id);
        if (stopIdx >= 0) {
          goToStop(stopIdx);
        } else {
          const focus = getElementFocusTransform(card, 1.15);
          applyCamera(focus.x, focus.y, focus.scale, true);
        }
      });
    });

    // Deselect cards and elements when clicking on canvas background (WITHOUT resetting camera!)
    viewport.addEventListener('click', (e) => {
      if (e.target === viewport || e.target === world || e.target.classList.contains('bg-manuscript-layer') || e.target.classList.contains('bg-splash-layer') || e.target.classList.contains('bg-note-paper-layer') || (e.target.tagName === 'IMG' && !e.target.closest('.user-image-wrapper') && !e.target.closest('.canvas-card'))) {
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => c.classList.remove('card-selected'));
        document.querySelectorAll('.user-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
        document.querySelectorAll('.prezi-selected-img').forEach(i => i.classList.remove('prezi-selected-img'));
        selectedImgEl = null;
        const imgToolbar = document.getElementById('image-floating-toolbar');
        if (imgToolbar) imgToolbar.classList.remove('show');
      }
    });

    // 8-Direction Card Resizing Engine
    let activeResizeCard = null;
    let resizeHandleType = null;
    let rStartX = 0, rStartY = 0;
    let rStartW = 0, rStartH = 0;
    let rStartTransX = 0, rStartTransY = 0;

    world.addEventListener('mousedown', (e) => {
      const handle = e.target.closest('.card-resize-handle');
      if (!handle) return;
      e.stopPropagation();
      e.preventDefault();

      activeResizeCard = handle.closest('.canvas-card, .canvas-item');
      if (!activeResizeCard || activeResizeCard.classList.contains('is-locked') || activeResizeCard.getAttribute('data-locked') === 'true') {
        activeResizeCard = null;
        return;
      }

      resizeHandleType = handle.dataset.handle;
      rStartX = e.clientX;
      rStartY = e.clientY;
      rStartW = activeResizeCard.offsetWidth;
      rStartH = activeResizeCard.offsetHeight;

      const curTrans = activeResizeCard.style.transform || '';
      const match = curTrans.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      rStartTransX = match ? parseFloat(match[1]) : 0;
      rStartTransY = match ? parseFloat(match[2]) : 0;
    });

    // Card Dragging Engine
    let activeDragCard = null;
    let dStartX = 0, dStartY = 0;
    let dStartTransX = 0, dStartTransY = 0;

    world.addEventListener('mousedown', (e) => {
      if (document.body.classList.contains('in-present-mode')) return;
      if (e.target.closest('.card-resize-handle') || e.target.closest('.frame-handle') || e.target.closest('.user-image-wrapper')) return;
      if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;

      const card = e.target.closest('.canvas-card, .canvas-item');
      if (!card) return;

      // Select card
      document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => {
        if (c !== card) c.classList.remove('card-selected');
      });
      card.classList.add('card-selected');

      if (card.classList.contains('is-locked') || card.getAttribute('data-locked') === 'true') {
        // Locked: select card but do not drag
        return;
      }

      activeDragCard = card;
      dStartX = e.clientX;
      dStartY = e.clientY;

      const curTrans = activeDragCard.style.transform || '';
      const match = curTrans.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      dStartTransX = match ? parseFloat(match[1]) : 0;
      dStartTransY = match ? parseFloat(match[2]) : 0;
    });

    window.addEventListener('mousedown', (e) => {
      if (!e.target.closest('.canvas-card') && !e.target.closest('.canvas-item') && !e.target.closest('.card-resize-handle') && !e.target.closest('.prezi-floating-text-toolbar') && !e.target.closest('.prezi-floating-image-toolbar')) {
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => c.classList.remove('card-selected'));
      }
    });

    // Global MouseMove for Resize & Drag
    window.addEventListener('mousemove', (e) => {
      const scale = currentCamera.scale || 1;

      if (activeResizeCard) {
        const dx = (e.clientX - rStartX) / scale;
        const dy = (e.clientY - rStartY) / scale;

        let newW = rStartW;
        let newH = rStartH;
        let newTransX = rStartTransX;
        let newTransY = rStartTransY;

        // Width adjustment
        if (['e', 'se', 'ne'].includes(resizeHandleType)) {
          newW = Math.max(280, rStartW + dx);
        } else if (['w', 'sw', 'nw'].includes(resizeHandleType)) {
          const possibleW = rStartW - dx;
          if (possibleW >= 280) {
            newW = possibleW;
            newTransX = rStartTransX + dx;
          }
        }

        // Height adjustment
        if (['s', 'se', 'sw'].includes(resizeHandleType)) {
          newH = Math.max(120, rStartH + dy);
        } else if (['n', 'ne', 'nw'].includes(resizeHandleType)) {
          const possibleH = rStartH - dy;
          if (possibleH >= 120) {
            newH = possibleH;
            newTransY = rStartTransY + dy;
          }
        }

        activeResizeCard.style.width = `${newW}px`;
        activeResizeCard.style.height = `${newH}px`;
        activeResizeCard.style.transform = `translate(${newTransX}px, ${newTransY}px)`;
      } else if (activeDragCard) {
        const dx = (e.clientX - dStartX) / scale;
        const dy = (e.clientY - dStartY) / scale;
        activeDragCard.style.transform = `translate(${dStartTransX + dx}px, ${dStartTransY + dy}px)`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (activeResizeCard || activeDragCard) {
        activeResizeCard = null;
        activeDragCard = null;
        saveCardsLayout();
        showToast('Đã lưu vị trí & kích thước thẻ.');
      }
    });

    setupOverviewFrameInteractions();
  }

  // Guarantees #overview-frame-box exists permanently (representing Overview frame)
  function ensureOverviewFrameBox() {
    let frameBox = document.getElementById('overview-frame-box');
    if (!frameBox) {
      frameBox = document.createElement('div');
      frameBox.className = 'canvas-empty-frame-box';
      frameBox.id = 'overview-frame-box';
      frameBox.innerHTML = `
        <span class="frame-handle top-left"></span>
        <span class="frame-handle top-right"></span>
        <span class="frame-handle bottom-left"></span>
        <span class="frame-handle bottom-right"></span>
      `;
      frameBox.style.left = '1270px';
      frameBox.style.top = '958px';
      frameBox.style.width = '860px';
      frameBox.style.height = '484px';
      world.appendChild(frameBox);
    }
    setupOverviewFrameInteractions();
    return frameBox;
  }
  window.ensureOverviewFrameBox = ensureOverviewFrameBox;

  // Resizing and dragging for #overview-frame-box (Authentic Prezi frame matching media_1790130642265.png)
  function setupOverviewFrameInteractions() {
    const overviewBox = document.getElementById('overview-frame-box');
    if (!overviewBox || overviewBox.dataset.eventsBound) return;
    overviewBox.dataset.eventsBound = 'true';

    let isResizing = false;
    let resizeType = '';
    let isDragging = false;
    let sX = 0, sY = 0;
    let iW = 0, iH = 0, iLeft = 0, iTop = 0;

    overviewBox.querySelectorAll('.frame-handle').forEach(h => {
      h.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        if (h.classList.contains('top-left')) resizeType = 'tl';
        else if (h.classList.contains('top-right')) resizeType = 'tr';
        else if (h.classList.contains('bottom-left')) resizeType = 'bl';
        else if (h.classList.contains('bottom-right')) resizeType = 'br';

        sX = e.clientX;
        sY = e.clientY;
        iW = overviewBox.offsetWidth;
        iH = overviewBox.offsetHeight;
        iLeft = overviewBox.offsetLeft;
        iTop = overviewBox.offsetTop;
      });
    });

    overviewBox.addEventListener('mousedown', (e) => {
      if (e.target.closest('.frame-handle')) return;
      e.stopPropagation();
      document.querySelectorAll('.canvas-slide-frame.selected, .canvas-empty-frame-box.selected, .canvas-card.card-selected, .prezi-textbox.selected, .user-image-wrapper.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
      overviewBox.classList.add('selected');
      isDragging = true;
      sX = e.clientX;
      sY = e.clientY;
      iLeft = overviewBox.offsetLeft;
      iTop = overviewBox.offsetTop;
    });

    window.addEventListener('mousemove', (e) => {
      const scale = currentCamera.scale || 1;
      if (isResizing) {
        const dx = (e.clientX - sX) / scale;
        const dy = (e.clientY - sY) / scale;
        let newW = iW, newH = iH, newLeft = iLeft, newTop = iTop;

        if (resizeType === 'br') {
          newW = Math.max(180, iW + dx);
          newH = Math.max(120, iH + dy);
        } else if (resizeType === 'bl') {
          newW = Math.max(180, iW - dx);
          newH = Math.max(120, iH + dy);
          newLeft = iLeft + (iW - newW);
        } else if (resizeType === 'tr') {
          newW = Math.max(180, iW + dx);
          newH = Math.max(120, iH - dy);
          newTop = iTop + (iH - newH);
        } else if (resizeType === 'tl') {
          newW = Math.max(180, iW - dx);
          newH = Math.max(120, iH - dy);
          newLeft = iLeft + (iW - newW);
          newTop = iTop + (iH - newH);
        }

        overviewBox.style.width = `${Math.round(newW)}px`;
        overviewBox.style.height = `${Math.round(newH)}px`;
        overviewBox.style.left = `${Math.round(newLeft)}px`;
        overviewBox.style.top = `${Math.round(newTop)}px`;
      } else if (isDragging) {
        const dx = (e.clientX - sX) / scale;
        const dy = (e.clientY - sY) / scale;
        overviewBox.style.left = `${Math.round(iLeft + dx)}px`;
        overviewBox.style.top = `${Math.round(iTop + dy)}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isResizing || isDragging) {
        isResizing = false;
        isDragging = false;
        saveEditsToStorage();
      }
    });

    // Click on frame to select it (turns green + shows 4 blue corner handles)
    overviewBox.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.canvas-slide-frame.selected, .canvas-card.card-selected, .prezi-textbox.selected, .user-image-wrapper.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
      overviewBox.classList.add('selected');
    });

    // Click anywhere outside the frame to deselect (turns grey + hides handles as in media_1790131134493.png)
    document.addEventListener('click', (e) => {
      if (!overviewBox.contains(e.target) && !e.target.closest('.frame-thumb-item') && !e.target.closest('.prezi-context-menu') && !e.target.closest('#prezi-context-menu')) {
        overviewBox.classList.remove('selected');
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!overviewBox.contains(e.target) && !e.target.closest('.frame-thumb-item') && !e.target.closest('.prezi-floating-text-toolbar') && !e.target.closest('.prezi-context-menu') && !e.target.closest('#prezi-context-menu')) {
        overviewBox.classList.remove('selected');
      }
    });

    // Clicking Overview thumbnail in sidebar selects the frame
    document.querySelectorAll('[data-target="overview"]').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.canvas-slide-frame.selected, .canvas-card.card-selected, .prezi-textbox.selected, .user-image-wrapper.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
        overviewBox.classList.add('selected');
      });
    });
  }

  // Duplicate an existing card
  function duplicateCard(card) {
    const clone = card.cloneNode(true);
    const newId = `stop-custom-${Date.now()}`;
    clone.id = newId;
    clone.classList.remove('card-selected', 'current-active');
    
    // Clean up injected handles from clone
    clone.querySelectorAll('.card-resize-handle, .card-action-bar').forEach(el => el.remove());
    
    // Offset position by 50px
    const curTrans = card.style.transform || '';
    const match = curTrans.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    const curX = match ? parseFloat(match[1]) : 0;
    const curY = match ? parseFloat(match[2]) : 0;
    clone.style.transform = `translate(${curX + 50}px, ${curY + 50}px)`;
    clone.style.zIndex = 30;

    card.parentElement.appendChild(clone);

    // Register into STOPS
    const newIndex = STOPS.length;
    const cardTitle = clone.querySelector('h1, h2, h3, h4, .card-title-prezi')?.textContent?.trim() || 'Thẻ Nhân Bản';
    const cloneImg = clone.querySelector('.user-placed-image, img');
    const previewImg = (cloneImg && !cloneImg.src.includes('thumb_overview.png')) ? cloneImg.src : null;
    const newStop = {
      id: newId,
      title: `${newIndex < 10 ? '0' + newIndex : newIndex}. ${cardTitle}`,
      targetId: newId,
      scaleOffset: 1.15,
      previewImg: previewImg
    };
    STOPS.push(newStop);

    buildSidebar();
    setupCardInteractions();
    setupEditingEngine();

    showToast('Đã nhân bản thẻ thành công!');
    saveEditsToStorage();
    goToStop(newIndex);
  }

  // Delete an existing card (can delete down to 0 cards)
  function deleteCard(card, skipConfirm = false) {
    const cardTitle = card.querySelector('h1, h2, h3, h4, .card-title-prezi')?.textContent?.trim() || 'thẻ này';
    if (!skipConfirm && !confirm(`Bạn có chắc chắn muốn xóa "${cardTitle}" khỏi bài thuyết trình?`)) return;

    card.remove();
    syncStopsFromDOM();
    saveEditsToStorage();
    showToast(`Đã xóa "${cardTitle}" khỏi bài thuyết trình.`);

    if (STOPS.length <= 1) {
      goToStop(0);
    } else if (currentStopIndex >= STOPS.length) {
      goToStop(STOPS.length - 1);
    } else {
      goToStop(Math.max(0, currentStopIndex));
    }
  }

  // Clear all cards from the canvas completely
  function clearAllCards() {
    if (!confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ các thẻ trên bản vẽ để làm mới không?')) return;
    document.querySelectorAll('.canvas-card, .canvas-item, .user-image-wrapper').forEach(c => c.remove());
    syncStopsFromDOM();
    saveEditsToStorage();
    showToast('Đã dọn sạch toàn bộ các thẻ trên bản vẽ!');
    goToStop(0);
  }
  window.clearAllCards = clearAllCards;

  // ==========================================================================
  // AUTHENTIC PREZI SLIDE FRAME ENGINE (Chuẩn Hình 2: media_1790146335671.png)
  // 16:9 transparent boundary frame for slides on canvas
  // ==========================================================================
  function setupSlideFrameInteractions(frame) {
    if (!frame || frame.dataset.eventsBound) return;
    frame.dataset.eventsBound = 'true';

    let isResizing = false;
    let resizeType = '';
    let isDragging = false;
    let sX = 0, sY = 0;
    let iW = 0, iH = 0, iLeft = 0, iTop = 0;

    frame.querySelectorAll('.frame-handle').forEach(h => {
      h.addEventListener('mousedown', (e) => {
        if (frame.classList.contains('is-locked') || frame.getAttribute('data-locked') === 'true') return;
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        if (h.classList.contains('top-left')) resizeType = 'tl';
        else if (h.classList.contains('top-right')) resizeType = 'tr';
        else if (h.classList.contains('bottom-left')) resizeType = 'bl';
        else if (h.classList.contains('bottom-right')) resizeType = 'br';

        sX = e.clientX;
        sY = e.clientY;
        iW = frame.offsetWidth;
        iH = frame.offsetHeight;
        iLeft = frame.offsetLeft;
        iTop = frame.offsetTop;
      });
    });

    frame.addEventListener('mousedown', (e) => {
      if (e.target.closest('.frame-handle') || e.target.closest('.prezi-textbox') || e.target.closest('.user-image-wrapper') || e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;
      
      document.querySelectorAll('.canvas-slide-frame.selected, .canvas-empty-frame-box.selected, .canvas-card.card-selected, .prezi-textbox.selected, .user-image-wrapper.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
      frame.classList.add('selected');

      if (frame.classList.contains('is-locked') || frame.getAttribute('data-locked') === 'true') {
        // Locked: select frame but do not drag
        return;
      }
      
      isDragging = true;
      sX = e.clientX;
      sY = e.clientY;
      iLeft = frame.offsetLeft;
      iTop = frame.offsetTop;
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      const scale = currentCamera.scale || 1;
      if (isResizing) {
        const dx = (e.clientX - sX) / scale;
        const dy = (e.clientY - sY) / scale;
        let newW = iW, newH = iH, newLeft = iLeft, newTop = iTop;

        if (resizeType === 'br') {
          newW = Math.max(240, iW + dx);
          newH = Math.max(135, iH + dy);
        } else if (resizeType === 'bl') {
          newW = Math.max(240, iW - dx);
          newH = Math.max(135, iH + dy);
          newLeft = iLeft + (iW - newW);
        } else if (resizeType === 'tr') {
          newW = Math.max(240, iW + dx);
          newH = Math.max(135, iH - dy);
          newTop = iTop + (iH - newH);
        } else if (resizeType === 'tl') {
          newW = Math.max(240, iW - dx);
          newH = Math.max(135, iH - dy);
          newLeft = iLeft + (iW - newW);
          newTop = iTop + (iH - newH);
        }

        frame.style.width = `${Math.round(newW)}px`;
        frame.style.height = `${Math.round(newH)}px`;
        frame.style.left = `${Math.round(newLeft)}px`;
        frame.style.top = `${Math.round(newTop)}px`;
      } else if (isDragging) {
        const dx = (e.clientX - sX) / scale;
        const dy = (e.clientY - sY) / scale;
        frame.style.left = `${Math.round(iLeft + dx)}px`;
        frame.style.top = `${Math.round(iTop + dy)}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isResizing || isDragging) {
        isResizing = false;
        isDragging = false;
        saveEditsToStorage();
      }
    });

    frame.addEventListener('click', (e) => {
      if (e.target.closest('.prezi-textbox') || e.target.closest('.user-image-wrapper')) return;
      document.querySelectorAll('.canvas-slide-frame.selected, .canvas-card.card-selected, .prezi-textbox.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
      frame.classList.add('selected');
    });

    document.addEventListener('click', (e) => {
      if (!frame.contains(e.target) && !e.target.closest('.frame-thumb-item') && !e.target.closest('.prezi-context-menu') && !e.target.closest('#prezi-context-menu')) {
        frame.classList.remove('selected');
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!frame.contains(e.target) && !e.target.closest('.frame-thumb-item') && !e.target.closest('.prezi-floating-text-toolbar') && !e.target.closest('.prezi-context-menu') && !e.target.closest('#prezi-context-menu')) {
        frame.classList.remove('selected');
      }
    });
  }
  window.setupSlideFrameInteractions = setupSlideFrameInteractions;

  // Separate any overlapping frames that were placed directly on top of each other
  function separateOverlappingFrames() {
    const frames = Array.from(world.querySelectorAll('.canvas-slide-frame, .canvas-card, .canvas-item'))
      .filter(el => el.id !== 'overview-frame-box');
    for (let i = 1; i < frames.length; i++) {
      const prev = frames[i - 1];
      const curr = frames[i];
      if (Math.abs(curr.offsetLeft - prev.offsetLeft) < 50 && Math.abs(curr.offsetTop - prev.offsetTop) < 50) {
        const prevW = prev.offsetWidth || 860;
        curr.style.left = `${prev.offsetLeft + prevW + 200}px`;
      }
    }
  }
  window.separateOverlappingFrames = separateOverlappingFrames;

  // Add a brand new frame / slide (Chuẩn Prezi: Tự động xếp cạnh nhau theo hàng ngang)
  function addNewFrame() {
    separateOverlappingFrames();

    const existingFrames = Array.from(world.querySelectorAll('.canvas-slide-frame, .canvas-card, .canvas-item'))
      .filter(el => el.id !== 'overview-frame-box');

    const newIndex = STOPS.length;
    const newId = `frame-${newIndex < 10 ? '0' + newIndex : newIndex}-${Date.now()}`;

    const frameW = 860;
    const frameH = 484;

    const overviewBox = document.getElementById('overview-frame-box') || ensureOverviewFrameBox();
    const ovLeft = overviewBox ? overviewBox.offsetLeft : 1270;
    const ovTop = overviewBox ? overviewBox.offsetTop : 958;
    const ovWidth = overviewBox ? (overviewBox.offsetWidth || frameW) : frameW;

    let targetLeft, targetTop;
    if (existingFrames.length === 0) {
      targetLeft = Math.round(ovLeft + ovWidth + 240);
      targetTop = Math.round(ovTop);
    } else {
      // Find the furthest right frame to place the new frame neatly to its right
      let maxRight = ovLeft + ovWidth;
      let refTop = ovTop;
      existingFrames.forEach(f => {
        const r = f.offsetLeft + (f.offsetWidth || frameW);
        if (r > maxRight) {
          maxRight = r;
          refTop = f.offsetTop;
        }
      });
      targetLeft = Math.round(maxRight + 240);
      targetTop = Math.round(refTop);
    }

    // Deselect any previous selected items
    document.querySelectorAll('.canvas-slide-frame.selected, .canvas-empty-frame-box.selected, .canvas-card.card-selected').forEach(el => el.classList.remove('selected', 'card-selected'));

    const newFrame = document.createElement('div');
    newFrame.className = 'canvas-slide-frame selected';
    newFrame.id = newId;
    newFrame.style.left = `${targetLeft}px`;
    newFrame.style.top = `${targetTop}px`;
    newFrame.style.width = `${frameW}px`;
    newFrame.style.height = `${frameH}px`;
    newFrame.style.position = 'absolute';
    newFrame.style.zIndex = 5;

    newFrame.innerHTML = `
      <span class="frame-handle top-left"></span>
      <span class="frame-handle top-right"></span>
      <span class="frame-handle bottom-left"></span>
      <span class="frame-handle bottom-right"></span>
    `;

    world.appendChild(newFrame);

    ensureOverviewFrameBox();
    setupSlideFrameInteractions(newFrame);
    syncStopsFromDOM();

    goToStop(newIndex);
    showToast(`Đã thêm khung trình chiếu mới (Frame ${newIndex})`);
    saveEditsToStorage();
  }

  document.querySelectorAll('.btn-add-frame').forEach(btn => {
    btn.addEventListener('click', addNewFrame);
  });

  const btnClearAll = document.getElementById('btn-clear-all-cards');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', clearAllCards);
  }

  // Spacebar tracking for universal pan across infinite canvas
  let isSpacePressed = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.isContentEditable && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      isSpacePressed = true;
      if (!isPanning && viewport) viewport.style.cursor = 'grab';
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      if (!isPanning && viewport) {
        viewport.style.cursor = window.preziToolMode === 'pan' ? 'grab' : 'default';
      }
    }
  });

  // 5. Drag/Pan Canvas Engine
  function setupPanning() {
    viewport.addEventListener('mousedown', (e) => {
      // Pan is triggered if:
      // 1. Middle mouse button (e.button === 1)
      // 2. Spacebar held down with Left click (e.button === 0)
      // 3. User actively switched to Pan tool in bottom pill (window.preziToolMode === 'pan' && e.button === 0)
      const isMiddleClick = (e.button === 1);
      const isSpaceDrag = (isSpacePressed && e.button === 0);
      const isPanTool = (window.preziToolMode === 'pan' && e.button === 0);

      if (!isMiddleClick && !isSpaceDrag && !isPanTool) return;

      // Do NOT pan canvas when clicking inside editable text or controls
      if (
        e.target.isContentEditable ||
        e.target.closest('[contenteditable="true"]') ||
        e.target.closest('.card-resize-handle') ||
        e.target.closest('.frame-handle') ||
        e.target.closest('.nav-btn') ||
        e.target.closest('.nav-pill-btn') ||
        e.target.closest('.bottom-right-aux') ||
        e.target.closest('.prezi-floating-text-toolbar') ||
        e.target.closest('.prezi-floating-image-toolbar') ||
        e.target.closest('.prezi-context-menu') ||
        e.target.closest('.prezi-right-sidebar') ||
        e.target.closest('.prezi-topbar') ||
        e.target.closest('.prezi-sidebar') ||
        e.target.closest('.prezi-bottom-bar')
      ) return;

      isPanning = true;
      startX = e.clientX - currentCamera.x;
      startY = e.clientY - currentCamera.y;
      world.style.transition = 'none';
      viewport.style.cursor = 'grabbing';
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
        world.style.transition = 'transform 0.4s ease-out';
        viewport.style.cursor = (isSpacePressed || window.preziToolMode === 'pan') ? 'grab' : 'default';
      }
    });

    // Smooth Cursor-Centered Wheel Zoom (like Google Maps & Prezi)
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
      const oldScale = currentCamera.scale || 1;
      const newScale = Math.min(Math.max(oldScale * zoomFactor, 0.15), 3.2);

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const newX = mouseX - (mouseX - currentCamera.x) * (newScale / oldScale);
      const newY = mouseY - (mouseY - currentCamera.y) * (newScale / oldScale);

      applyCamera(newX, newY, newScale, false);
    }, { passive: false });
  }

  // 5.5 Marquee / Area Selection Engine (Bấm chuột trái để kéo vùng chọn trên canvas)
  function setupMarqueeSelection() {
    let isMarquee = false;
    let mStartX = 0, mStartY = 0;

    let marqueeBox = document.getElementById('prezi-marquee-box');
    if (!marqueeBox) {
      marqueeBox = document.createElement('div');
      marqueeBox.id = 'prezi-marquee-box';
      marqueeBox.className = 'marquee-selection-box';
      viewport.appendChild(marqueeBox);
    }

    viewport.addEventListener('mousedown', (e) => {
      if (document.body.classList.contains('in-present-mode')) return;

      // Chuột trái để kéo vùng chọn
      if (e.button !== 0) return;
      if (isSpacePressed) return; // Spacebar is used for panning
      if (window.preziToolMode === 'pan') return; // Pan tool is active

      // Do NOT start marquee when clicking directly on elements or controls
      if (
        e.target.isContentEditable ||
        e.target.closest('[contenteditable="true"]') ||
        e.target.closest('.canvas-card') ||
        e.target.closest('.canvas-item') ||
        e.target.closest('.canvas-slide-frame') ||
        e.target.closest('.canvas-empty-frame-box') ||
        e.target.closest('.prezi-textbox') ||
        e.target.closest('.textbox-content') ||
        e.target.closest('.user-image-wrapper') ||
        e.target.closest('.frame-handle') ||
        e.target.closest('.card-resize-handle') ||
        e.target.closest('.nav-btn') ||
        e.target.closest('.nav-pill-btn') ||
        e.target.closest('.prezi-floating-text-toolbar') ||
        e.target.closest('.prezi-floating-image-toolbar') ||
        e.target.closest('.prezi-context-menu') ||
        e.target.closest('.prezi-topbar') ||
        e.target.closest('.prezi-sidebar') ||
        e.target.closest('.prezi-bottom-bar') ||
        e.target.closest('.prezi-right-sidebar')
      ) {
        return;
      }

      isMarquee = true;
      mStartX = e.clientX;
      mStartY = e.clientY;
      const vpRect = viewport.getBoundingClientRect();

      // Clear previous selection unless Shift is held
      if (!e.shiftKey) {
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => c.classList.remove('card-selected'));
        document.querySelectorAll('.canvas-slide-frame.selected').forEach(f => f.classList.remove('selected'));
        document.querySelectorAll('.canvas-empty-frame-box.selected').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.prezi-textbox.selected').forEach(t => t.classList.remove('selected'));
        document.querySelectorAll('.user-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
      }

      const onMouseMove = (ev) => {
        if (!isMarquee) return;
        const curX = ev.clientX;
        const curY = ev.clientY;
        const l = Math.min(mStartX, curX);
        const t = Math.min(mStartY, curY);
        const w = Math.abs(curX - mStartX);
        const h = Math.abs(curY - mStartY);

        if (w > 3 || h > 3) {
          marqueeBox.style.display = 'block';
          marqueeBox.style.left = `${l - vpRect.left}px`;
          marqueeBox.style.top = `${t - vpRect.top}px`;
          marqueeBox.style.width = `${w}px`;
          marqueeBox.style.height = `${h}px`;

          const mBounds = { left: l, top: t, right: l + w, bottom: t + h };

          // Intersect with canvas cards, slide frames, textboxes, and user images
          const targets = world.querySelectorAll('.canvas-card, .canvas-slide-frame, .prezi-textbox, .user-image-wrapper');
          targets.forEach(el => {
            if (el.id === 'overview-frame-box') return;
            const r = el.getBoundingClientRect();
            const hit = !(r.right < mBounds.left || r.left > mBounds.right || r.bottom < mBounds.top || r.top > mBounds.bottom);
            if (el.classList.contains('canvas-card')) {
              el.classList.toggle('card-selected', hit);
            } else {
              el.classList.toggle('selected', hit);
            }
          });
        }
      };

      const onMouseUp = () => {
        if (isMarquee) {
          isMarquee = false;
          marqueeBox.style.display = 'none';
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // Layer ordering helpers
  function sendElementToBack(target) {
    if (!target) return;
    const parent = target.parentElement;
    if (!parent) return;

    if (parent.classList.contains('canvas-slide-frame') || parent.id === 'overview-frame-box') {
      const contentSiblings = Array.from(parent.children).filter(child =>
        child !== target && !child.classList.contains('frame-handle')
      );
      let minZ = 10;
      contentSiblings.forEach(s => {
        const z = parseInt(s.style.zIndex || window.getComputedStyle(s).zIndex, 10);
        if (!isNaN(z) && z < minZ) minZ = z;
      });
      target.style.zIndex = `${Math.max(1, minZ - 1)}`;
      if (contentSiblings.length > 0) {
        parent.insertBefore(target, contentSiblings[0]);
      }
    } else if (parent === world) {
      const canvasItems = Array.from(world.children).filter(child =>
        child !== target &&
        !child.classList.contains('bg-manuscript-layer') &&
        !child.classList.contains('bg-splash-layer') &&
        !child.classList.contains('bg-note-paper-layer') &&
        child.id !== 'prezi-spiral-svg' &&
        child.id !== 'canvas-grid'
      );
      let minZ = 10;
      canvasItems.forEach(s => {
        const z = parseInt(s.style.zIndex || window.getComputedStyle(s).zIndex, 10);
        if (!isNaN(z) && z < minZ) minZ = z;
      });
      target.style.zIndex = `${Math.max(2, minZ - 1)}`;
      if (canvasItems.length > 0) {
        world.insertBefore(target, canvasItems[0]);
      }
      if (target.classList.contains('canvas-slide-frame')) {
        syncStopsFromDOM();
      }
    } else {
      let minZ = 10;
      Array.from(parent.children).forEach(s => {
        if (s !== target) {
          const z = parseInt(s.style.zIndex || window.getComputedStyle(s).zIndex, 10);
          if (!isNaN(z) && z < minZ) minZ = z;
        }
      });
      target.style.zIndex = `${Math.max(1, minZ - 1)}`;
      parent.insertBefore(target, parent.firstElementChild);
    }

    saveEditsToStorage();
    showToast('Đã đưa mục xuống dưới cùng!');
  }
  window.sendElementToBack = sendElementToBack;

  function bringElementToFront(target) {
    if (!target) return;
    const parent = target.parentElement;
    if (!parent) return;

    if (parent.classList.contains('canvas-slide-frame') || parent.id === 'overview-frame-box') {
      const contentSiblings = Array.from(parent.children).filter(child =>
        child !== target && !child.classList.contains('frame-handle')
      );
      let maxZ = 10;
      contentSiblings.forEach(s => {
        const z = parseInt(s.style.zIndex || window.getComputedStyle(s).zIndex, 10);
        if (!isNaN(z) && z > maxZ) maxZ = z;
      });
      target.style.zIndex = `${maxZ + 1}`;
      parent.appendChild(target);
      parent.querySelectorAll('.frame-handle').forEach(h => parent.appendChild(h));
    } else if (parent === world) {
      let maxZ = 10;
      Array.from(world.children).forEach(s => {
        if (s !== target) {
          const z = parseInt(s.style.zIndex || window.getComputedStyle(s).zIndex, 10);
          if (!isNaN(z) && z > maxZ) maxZ = z;
        }
      });
      target.style.zIndex = `${maxZ + 1}`;
      world.appendChild(target);
      if (target.classList.contains('canvas-slide-frame')) {
        syncStopsFromDOM();
      }
    } else {
      let maxZ = 10;
      Array.from(parent.children).forEach(s => {
        if (s !== target) {
          const z = parseInt(s.style.zIndex || window.getComputedStyle(s).zIndex, 10);
          if (!isNaN(z) && z > maxZ) maxZ = z;
        }
      });
      target.style.zIndex = `${maxZ + 1}`;
      parent.appendChild(target);
    }

    saveEditsToStorage();
    showToast('Đã đưa mục lên trên cùng!');
  }
  window.bringElementToFront = bringElementToFront;

  // 5. Context Menu Engine
  function setupContextMenu() {
    let contextMenu = document.getElementById('prezi-context-menu');
    if (!contextMenu) {
      contextMenu = document.createElement('div');
      contextMenu.id = 'prezi-context-menu';
      contextMenu.className = 'prezi-context-menu';
      document.body.appendChild(contextMenu);
    }

    let currentContextMenuTarget = null;

    function hideContextMenu() {
      if (contextMenu) {
        contextMenu.style.display = 'none';
      }
    }

    // Close context menu on outside click or escape
    document.addEventListener('mousedown', (e) => {
      if (contextMenu && !contextMenu.contains(e.target)) {
        hideContextMenu();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideContextMenu();
      }
    });

    function openContextMenuHandler(e) {
      e.preventDefault();
      if (document.body.classList.contains('in-present-mode')) return;

      const clickX = e.clientX;
      const clickY = e.clientY;

      // Calculate canvas coordinates for inserting text / frame at click location
      const vpRect = viewport.getBoundingClientRect();
      const scale = currentCamera.scale || 1;
      const canvasX = (-currentCamera.x + (clickX - vpRect.left)) / scale;
      const canvasY = (-currentCamera.y + (clickY - vpRect.top)) / scale;

      // Check if right clicked on an element or in thumbnail list
      let targetElement = e.target.closest('.canvas-card, .canvas-slide-frame, .prezi-textbox, .user-image-wrapper, .canvas-item, .frame-thumb-item');
      if (!targetElement && e.target.tagName === 'IMG') {
        targetElement = e.target.closest('.user-image-wrapper') || e.target;
      }

      // If clicked thumbnail in sidebar, map to target slide frame
      if (targetElement && targetElement.classList.contains('frame-thumb-item')) {
        const targetId = targetElement.dataset.targetId || (window.STOPS && window.STOPS[parseInt(targetElement.dataset.index, 10)]?.targetId);
        if (targetId) {
          targetElement = document.getElementById(targetId) || targetElement;
        }
      }

      // If no target under cursor, check if there is an existing selected item
      if (!targetElement) {
        targetElement = document.querySelector('.canvas-slide-frame.selected, .prezi-textbox.selected, .user-image-wrapper.selected, .canvas-card.card-selected');
      }

      currentContextMenuTarget = targetElement;

      // Select targetElement so user sees blue focus border
      if (targetElement) {
        if (!targetElement.classList.contains('selected') && !targetElement.classList.contains('card-selected')) {
          document.querySelectorAll('.canvas-card.card-selected, .canvas-slide-frame.selected, .prezi-textbox.selected, .user-image-wrapper.selected').forEach(el => el.classList.remove('selected', 'card-selected'));
          if (targetElement.classList.contains('canvas-card')) {
            targetElement.classList.add('card-selected');
          } else if (targetElement.classList.contains('canvas-slide-frame') || targetElement.classList.contains('prezi-textbox') || targetElement.classList.contains('user-image-wrapper')) {
            targetElement.classList.add('selected');
          }
        }
      }

      const isSlideFrame = targetElement && targetElement.classList.contains('canvas-slide-frame') && targetElement.id !== 'overview-frame-box';

      if (targetElement) {
        // MENU CHO MỤC ĐANG CHỌN (Selected Item Menu)
        let frameReorderOptions = '';
        if (isSlideFrame) {
          frameReorderOptions = `
            <div class="ctx-divider"></div>
            <div class="ctx-item" data-action="move-last-slide">
              <span class="ctx-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/><line x1="5" y1="19" x2="19" y2="19"/></svg>
                <span>Chuyển xuống cuối thứ tự slide</span>
              </span>
            </div>
            <div class="ctx-item" data-action="move-first-slide">
              <span class="ctx-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/><line x1="5" y1="5" x2="19" y2="5"/></svg>
                <span>Chuyển lên đầu thứ tự slide</span>
              </span>
            </div>
          `;
        }

        contextMenu.innerHTML = `
          <div class="ctx-item" data-action="copy">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Sao chép</span>
            </span>
            <span class="ctx-shortcut">Ctrl+C</span>
          </div>
          <div class="ctx-item" data-action="cut">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
              <span>Cắt</span>
            </span>
            <span class="ctx-shortcut">Ctrl+X</span>
          </div>
          <div class="ctx-item" data-action="paste">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
              <span>Dán</span>
            </span>
            <span class="ctx-shortcut">Ctrl+V</span>
          </div>
          <div class="ctx-divider"></div>
          <div class="ctx-item" data-action="bring-front">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span>Đưa lên trên cùng (Bring to Front)</span>
            </span>
          </div>
          <div class="ctx-item" data-action="send-back">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>
              <span>Đưa xuống dưới cùng (Send to Back)</span>
            </span>
          </div>
          <div class="ctx-divider"></div>
          <div class="ctx-item" data-action="toggle-lock">
            <span class="ctx-left">
              ${(targetElement.classList.contains('is-locked') || targetElement.getAttribute('data-locked') === 'true') ? `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                <span>Mở khóa vị trí (Unlock)</span>
              ` : `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Khóa vị trí không cho di chuyển (Lock)</span>
              `}
            </span>
            <span class="ctx-shortcut">Ctrl+L</span>
          </div>
          ${frameReorderOptions}
          <div class="ctx-divider"></div>
          <div class="ctx-item" data-action="zoom-to">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              <span>Phóng to vào mục này</span>
            </span>
          </div>
          <div class="ctx-divider"></div>
          <div class="ctx-item danger" data-action="delete">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Xóa mục</span>
            </span>
            <span class="ctx-shortcut">Delete</span>
          </div>
        `;
      } else {
        // MENU CHO VÙNG TRỐNG (Empty Canvas Menu)
        contextMenu.innerHTML = `
          <div class="ctx-item" data-action="add-frame">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>Thêm khung slide mới (16:9)</span>
            </span>
          </div>
          <div class="ctx-item" data-action="add-text">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              <span>Thêm văn bản tại đây</span>
            </span>
          </div>
          <div class="ctx-item" data-action="add-image">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Chèn hình ảnh...</span>
            </span>
          </div>
          <div class="ctx-item" data-action="paste">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
              <span>Dán văn bản tại đây</span>
            </span>
            <span class="ctx-shortcut">Ctrl+V</span>
          </div>
          <div class="ctx-divider"></div>
          <div class="ctx-item" data-action="overview">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              <span>Xem toàn cảnh (Overview)</span>
            </span>
          </div>
          <div class="ctx-item" data-action="present">
            <span class="ctx-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Bắt đầu trình chiếu</span>
            </span>
            <span class="ctx-shortcut">Alt+P</span>
          </div>
        `;
      }

      // Position context menu safely within screen bounds
      contextMenu.style.display = 'block';
      const menuW = contextMenu.offsetWidth || 230;
      const menuH = contextMenu.offsetHeight || 280;
      const posX = Math.min(clickX, window.innerWidth - menuW - 12);
      const posY = Math.min(clickY, window.innerHeight - menuH - 12);
      contextMenu.style.left = `${posX}px`;
      contextMenu.style.top = `${posY}px`;

      // Attach click action handlers
      contextMenu.querySelectorAll('.ctx-item').forEach(item => {
        item.onclick = async () => {
          const action = item.dataset.action;
          const target = currentContextMenuTarget;
          hideContextMenu();

          if (action === 'add-frame') {
            addNewFrame();
          } else if (action === 'add-text') {
            const newId = `textbox-${Date.now()}`;
            const textBox = document.createElement('div');
            textBox.className = 'prezi-textbox selected';
            textBox.id = newId;
            textBox.style.left = `${Math.round(canvasX)}px`;
            textBox.style.top = `${Math.round(canvasY)}px`;
            textBox.innerHTML = `
              <div class="textbox-content" contenteditable="true" spellcheck="false">Click to edit text</div>
              <div class="box-handle tl"></div>
              <div class="box-handle tr"></div>
              <div class="box-handle bl"></div>
              <div class="box-handle br"></div>
            `;
            world.appendChild(textBox);
            setupTextBox(textBox);
            saveEditsToStorage();
            const content = textBox.querySelector('.textbox-content');
            if (content) {
              content.focus();
              document.execCommand('selectAll', false, null);
              selectedTextEl = content;
              if (typeof positionTextToolbar === 'function') positionTextToolbar(content);
            }
            showToast('Đã thêm hộp văn bản tại vị trí chuột!');
          } else if (action === 'add-image') {
            const fileInput = document.getElementById('file-input-image');
            if (fileInput) fileInput.click();
          } else if (action === 'paste') {
            try {
              if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                  const newId = `textbox-${Date.now()}`;
                  const textBox = document.createElement('div');
                  textBox.className = 'prezi-textbox selected';
                  textBox.id = newId;
                  textBox.style.left = `${Math.round(canvasX)}px`;
                  textBox.style.top = `${Math.round(canvasY)}px`;
                  const contentDiv = document.createElement('div');
                  contentDiv.className = 'textbox-content';
                  contentDiv.setAttribute('contenteditable', 'true');
                  contentDiv.setAttribute('spellcheck', 'false');
                  contentDiv.textContent = text.trim();
                  textBox.appendChild(contentDiv);
                  textBox.insertAdjacentHTML('beforeend', `
                    <div class="box-handle tl"></div>
                    <div class="box-handle tr"></div>
                    <div class="box-handle bl"></div>
                    <div class="box-handle br"></div>
                  `);
                  world.appendChild(textBox);
                  setupTextBox(textBox);
                  saveEditsToStorage();
                  showToast('Đã dán văn bản tại vị trí chuột!');
                  return;
                }
              }
            } catch(err) {}
            showToast('Mẹo: Nhấn Ctrl+V để dán trực tiếp từ bộ nhớ đệm!');
          } else if (action === 'overview') {
            goToStop(0);
          } else if (action === 'present') {
            const btnPresent = document.getElementById('btn-present');
            if (btnPresent) btnPresent.click();
          } else if (action === 'copy') {
            if (typeof copySelectedCanvasElement === 'function') {
              copySelectedCanvasElement();
            } else {
              const selEl = target || document.querySelector('.prezi-textbox.selected, .canvas-card.card-selected, .canvas-slide-frame.selected, .user-image-wrapper.selected');
              if (selEl) {
                const text = selEl.textContent.trim();
                if (navigator.clipboard && text) {
                  navigator.clipboard.writeText(text);
                }
                showToast('Đã sao chép vào bộ nhớ đệm!');
              }
            }
          } else if (action === 'cut') {
            const selEl = target || document.querySelector('.prezi-textbox.selected, .canvas-card.card-selected, .canvas-slide-frame.selected, .user-image-wrapper.selected');
            if (selEl) {
              pushUndoState();
              if (typeof copySelectedCanvasElement === 'function') copySelectedCanvasElement();
              selEl.remove();
              syncStopsFromDOM();
              saveEditsToStorage();
              showToast('Đã cắt mục đã chọn!');
            }
          } else if (action === 'delete') {
            pushUndoState();
            const allSelected = Array.from(document.querySelectorAll('.prezi-textbox.selected, .canvas-slide-frame.selected, .canvas-card.card-selected, .canvas-item.card-selected, .user-image-wrapper.selected')).filter(el => el.id !== 'overview-frame-box');
            if (allSelected.length > 0) {
              const c = allSelected.length;
              allSelected.forEach(el => el.remove());
              syncStopsFromDOM();
              saveEditsToStorage();
              showToast(c === 1 ? 'Đã xóa mục.' : `Đã xóa ${c} mục.`);
            } else if (target && target.id !== 'overview-frame-box') {
              target.remove();
              syncStopsFromDOM();
              saveEditsToStorage();
              showToast('Đã xóa mục.');
            }
          } else if (action === 'bring-front') {
            const active = target || document.querySelector('.prezi-textbox.selected, .canvas-slide-frame.selected, .canvas-card.card-selected, .user-image-wrapper.selected') || (selectedImgEl ? selectedImgEl.closest('.user-image-wrapper') : null);
            if (active) {
              pushUndoState();
              bringElementToFront(active);
            }
          } else if (action === 'send-back') {
            const active = target || document.querySelector('.prezi-textbox.selected, .canvas-slide-frame.selected, .canvas-card.card-selected, .user-image-wrapper.selected') || (selectedImgEl ? selectedImgEl.closest('.user-image-wrapper') : null);
            if (active) {
              pushUndoState();
              sendElementToBack(active);
            }
          } else if (action === 'toggle-lock') {
            const active = target || document.querySelector('.prezi-textbox.selected, .canvas-slide-frame.selected, .canvas-card.card-selected, .user-image-wrapper.selected') || (selectedImgEl ? selectedImgEl.closest('.user-image-wrapper') : null);
            if (active && typeof toggleElementLock === 'function') {
              toggleElementLock(active);
            }
          } else if (action === 'move-last-slide') {
            const frame = (target && target.classList.contains('canvas-slide-frame')) ? target : document.querySelector('.canvas-slide-frame.selected');
            if (frame && frame.id !== 'overview-frame-box') {
              world.appendChild(frame);
              syncStopsFromDOM();
              saveEditsToStorage();
              showToast('Đã chuyển Frame xuống cuối danh sách trình chiếu!');
            }
          } else if (action === 'move-first-slide') {
            const frame = (target && target.classList.contains('canvas-slide-frame')) ? target : document.querySelector('.canvas-slide-frame.selected');
            if (frame && frame.id !== 'overview-frame-box') {
              const firstFrame = Array.from(world.children).find(el =>
                el.classList.contains('canvas-slide-frame') && el.id !== 'overview-frame-box' && el !== frame
              );
              if (firstFrame) {
                world.insertBefore(frame, firstFrame);
              }
              syncStopsFromDOM();
              saveEditsToStorage();
              showToast('Đã chuyển Frame lên đầu danh sách trình chiếu!');
            }
          } else if (action === 'zoom-to') {
            const active = target || document.querySelector('.prezi-textbox.selected, .canvas-slide-frame.selected, .canvas-card.card-selected, .user-image-wrapper.selected');
            if (active) {
              const focus = getElementFocusTransform(active, 1.25);
              applyCamera(focus.x, focus.y, focus.scale, true);
            }
          }
        };
      });
    }

    viewport.addEventListener('contextmenu', openContextMenuHandler);
    if (framesList) {
      framesList.addEventListener('contextmenu', openContextMenuHandler);
    }
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
    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentStopIndex < STOPS.length - 1) goToStop(currentStopIndex + 1);
      });
    }

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentStopIndex > 0) goToStop(currentStopIndex - 1);
      });
    }

    const btnHome = document.getElementById('btn-home');
    if (btnHome) {
      btnHome.addEventListener('click', () => {
        if (currentStopIndex === 0) {
          const ov = getOverviewTransform();
          applyCamera(ov.x, ov.y, ov.scale, true);
        } else {
          goToStop(0);
        }
      });
    }

    const btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        const vpRect = viewport ? viewport.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const cx = vpRect.width / 2;
        const cy = vpRect.height / 2;
        const oldScale = currentCamera.scale || 1;
        const newScale = Math.min(oldScale * 1.25, 3.2);
        const newX = cx - (cx - currentCamera.x) * (newScale / oldScale);
        const newY = cy - (cy - currentCamera.y) * (newScale / oldScale);
        applyCamera(newX, newY, newScale, true);
      });
    }

    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        const vpRect = viewport ? viewport.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const cx = vpRect.width / 2;
        const cy = vpRect.height / 2;
        const oldScale = currentCamera.scale || 1;
        const newScale = Math.max(oldScale * 0.8, 0.15);
        const newX = cx - (cx - currentCamera.x) * (newScale / oldScale);
        const newY = cy - (cy - currentCamera.y) * (newScale / oldScale);
        applyCamera(newX, newY, newScale, true);
      });
    }

    const sidebar = document.getElementById('prezi-sidebar');
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        setTimeout(() => goToStop(currentStopIndex, true), 320);
      });
    }

    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        if (sidebar.classList.contains('collapsed')) {
          sidebar.classList.remove('collapsed');
          setTimeout(() => goToStop(currentStopIndex, true), 320);
        }
      });
    }

    const btnPresentMode = document.getElementById('btn-present-mode');
    if (btnPresentMode) {
      btnPresentMode.addEventListener('click', () => {
        document.body.classList.toggle('in-present-mode');
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        setTimeout(() => goToStop(currentStopIndex, true), 300);
      });
    }

    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Event listeners cho các nút tròn bên phải lúc trình chiếu (Hình 2)
    const btnPresentHome = document.getElementById('btn-present-home');
    if (btnPresentHome) {
      btnPresentHome.addEventListener('click', () => goToStop(0));
    }
    const btnPresentNext = document.getElementById('btn-present-next');
    if (btnPresentNext) {
      btnPresentNext.addEventListener('click', () => {
        if (currentStopIndex < STOPS.length - 1) goToStop(currentStopIndex + 1);
      });
    }
    const btnPresentPrev = document.getElementById('btn-present-prev');
    if (btnPresentPrev) {
      btnPresentPrev.addEventListener('click', () => {
        if (currentStopIndex > 0) goToStop(currentStopIndex - 1);
      });
    }
    const btnPresentExit = document.getElementById('btn-present-exit');
    if (btnPresentExit) {
      btnPresentExit.addEventListener('click', () => {
        document.body.classList.remove('in-present-mode');
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setTimeout(() => goToStop(currentStopIndex, true), 300);
      });
    }

    // Keyboard Shortcuts (with strict guard so typing in text boxes is never hijacked)
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isEditingText = (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) ||
                            (e.target && e.target.closest && (e.target.closest('[contenteditable="true"]') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'));

      // 1. Undo / Redo Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
          return;
        } else if (!isEditingText) {
          e.preventDefault();
          undo();
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        if (!isEditingText) {
          e.preventDefault();
          redo();
          return;
        }
      }

      // 2. Copy Shortcut (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (isEditingText) {
          const sel = window.getSelection();
          if (sel && sel.toString().length > 0) return; // let native text copy work
        }
        if (typeof copySelectedCanvasElement === 'function') {
          const copied = copySelectedCanvasElement();
          if (copied) {
            e.preventDefault();
            return;
          }
        }
      }

      // 3. Paste Shortcut for Canvas Elements (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        if (isEditingText) return; // let native text paste work inside input/contenteditable
        if (copiedCanvasData && typeof pasteCopiedCanvasElement === 'function') {
          e.preventDefault();
          pasteCopiedCanvasElement();
          return;
        }
      }

      // 4. Duplicate Shortcut (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (typeof duplicateSelectedElement === 'function') {
          duplicateSelectedElement();
        }
        return;
      }

      // 5. Lock / Unlock Shortcut (Ctrl+L)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        const selected = document.querySelector('.prezi-textbox.selected, .user-image-wrapper.selected, .canvas-card.card-selected, .canvas-slide-frame.selected') ||
                         (selectedImgEl ? selectedImgEl.closest('.user-image-wrapper') : null) ||
                         (selectedTextEl ? selectedTextEl.closest('.prezi-textbox') : null);
        if (selected && typeof toggleElementLock === 'function') {
          toggleElementLock(selected);
        } else {
          showToast('Hãy chọn một thành phần để Khóa / Mở khóa vị trí (Ctrl+L)');
        }
        return;
      }

      // 6. Select All (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        if (isEditingText) return;
        e.preventDefault();
        const allCards = document.querySelectorAll('.canvas-card, .canvas-item, .user-image-wrapper');
        allCards.forEach(c => c.classList.add('card-selected'));
        if (allCards.length > 0) {
          showToast(`Đã chọn tất cả ${allCards.length} thẻ trên bài thuyết trình (bấm Delete để xóa)!`);
        }
        return;
      }

      // If user is editing text inside contenteditable or input, do not hijack other keys
      if (isEditingText) {
        return;
      }

      // 6. Arrow Keys: Nudge selected element OR navigate slides
      const selectedCanvasEl = document.querySelector('.prezi-textbox.selected, .user-image-wrapper.selected, .canvas-card.card-selected, .canvas-slide-frame.selected');
      if (selectedCanvasEl && selectedCanvasEl.id !== 'overview-frame-box' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (typeof nudgeSelectedElement === 'function') {
          nudgeSelectedElement(e.key, e.shiftKey ? 10 : 2);
        }
        return;
      }

      // 7. Navigation shortcuts when NOT editing text and NO element is selected for nudging
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

    // --------------------------------------------------------------------------
    // Prezi Floating Bottom Pill & Modes (Pan vs Select)
    // --------------------------------------------------------------------------
    const btnPan = document.getElementById('btn-pan-tool');
    const btnSelect = document.getElementById('btn-select-tool');
    window.preziToolMode = 'select';

    if (btnPan && btnSelect) {
      btnPan.addEventListener('click', () => {
        window.preziToolMode = 'pan';
        btnPan.classList.add('active');
        btnSelect.classList.remove('active');
        viewport.style.cursor = 'grab';
        showToast('Chế độ Di chuyển (Pan: Kéo chuột để di chuyển canvas)');
      });
      btnSelect.addEventListener('click', () => {
        window.preziToolMode = 'select';
        btnSelect.classList.add('active');
        btnPan.classList.remove('active');
        viewport.style.cursor = 'crosshair';
        showToast('Chế độ Bôi vùng chọn (Select: Kéo chuột khoanh vùng để chọn nhiều đối tượng)');
      });
    }

    // --------------------------------------------------------------------------
    // Right Sidebar (Background Panel) Controls
    // --------------------------------------------------------------------------
    const btnToolStyle = document.getElementById('btn-tool-style');
    const rightSidebar = document.getElementById('prezi-right-sidebar');
    const btnCloseBg = document.getElementById('btn-close-bg-panel');
    const bgPreviewBox = document.getElementById('bg-preview-box');

    if (btnToolStyle && rightSidebar) {
      btnToolStyle.addEventListener('click', () => {
        rightSidebar.classList.toggle('collapsed');
        btnToolStyle.classList.toggle('active', !rightSidebar.classList.contains('collapsed'));
        setTimeout(() => goToStop(currentStopIndex, true), 150);
      });
    }
    if (btnCloseBg && rightSidebar) {
      btnCloseBg.addEventListener('click', () => {
        rightSidebar.classList.add('collapsed');
        if (btnToolStyle) btnToolStyle.classList.remove('active');
        setTimeout(() => goToStop(currentStopIndex, true), 150);
      });
    }

    // Fill Color
    const bgColorPicker = document.getElementById('bg-color-picker');
    if (bgColorPicker) {
      bgColorPicker.addEventListener('input', (e) => {
        const col = e.target.value;
        viewport.style.backgroundColor = col;
        if (bgPreviewBox) bgPreviewBox.style.backgroundColor = col;
      });
    }

    // Image Fit
    const selectImageFit = document.getElementById('select-image-fit');
    if (selectImageFit) {
      selectImageFit.addEventListener('change', (e) => {
        viewport.style.backgroundSize = e.target.value;
        if (bgPreviewBox) bgPreviewBox.style.backgroundSize = e.target.value;
      });
    }

    // Upload Background Image
    const inputBgImage = document.getElementById('input-bg-image');
    if (inputBgImage) {
      inputBgImage.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const url = evt.target.result;
          viewport.style.backgroundImage = `url("${url}")`;
          viewport.style.backgroundSize = selectImageFit ? selectImageFit.value : 'cover';
          viewport.style.backgroundPosition = 'center';
          if (bgPreviewBox) {
            bgPreviewBox.style.backgroundImage = `url("${url}")`;
          }
          showToast('Đã áp dụng ảnh nền!');
        };
        reader.readAsDataURL(file);
      });
    }

    // AI & Preset Backgrounds
    const presetTiles = document.querySelectorAll('.bg-preset-tile');
    presetTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        const bg = tile.dataset.bg;
        if (bg && bg !== 'none') {
          viewport.style.backgroundImage = `url("${bg}")`;
          viewport.style.backgroundSize = 'cover';
          viewport.style.backgroundPosition = 'center';
          if (bgPreviewBox) bgPreviewBox.style.backgroundImage = `url("${bg}")`;
        } else if (tile.style.background) {
          viewport.style.background = tile.style.background;
          if (bgPreviewBox) bgPreviewBox.style.background = tile.style.background;
        }
        showToast('Đã áp dụng hình nền.');
      });
    });

    // --------------------------------------------------------------------------
    // Top Bar Tools: Text, Media, Shape, Story block, Animation, More, Share
    // --------------------------------------------------------------------------
    const btnToolText = document.getElementById('btn-tool-text');
    if (btnToolText) {
      btnToolText.addEventListener('click', () => {
        const vpRect = viewport.getBoundingClientRect();
        const scale = currentCamera.scale || 1;
        const cx = (-currentCamera.x + vpRect.width / 2) / scale;
        const cy = (-currentCamera.y + vpRect.height / 2) / scale;

        const newId = `textbox-${Date.now()}`;
        const textBox = document.createElement('div');
        textBox.className = 'prezi-textbox selected';
        textBox.id = newId;
        textBox.style.left = `${Math.round(cx - 130)}px`;
        textBox.style.top = `${Math.round(cy - 25)}px`;
        textBox.innerHTML = `
          <div class="textbox-content" contenteditable="true" spellcheck="false">Click to edit text</div>
          <div class="box-handle tl"></div>
          <div class="box-handle tr"></div>
          <div class="box-handle bl"></div>
          <div class="box-handle br"></div>
        `;
        world.appendChild(textBox);
        setupTextBox(textBox);
        saveEditsToStorage();
        
        const content = textBox.querySelector('.textbox-content');
        if (content) {
          content.focus();
          document.execCommand('selectAll', false, null);
          selectedTextEl = content;
          if (typeof positionTextToolbar === 'function') {
            positionTextToolbar(content);
          }
        }
        showToast('Đã thêm hộp văn bản (Click to edit text)');
      });
    }


    const btnToolShape = document.getElementById('btn-tool-shape');
    if (btnToolShape) {
      btnToolShape.addEventListener('click', () => {
        const vpRect = viewport.getBoundingClientRect();
        const scale = currentCamera.scale || 1;
        const cx = (-currentCamera.x + vpRect.width / 2) / scale;
        const cy = (-currentCamera.y + vpRect.height / 2) / scale;

        const shapeBox = document.createElement('div');
        shapeBox.className = 'canvas-card custom-shape-box';
        shapeBox.style.left = `${Math.round(cx - 120)}px`;
        shapeBox.style.top = `${Math.round(cy - 120)}px`;
        shapeBox.style.width = '240px';
        shapeBox.style.height = '240px';
        shapeBox.style.borderRadius = '16px';
        shapeBox.style.border = '2px solid #2563eb';
        shapeBox.style.background = 'rgba(37, 99, 235, 0.05)';
        shapeBox.style.position = 'absolute';
        shapeBox.style.zIndex = '20';
        world.appendChild(shapeBox);
        setupCardInteractions();
        saveEditsToStorage();
        showToast('Đã chèn hình khối!');
      });
    }

    const btnToolStoryBlock = document.getElementById('btn-tool-story-block');
    if (btnToolStoryBlock) {
      btnToolStoryBlock.addEventListener('click', addNewFrame);
    }

    const btnToolAnim = document.getElementById('btn-tool-animation');
    if (btnToolAnim) {
      btnToolAnim.addEventListener('click', () => {
        showToast('Hiệu ứng chuyển động (Zoom in/out) được tự động kích hoạt khi di chuyển giữa các trạm!');
      });
    }

    const btnToolMore = document.getElementById('btn-tool-more');
    if (btnToolMore) {
      btnToolMore.addEventListener('click', () => {
        showToast('Tùy chọn mở rộng: Chèn biểu đồ, Icon, Bản đồ, Video.');
      });
    }

    const btnSharePres = document.getElementById('btn-share-presentation');
    if (btnSharePres) {
      btnSharePres.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          showToast('Đã sao chép link chia sẻ bài thuyết trình!');
        } else {
          showToast('Link chia sẻ: ' + window.location.href);
        }
      });
    }

    const btnShortcuts = document.getElementById('btn-aux-shortcuts');
    const btnHelp = document.getElementById('btn-aux-help');
    const showHelpModal = () => {
      alert("Phím tắt bài thuyết trình Prezi:\n\n• Ctrl + Z: Hoàn tác (Undo)\n• Ctrl + Y / Ctrl + Shift + Z: Làm lại (Redo)\n• Ctrl + C: Sao chép phần tử\n• Ctrl + V: Dán phần tử\n• Ctrl + D: Nhân bản nhanh\n• Ctrl + L: Khóa / Mở khóa vị trí phần tử\n• Phím mũi tên (↑ ↓ ← →): Vi chỉnh vị trí 2px (giữ Shift: 10px)\n• Delete / Backspace: Xóa phần tử đang chọn\n• Ctrl + A: Chọn tất cả các thẻ trên bản vẽ\n• Mũi tên Phải (→) / Spacebar: Sang trạm tiếp theo\n• Mũi tên Trái (←): Về trạm trước\n• Phím H / Escape: Toàn cảnh (Overview)\n• Cuộn chuột: Phóng to / Thu nhỏ mượt mà theo vị trí con trỏ\n• Giữ chuột trái & kéo: Di chuyển bản vẽ không gian");
    };
    if (btnShortcuts) btnShortcuts.addEventListener('click', showHelpModal);
    if (btnHelp) btnHelp.addEventListener('click', showHelpModal);

    window.addEventListener('resize', () => {
      goToStop(currentStopIndex, false);
    });
  }

  // ==========================================================================
  // 8. ADVANCED PREZI EDITING & IMAGE CLIPBOARD ENGINE (WITH INDEXEDDB)
  // Handles all image paste formats (Blob, HTML img, files), selection toolbars,
  // inline styling, and unlimited local persistence.
  // ==========================================================================
  let selectedTextEl = null;
  let selectedImgEl = null;

  // IndexedDB setup for storing high-res pasted images without size limit
  const DB_NAME = 'PreziCanvasDB';
  const DB_STORE = 'canvas_state';
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(DB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveToIndexedDB(key, val) {
    try {
      const db = await openDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(val, key);
      return new Promise(res => { tx.oncomplete = () => res(true); });
    } catch (e) {
      console.warn('IDB Save error', e);
      return false;
    }
  }

  async function loadFromIndexedDB(key) {
    try {
      const db = await openDB();
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(key);
      return new Promise(res => { req.onsuccess = () => res(req.result); });
    } catch (e) {
      console.warn('IDB Load error', e);
      return null;
    }
  }

  function showToast(message) {
    let toast = document.querySelector('.prezi-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'prezi-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // ==========================================================================
  // UNDO / REDO HISTORY ENGINE & CANVAS ELEMENT CLIPBOARD (CTRL+Z, CTRL+Y, CTRL+C, CTRL+V, CTRL+D)
  // ==========================================================================
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 40;
  let isApplyingHistory = false;
  let copiedCanvasData = null;

  function pushUndoState() {
    if (isApplyingHistory) return;
    try {
      const snapshot = {
        worldHTML: world.innerHTML,
        cardsLayout: localStorage.getItem('prezi_cards_layout_v2') || null,
        stopIndex: currentStopIndex,
        timestamp: Date.now()
      };
      undoStack.push(snapshot);
      if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
      }
      redoStack.length = 0;
      updateUndoRedoUI();
    } catch(err) {
      console.warn('pushUndoState error', err);
    }
  }
  window.pushUndoState = pushUndoState;

  function applyHistorySnapshot(snapshot) {
    if (!snapshot) return;
    isApplyingHistory = true;

    try {
      let cleanHTML = snapshot.worldHTML
        .replace(/\s*data-events-bound="[^"]*"/g, '')
        .replace(/\bselected\b/g, '')
        .replace(/\bcard-selected\b/g, '')
        .replace(/\bprezi-selected-img\b/g, '')
        .replace(/\bcurrent-active\b/g, '');

      world.innerHTML = cleanHTML;

      if (snapshot.cardsLayout) {
        try {
          localStorage.setItem('prezi_cards_layout_v2', snapshot.cardsLayout);
        } catch(e) {}
      }

      world.querySelectorAll('.prezi-textbox').forEach(setupTextBox);
      world.querySelectorAll('.canvas-slide-frame').forEach(setupSlideFrameInteractions);
      ensureOverviewFrameBox();
      setupCardInteractions();
      upgradeAllImagesToInteractive();
      restoreLockBadges();

      // Re-enable ContentEditable for all text elements
      const editableSelectors = [
        '.hero-title', '.hero-subtitle', '.card-title-prezi', '.card-title-large',
        '.card-body-text', '.p-item', '.cmp-box', '.s-cap', '.m-card',
        '.cycle-box p', '.cycle-box h5', '.cycle-box', '.cy-badge', '.lenin-quote-strip p', '.spiral-quote',
        '.img-caption-tag', '.card-micro-quote', '.card-step-badge', '.card-header-badge', '.axis-svg-label',
        '.principles-dual-list strong', '.cmp-box strong', '.s-cap strong',
        'h1', 'h2', 'h3', 'h4', 'h5', 'p'
      ];
      document.querySelectorAll(editableSelectors.join(',')).forEach(el => {
        if (!el.closest('.prezi-topbar') && !el.closest('.prezi-sidebar') && !el.closest('.prezi-bottom-bar') && !el.closest('.card-action-bar')) {
          el.setAttribute('contenteditable', 'true');
          el.setAttribute('spellcheck', 'false');
        }
      });

      syncStopsFromDOM();
      saveEditsToStorage();
      updateUndoRedoUI();
      if (typeof snapshot.stopIndex === 'number' && snapshot.stopIndex !== currentStopIndex) {
        goToStop(snapshot.stopIndex, true);
      }
    } catch(err) {
      console.warn('applyHistorySnapshot error', err);
    } finally {
      isApplyingHistory = false;
    }
  }

  function undo() {
    if (undoStack.length === 0) {
      showToast('Không còn thao tác nào để hoàn tác (Undo)!');
      return;
    }
    const currentSnapshot = {
      worldHTML: world.innerHTML,
      cardsLayout: localStorage.getItem('prezi_cards_layout_v2') || null,
      stopIndex: currentStopIndex,
      timestamp: Date.now()
    };
    redoStack.push(currentSnapshot);
    if (redoStack.length > MAX_HISTORY) redoStack.shift();

    const prevSnapshot = undoStack.pop();
    applyHistorySnapshot(prevSnapshot);
    showToast('↩ Đã hoàn tác thao tác vừa rồi (Ctrl+Z)');
  }
  window.undo = undo;

  function redo() {
    if (redoStack.length === 0) {
      showToast('Không còn thao tác nào để làm lại (Redo)!');
      return;
    }
    const currentSnapshot = {
      worldHTML: world.innerHTML,
      cardsLayout: localStorage.getItem('prezi_cards_layout_v2') || null,
      stopIndex: currentStopIndex,
      timestamp: Date.now()
    };
    undoStack.push(currentSnapshot);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();

    const nextSnapshot = redoStack.pop();
    applyHistorySnapshot(nextSnapshot);
    showToast('↪ Đã làm lại thao tác (Ctrl+Y)');
  }
  window.redo = redo;

  function updateUndoRedoUI() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
      btnUndo.style.opacity = undoStack.length > 0 ? '1' : '0.4';
      btnUndo.style.cursor = undoStack.length > 0 ? 'pointer' : 'default';
    }
    if (btnRedo) {
      btnRedo.style.opacity = redoStack.length > 0 ? '1' : '0.4';
      btnRedo.style.cursor = redoStack.length > 0 ? 'pointer' : 'default';
    }
  }

  function copySelectedCanvasElement() {
    const selectedEl = document.querySelector('.prezi-textbox.selected, .user-image-wrapper.selected, .canvas-card.card-selected, .canvas-item.card-selected, .canvas-slide-frame.selected');
    if (!selectedEl || selectedEl.id === 'overview-frame-box') return false;

    if (selectedEl.classList.contains('prezi-textbox')) {
      const content = selectedEl.querySelector('.textbox-content');
      copiedCanvasData = {
        type: 'textbox',
        html: selectedEl.outerHTML,
        text: content ? content.innerText : '',
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight
      };
      if (navigator.clipboard && copiedCanvasData.text) {
        navigator.clipboard.writeText(copiedCanvasData.text).catch(() => {});
      }
    } else if (selectedEl.classList.contains('user-image-wrapper')) {
      const img = selectedEl.querySelector('img');
      copiedCanvasData = {
        type: 'image',
        html: selectedEl.outerHTML,
        src: img ? img.src : '',
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight
      };
    } else if (selectedEl.classList.contains('canvas-card') || selectedEl.classList.contains('canvas-item')) {
      copiedCanvasData = {
        type: 'card',
        html: selectedEl.outerHTML,
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight
      };
    } else if (selectedEl.classList.contains('canvas-slide-frame')) {
      copiedCanvasData = {
        type: 'frame',
        html: selectedEl.outerHTML,
        width: selectedEl.offsetWidth,
        height: selectedEl.offsetHeight
      };
    }

    showToast('📋 Đã sao chép (Ctrl+C). Bấm Ctrl+V để dán!');
    return true;
  }

  function pasteCopiedCanvasElement() {
    if (!copiedCanvasData) return false;
    pushUndoState();

    const temp = document.createElement('div');
    temp.innerHTML = copiedCanvasData.html.trim();
    const clone = temp.firstElementChild;
    if (!clone) return false;

    const newId = `${copiedCanvasData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    clone.id = newId;

    const curLeft = parseFloat(clone.style.left) || 200;
    const curTop = parseFloat(clone.style.top) || 200;
    clone.style.left = `${Math.round(curLeft + 30)}px`;
    clone.style.top = `${Math.round(curTop + 30)}px`;

    document.querySelectorAll('.selected, .card-selected, .prezi-selected-img').forEach(el => el.classList.remove('selected', 'card-selected', 'prezi-selected-img'));

    const activeFrame = document.querySelector('.canvas-slide-frame.selected') || 
                        (currentStopIndex > 0 && STOPS[currentStopIndex]?.targetId ? document.getElementById(STOPS[currentStopIndex].targetId) : null);

    if (activeFrame && activeFrame.id !== 'overview-frame-box' && copiedCanvasData.type !== 'frame') {
      activeFrame.appendChild(clone);
    } else {
      world.appendChild(clone);
    }

    if (copiedCanvasData.type === 'textbox') {
      clone.classList.add('selected');
      setupTextBox(clone);
      const content = clone.querySelector('.textbox-content');
      if (content) {
        selectedTextEl = content;
        positionTextToolbar(content);
      }
    } else if (copiedCanvasData.type === 'image') {
      clone.classList.add('selected');
      const img = clone.querySelector('img');
      const resizeHandle = clone.querySelector('.img-resize-handle');
      const btnDel = clone.querySelector('.btn-del-img');
      clone.dataset.eventsBound = 'true';
      attachImageWrapperEvents(clone, img, resizeHandle, btnDel);
      if (img) {
        selectedImgEl = img;
      }
      positionImageToolbar(clone);
    } else if (copiedCanvasData.type === 'frame') {
      clone.classList.add('selected');
      setupSlideFrameInteractions(clone);
      syncStopsFromDOM();
    } else {
      clone.classList.add('card-selected');
      setupCardInteractions();
    }

    saveEditsToStorage();
    showToast('📋 Đã dán mục mới (Ctrl+V)!');
    return true;
  }

  function duplicateSelectedElement() {
    if (copySelectedCanvasElement()) {
      pasteCopiedCanvasElement();
    }
  }

  function nudgeSelectedElement(key, step = 2) {
    const selectedEl = document.querySelector('.prezi-textbox.selected, .user-image-wrapper.selected, .canvas-card.card-selected, .canvas-slide-frame.selected');
    if (!selectedEl || selectedEl.id === 'overview-frame-box') return false;

    if (selectedEl.classList.contains('is-locked') || selectedEl.getAttribute('data-locked') === 'true') {
      showToast('🔒 Phần tử đang bị khóa vị trí. Bấm Ctrl+L hoặc nút 🔓 Mở khóa để di chuyển!');
      return false;
    }

    pushUndoState();
    let left = parseFloat(selectedEl.style.left) || selectedEl.offsetLeft || 0;
    let top = parseFloat(selectedEl.style.top) || selectedEl.offsetTop || 0;

    if (key === 'ArrowUp') top -= step;
    else if (key === 'ArrowDown') top += step;
    else if (key === 'ArrowLeft') left -= step;
    else if (key === 'ArrowRight') left += step;

    selectedEl.style.left = `${Math.round(left)}px`;
    selectedEl.style.top = `${Math.round(top)}px`;

    if (selectedEl.classList.contains('prezi-textbox')) {
      const content = selectedEl.querySelector('.textbox-content');
      if (content) positionTextToolbar(content);
    } else if (selectedEl.classList.contains('user-image-wrapper')) {
      positionImageToolbar(selectedEl);
    }

    saveEditsToStorage();
    return true;
  }

  // ==========================================================================
  // ELEMENT LOCKING ENGINE (Khóa thành phần không cho di chuyển / kéo giãn)
  // ==========================================================================
  function toggleElementLock(element) {
    if (!element || element.id === 'overview-frame-box') return;
    pushUndoState();

    const isLocked = element.classList.contains('is-locked') || element.getAttribute('data-locked') === 'true';
    if (isLocked) {
      element.classList.remove('is-locked');
      element.removeAttribute('data-locked');
      const badge = element.querySelector('.element-lock-badge');
      if (badge) badge.remove();
      updateLockToolbarButtons(element);
      saveEditsToStorage();
      showToast('🔓 Đã mở khóa thành phần (cho phép di chuyển & kéo giãn)!');
    } else {
      element.classList.add('is-locked');
      element.setAttribute('data-locked', 'true');
      let badge = element.querySelector('.element-lock-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'element-lock-badge';
        badge.innerHTML = '🔒';
        badge.title = 'Thành phần đã bị khóa vị trí. Bấm để mở khóa!';
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleElementLock(element);
        });
        element.appendChild(badge);
      }
      updateLockToolbarButtons(element);
      saveEditsToStorage();
      showToast('🔒 Đã khóa vị trí thành phần (không thể di chuyển hay kéo giãn)!');
    }
  }
  window.toggleElementLock = toggleElementLock;

  function updateLockToolbarButtons(element) {
    if (!element) return;
    const isLocked = element.classList.contains('is-locked') || element.getAttribute('data-locked') === 'true';
    const btnTextLock = document.getElementById('btn-text-lock');
    const btnImgLock = document.getElementById('btn-img-lock');

    if (btnTextLock) {
      btnTextLock.innerHTML = isLocked ? '🔓 Mở khóa' : '🔒 Khóa';
      btnTextLock.classList.toggle('active', !!isLocked);
      btnTextLock.title = isLocked ? 'Mở khóa vị trí để di chuyển (Ctrl+L)' : 'Khóa vị trí không cho di chuyển (Ctrl+L)';
    }
    if (btnImgLock) {
      btnImgLock.innerHTML = isLocked ? '🔓 Mở khóa' : '🔒 Khóa';
      btnImgLock.classList.toggle('active', !!isLocked);
      btnImgLock.title = isLocked ? 'Mở khóa vị trí để di chuyển (Ctrl+L)' : 'Khóa vị trí không cho di chuyển (Ctrl+L)';
    }
  }

  function restoreLockBadges() {
    world.querySelectorAll('.is-locked, [data-locked="true"]').forEach(el => {
      el.classList.add('is-locked');
      el.setAttribute('data-locked', 'true');
      let badge = el.querySelector('.element-lock-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'element-lock-badge';
        badge.innerHTML = '🔒';
        badge.title = 'Thành phần đã bị khóa vị trí. Bấm để mở khóa!';
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleElementLock(el);
        });
        el.appendChild(badge);
      }
    });
  }

  // ==========================================================================
  // AUTHENTIC PREZI FLOATING TEXT BOX ENGINE (Chuẩn Hình 1)
  // Transparent background, blue bounding frame, 4 corner handles, drag & delete
  // ==========================================================================
  function setupTextBox(textBox) {
    if (!textBox) return;

    // Ensure all 6 handles exist: tl, tr, bl, br, ml, mr
    ['tl', 'tr', 'bl', 'br', 'ml', 'mr'].forEach(pos => {
      let h = textBox.querySelector(`.box-handle.${pos}`);
      if (!h) {
        h = document.createElement('div');
        h.className = `box-handle ${pos}`;
        textBox.appendChild(h);
      }
    });

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    // --- HANDLE RESIZING LOGIC (Thu nhỏ / nới rộng khung chữ) ---
    textBox.querySelectorAll('.box-handle').forEach(handle => {
      if (handle.dataset.handleBound) return;
      handle.dataset.handleBound = 'true';

      handle.addEventListener('mousedown', (e) => {
        if (textBox.classList.contains('is-locked') || textBox.getAttribute('data-locked') === 'true') {
          showToast('🔒 Hộp chữ đang bị khóa. Bấm Ctrl+L hoặc 🔓 Mở khóa để thay đổi kích thước!');
          return;
        }
        e.stopPropagation();
        e.preventDefault();

        // Select this textbox
        document.querySelectorAll('.prezi-textbox.selected').forEach(el => {
          if (el !== textBox) el.classList.remove('selected');
        });
        textBox.classList.add('selected');
        const content = textBox.querySelector('.textbox-content');
        selectedTextEl = content;
        if (typeof positionTextToolbar === 'function' && content) {
          positionTextToolbar(content);
        }

        pushUndoState();

        const handleType = ['tl', 'tr', 'bl', 'br', 'ml', 'mr'].find(c => handle.classList.contains(c)) || 'mr';
        const sX = e.clientX;
        const sY = e.clientY;
        const origW = textBox.offsetWidth;
        const origH = textBox.offsetHeight;
        const origL = parseFloat(textBox.style.left) || textBox.offsetLeft || 0;
        const origT = parseFloat(textBox.style.top) || textBox.offsetTop || 0;

        const onResizeMouseMove = (ev) => {
          const scale = currentCamera.scale || 1;
          const dx = (ev.clientX - sX) / scale;
          const dy = (ev.clientY - sY) / scale;

          let newW = origW;
          let newL = origL;
          let newT = origT;

          // Horizontal resize
          if (handleType === 'mr' || handleType === 'br' || handleType === 'tr') {
            newW = Math.max(100, origW + dx);
          } else if (handleType === 'ml' || handleType === 'bl' || handleType === 'tl') {
            newW = Math.max(100, origW - dx);
            newL = origL + (origW - newW);
          }

          // Vertical position shift for top handles
          if (handleType === 'tl' || handleType === 'tr') {
            newT = origT + dy;
            textBox.style.top = `${Math.round(newT)}px`;
          }

          textBox.style.width = `${Math.round(newW)}px`;
          textBox.style.left = `${Math.round(newL)}px`;

          if (typeof positionTextToolbar === 'function' && content) {
            positionTextToolbar(content);
          }
        };

        const onResizeMouseUp = () => {
          window.removeEventListener('mousemove', onResizeMouseMove);
          window.removeEventListener('mouseup', onResizeMouseUp);
          saveEditsToStorage();
        };

        window.addEventListener('mousemove', onResizeMouseMove);
        window.addEventListener('mouseup', onResizeMouseUp);
      });
    });

    textBox.addEventListener('mousedown', (e) => {
      // 1. If user clicked on a resize handle, DO NOT start moving the box:
      if (e.target.closest('.box-handle')) return;

      const isInsideContent = e.target.classList.contains('textbox-content') || e.target.isContentEditable || e.target.closest('.textbox-content') || e.target.closest('[contenteditable="true"]');

      document.querySelectorAll('.prezi-textbox.selected').forEach(el => {
        if (el !== textBox) el.classList.remove('selected');
      });
      textBox.classList.add('selected');
      const content = textBox.querySelector('.textbox-content');
      selectedTextEl = e.target.closest('[contenteditable="true"]') || content;
      if (typeof positionTextToolbar === 'function' && selectedTextEl) {
        positionTextToolbar(selectedTextEl);
      }

      // If user clicked inside the text content to edit or highlight text:
      if (isInsideContent && !e.altKey) {
        // Stop propagation so viewport panning does not steal the mouse drag!
        e.stopPropagation();
        // Allow native cursor and drag-to-highlight (bôi đen chữ)!
        return;
      }

      // User clicked border/handle or pressed Alt to move the textbox
      if (textBox.classList.contains('is-locked') || textBox.getAttribute('data-locked') === 'true') {
        // Textbox is locked: cannot be moved
        return;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(textBox.style.left) || textBox.offsetLeft;
      origTop = parseFloat(textBox.style.top) || textBox.offsetTop;
      e.stopPropagation();

      const onMouseMove = (ev) => {
        if (!isDragging) return;
        const scale = currentCamera.scale || 1;
        const dx = (ev.clientX - startX) / scale;
        const dy = (ev.clientY - startY) / scale;
        textBox.style.left = `${Math.round(origLeft + dx)}px`;
        textBox.style.top = `${Math.round(origTop + dy)}px`;
        if (typeof positionTextToolbar === 'function' && content) {
          positionTextToolbar(content);
        }
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          saveEditsToStorage();
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    const content = textBox.querySelector('.textbox-content');
    if (content) {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.prezi-textbox.selected').forEach(el => {
          if (el !== textBox) el.classList.remove('selected');
        });
        textBox.classList.add('selected');
        selectedTextEl = e.target.closest('[contenteditable="true"]') || content;
        if (typeof positionTextToolbar === 'function') {
          positionTextToolbar(selectedTextEl);
        }
      });

      content.addEventListener('focus', (e) => {
        document.querySelectorAll('.prezi-textbox.selected').forEach(el => {
          if (el !== textBox) el.classList.remove('selected');
        });
        textBox.classList.add('selected');
        selectedTextEl = e.target.closest('[contenteditable="true"]') || content;
        if (typeof positionTextToolbar === 'function') {
          positionTextToolbar(selectedTextEl);
        }
      });

      content.addEventListener('input', () => {
        saveEditsToStorage();
        if (typeof positionTextToolbar === 'function') {
          positionTextToolbar(selectedTextEl || content);
        }
      });

      content.addEventListener('blur', () => {
        saveEditsToStorage();
      });
    }
  }
  window.setupTextBox = setupTextBox;

  function setupEditingEngine() {
    const saveIndicator = document.getElementById('save-status-indicator');
    const textToolbar = document.getElementById('text-floating-toolbar');
    const imgToolbar = document.getElementById('image-floating-toolbar');

    // Make ALL text elements across cards editable
    const editableSelectors = [
      '.hero-title', '.hero-subtitle', '.card-title-prezi', '.card-title-large',
      '.card-body-text', '.p-item', '.cmp-box', '.s-cap', '.m-card',
      '.cycle-box p', '.cycle-box h5', '.cycle-box', '.cy-badge', '.lenin-quote-strip p', '.spiral-quote',
      '.img-caption-tag', '.card-micro-quote', '.card-step-badge', '.card-header-badge', '.axis-svg-label',
      '.principles-dual-list strong', '.cmp-box strong', '.s-cap strong',
      'h1', 'h2', 'h3', 'h4', 'h5', 'p'
    ];

    function makeElementEditable(el) {
      if (el.closest('.prezi-topbar') || el.closest('.prezi-sidebar') || el.closest('.prezi-bottom-bar') || el.closest('.prezi-floating-text-toolbar') || el.closest('.prezi-floating-image-toolbar') || el.closest('.card-action-bar')) return;
      
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTextEl = el;
        document.querySelectorAll('.prezi-selected-el').forEach(item => item.classList.remove('prezi-selected-el'));
        el.classList.add('prezi-selected-el');
        positionTextToolbar(el);
      });

      el.addEventListener('focus', () => {
        selectedTextEl = el;
        document.querySelectorAll('.prezi-selected-el').forEach(e => e.classList.remove('prezi-selected-el'));
        el.classList.add('prezi-selected-el');
        positionTextToolbar(el);
      });

      el.addEventListener('input', () => {
        if (saveIndicator) {
          saveIndicator.textContent = 'Đang chỉnh sửa...';
          saveIndicator.className = 'save-status-indicator saving';
        }
      });

      el.addEventListener('blur', () => {
        saveEditsToStorage();
      });
    }

    document.querySelectorAll(editableSelectors.join(',')).forEach(makeElementEditable);

    // Universal Click-Outside Deselection Engine (Xóa viền xung quanh khi click ra ngoài)
    document.addEventListener('mousedown', (e) => {
      // 0. If clicking inside toolbars, action buttons, context menu, or resize handles, ignore
      if (
        e.target.closest('#text-floating-toolbar') ||
        e.target.closest('#image-floating-toolbar') ||
        e.target.closest('#prezi-context-menu') ||
        e.target.closest('.prezi-context-menu') ||
        e.target.closest('#btn-tool-text') ||
        e.target.closest('#btn-select-tool') ||
        e.target.closest('#btn-pan-tool') ||
        e.target.closest('.card-resize-handle') ||
        e.target.closest('.frame-handle') ||
        e.target.closest('.card-action-bar')
      ) {
        return;
      }

      // 1. Textbox deselection: If click is NOT inside a .prezi-textbox
      const clickedTextBox = e.target.closest('.prezi-textbox');
      if (!clickedTextBox) {
        document.querySelectorAll('.prezi-textbox.selected').forEach(box => {
          box.classList.remove('selected');
          const content = box.querySelector('.textbox-content');
          if (content && (document.activeElement === content || content.contains(document.activeElement))) {
            content.blur();
          }
        });
      } else {
        document.querySelectorAll('.prezi-textbox.selected').forEach(box => {
          if (box !== clickedTextBox) {
            box.classList.remove('selected');
            const content = box.querySelector('.textbox-content');
            if (content && document.activeElement === content) {
              content.blur();
            }
          }
        });
      }

      // 2. Editable text deselection: If click is NOT inside contenteditable text
      if (!e.target.isContentEditable && !e.target.closest('[contenteditable="true"]')) {
        document.querySelectorAll('.prezi-selected-el').forEach(el => el.classList.remove('prezi-selected-el'));
        selectedTextEl = null;
        if (document.activeElement && document.activeElement.isContentEditable) {
          document.activeElement.blur();
        }
        if (textToolbar && !clickedTextBox) {
          textToolbar.classList.remove('show');
        }
      }

      // 3. Slide Frame deselection: If click is NOT inside a .canvas-slide-frame
      const clickedFrame = e.target.closest('.canvas-slide-frame');
      if (!clickedFrame && !e.target.closest('.frame-handle')) {
        document.querySelectorAll('.canvas-slide-frame.selected').forEach(f => f.classList.remove('selected'));
      } else if (clickedFrame) {
        document.querySelectorAll('.canvas-slide-frame.selected').forEach(f => {
          if (f !== clickedFrame) f.classList.remove('selected');
        });
      }

      // 4. Card deselection: If click is NOT inside a .canvas-card
      const clickedCard = e.target.closest('.canvas-card, .canvas-item');
      if (!clickedCard && !e.target.closest('.card-resize-handle')) {
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => c.classList.remove('card-selected'));
      } else if (clickedCard) {
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => {
          if (c !== clickedCard) c.classList.remove('card-selected');
        });
      }

      // 5. Image deselection: If click is NOT on an image
      const clickedImg = e.target.closest('.user-image-wrapper') || e.target.classList.contains('card-portrait-img') || e.target.classList.contains('user-placed-image');
      if (!clickedImg) {
        document.querySelectorAll('.user-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
        document.querySelectorAll('.prezi-selected-img').forEach(i => i.classList.remove('prezi-selected-img'));
        selectedImgEl = null;
        if (imgToolbar) imgToolbar.classList.remove('show');
      }
    });

    // Auto-position text toolbar when text is highlighted / selected
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const active = document.activeElement;
        if (active && (active.isContentEditable || active.closest('[contenteditable="true"]'))) {
          selectedTextEl = active;
          if (typeof positionTextToolbar === 'function') {
            positionTextToolbar(active);
          }
        }
      }
    });

    // Positioning Floating Text Toolbar (Chuẩn Pill Hình 1)
    function positionTextToolbar(targetEl) {
      if (!textToolbar || document.body.classList.contains('in-present-mode')) return;
      const rect = targetEl.getBoundingClientRect();
      const tbWidth = textToolbar.offsetWidth || 560;
      const leftPos = Math.max(16, Math.min(window.innerWidth - tbWidth - 16, rect.left + rect.width / 2 - tbWidth / 2));
      const topPos = Math.max(rect.top - 54, 62);
      textToolbar.style.top = `${topPos}px`;
      textToolbar.style.left = `${leftPos}px`;
      textToolbar.classList.add('show');
      if (typeof updateLockToolbarButtons === 'function') {
        updateLockToolbarButtons(targetEl ? (targetEl.closest('.prezi-textbox') || targetEl) : null);
      }
    }
    window.positionTextToolbar = positionTextToolbar;

    // Positioning Floating Image Toolbar (Hình 1)
    function positionImageToolbar(targetEl) {
      if (!imgToolbar || document.body.classList.contains('in-present-mode')) return;
      const rect = targetEl.getBoundingClientRect();
      const tbHeight = imgToolbar.offsetHeight || 44;
      const tbWidth = imgToolbar.offsetWidth || 440;

      // Smart clearance: if less than 65px above image (topbar clearance), place BELOW the image
      let topPos = rect.top - tbHeight - 14;
      if (topPos < 65) {
        topPos = rect.bottom + 14;
      }

      // Center horizontally on the image
      let leftPos = rect.left + rect.width / 2 - tbWidth / 2;
      leftPos = Math.max(250, Math.min(window.innerWidth - tbWidth - 16, leftPos));

      imgToolbar.style.top = `${Math.round(topPos)}px`;
      imgToolbar.style.left = `${Math.round(leftPos)}px`;
      imgToolbar.classList.add('show');
      if (typeof updateLockToolbarButtons === 'function') {
        updateLockToolbarButtons(targetEl ? (targetEl.closest('.user-image-wrapper') || targetEl) : null);
      }
    }
    window.positionImageToolbar = positionImageToolbar;

    upgradeAllImagesToInteractive();

    // Floating Text Toolbar Actions (Chuẩn Hình 1)
    const btnAskAi = document.getElementById('btn-ask-ai');
    if (btnAskAi) {
      btnAskAi.addEventListener('click', () => {
        if (selectedTextEl) {
          const cur = selectedTextEl.textContent.trim();
          showToast('✨ Ask AI: Đang trau chuốt và tối ưu văn bản...');
          setTimeout(() => {
            if (cur === 'Click to edit text' || cur === 'Nhập văn bản mới...' || !cur) {
              selectedTextEl.textContent = 'Quan điểm toàn diện và lịch sử - cụ thể trong Triết học';
            } else {
              selectedTextEl.textContent = cur + ' (Đã tối ưu chuẩn phong cách học thuật)';
            }
            saveEditsToStorage();
            showToast('✨ Ask AI: Đã hoàn thiện văn bản!');
          }, 600);
        }
      });
    }

    const tagSelect = document.getElementById('text-tag-select');
    if (tagSelect) {
      tagSelect.addEventListener('change', (e) => {
        if (selectedTextEl) {
          const val = e.target.value;
          if (val === 'h1') {
            selectedTextEl.style.fontSize = '36px';
            selectedTextEl.style.fontWeight = '700';
            const sizeLabel = document.getElementById('fl-font-size');
            if (sizeLabel) sizeLabel.textContent = '36';
          } else if (val === 'h2') {
            selectedTextEl.style.fontSize = '28px';
            selectedTextEl.style.fontWeight = '600';
            const sizeLabel = document.getElementById('fl-font-size');
            if (sizeLabel) sizeLabel.textContent = '28';
          } else {
            selectedTextEl.style.fontSize = '22px';
            selectedTextEl.style.fontWeight = '400';
            const sizeLabel = document.getElementById('fl-font-size');
            if (sizeLabel) sizeLabel.textContent = '22';
          }
          saveEditsToStorage();
        }
      });
    }

    const btnBold = document.getElementById('btn-format-bold');
    if (btnBold) btnBold.addEventListener('click', () => { document.execCommand('bold', false, null); saveEditsToStorage(); });
    
    const btnItalic = document.getElementById('btn-format-italic');
    if (btnItalic) btnItalic.addEventListener('click', () => { document.execCommand('italic', false, null); saveEditsToStorage(); });

    const fontSelect = document.getElementById('text-font-select');
    if (fontSelect) fontSelect.addEventListener('change', (e) => {
      if (selectedTextEl) {
        selectedTextEl.style.fontFamily = e.target.value;
        saveEditsToStorage();
      }
    });

    const colorPicker = document.getElementById('text-color-picker');
    if (colorPicker) colorPicker.addEventListener('input', (e) => {
      if (selectedTextEl) {
        selectedTextEl.style.color = e.target.value;
        saveEditsToStorage();
      }
    });

    const textBgPicker = document.getElementById('text-bg-picker');
    if (textBgPicker) textBgPicker.addEventListener('input', (e) => {
      if (selectedTextEl) {
        selectedTextEl.style.backgroundColor = e.target.value;
        saveEditsToStorage();
      }
    });

    const btnFontInc = document.getElementById('btn-font-inc');
    if (btnFontInc) btnFontInc.addEventListener('click', () => {
      if (selectedTextEl) {
        if (selectedTextEl.classList.contains('textbox-content')) {
          const children = selectedTextEl.querySelectorAll('h1, h2, h3, h4, h5, p, span, div');
          if (children.length > 0) {
            children.forEach(ch => {
              const curChild = parseInt(window.getComputedStyle(ch).fontSize) || 16;
              ch.style.fontSize = `${curChild + 2}px`;
            });
          }
        }
        const cur = parseInt(window.getComputedStyle(selectedTextEl).fontSize) || 26;
        selectedTextEl.style.fontSize = `${cur + 2}px`;
        const sizeLabel = document.getElementById('fl-font-size');
        if (sizeLabel) sizeLabel.textContent = `${cur + 2}`;
        saveEditsToStorage();
      }
    });

    const btnFontDec = document.getElementById('btn-font-dec');
    if (btnFontDec) btnFontDec.addEventListener('click', () => {
      if (selectedTextEl) {
        if (selectedTextEl.classList.contains('textbox-content')) {
          const children = selectedTextEl.querySelectorAll('h1, h2, h3, h4, h5, p, span, div');
          if (children.length > 0) {
            children.forEach(ch => {
              const curChild = parseInt(window.getComputedStyle(ch).fontSize) || 16;
              if (curChild > 10) ch.style.fontSize = `${curChild - 2}px`;
            });
          }
        }
        const cur = parseInt(window.getComputedStyle(selectedTextEl).fontSize) || 26;
        if (cur > 10) {
          selectedTextEl.style.fontSize = `${cur - 2}px`;
          const sizeLabel = document.getElementById('fl-font-size');
          if (sizeLabel) sizeLabel.textContent = `${cur - 2}`;
          saveEditsToStorage();
        }
      }
    });

    const btnLink = document.getElementById('btn-format-link');
    if (btnLink) btnLink.addEventListener('click', () => {
      const url = prompt('Nhập đường dẫn liên kết (URL):', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        saveEditsToStorage();
      }
    });

    const btnAlign = document.getElementById('btn-format-align');
    if (btnAlign) {
      const aligns = ['left', 'center', 'right', 'justify'];
      let alignIdx = 0;
      btnAlign.addEventListener('click', () => {
        if (selectedTextEl) {
          alignIdx = (alignIdx + 1) % aligns.length;
          selectedTextEl.style.textAlign = aligns[alignIdx];
          saveEditsToStorage();
        }
      });
    }

    const btnSpacing = document.getElementById('btn-format-spacing');
    if (btnSpacing) {
      let isTight = false;
      btnSpacing.addEventListener('click', () => {
        if (selectedTextEl) {
          isTight = !isTight;
          selectedTextEl.style.lineHeight = isTight ? '1.8' : '1.35';
          saveEditsToStorage();
          showToast(isTight ? 'Khoảng cách dòng: Rộng' : 'Khoảng cách dòng: Chuẩn');
        }
      });
    }

    const btnList = document.getElementById('btn-format-list');
    if (btnList) btnList.addEventListener('click', () => {
      document.execCommand('insertUnorderedList', false, null);
      saveEditsToStorage();
    });

    const btnPresets = document.getElementById('btn-format-presets');
    if (btnPresets) btnPresets.addEventListener('click', () => {
      if (selectedTextEl) {
        selectedTextEl.style.color = '#1e3a8a';
        selectedTextEl.style.fontFamily = "'Playfair Display', serif";
        selectedTextEl.style.fontWeight = '700';
        saveEditsToStorage();
        showToast('Đã áp dụng Preset phong cách Prezi');
      }
    });

    const btnDelText = document.getElementById('btn-del-text-el');
    if (btnDelText) btnDelText.addEventListener('click', () => {
      if (selectedTextEl) {
        const parentBox = selectedTextEl.closest('.prezi-textbox, .custom-added-text-box, .custom-added-card, .canvas-card');
        if (parentBox) {
          parentBox.remove();
        } else {
          selectedTextEl.remove();
        }
        if (textToolbar) textToolbar.classList.remove('show');
        selectedTextEl = null;
        syncStopsFromDOM();
        saveEditsToStorage();
        showToast('Đã xóa hộp văn bản.');
      } else {
        const selectedBox = document.querySelector('.prezi-textbox.selected, .custom-added-text-box.selected, .canvas-card.card-selected');
        if (selectedBox) {
          selectedBox.remove();
          if (textToolbar) textToolbar.classList.remove('show');
          syncStopsFromDOM();
          saveEditsToStorage();
          showToast('Đã xóa hộp văn bản.');
        }
      }
    });

    // Text Floating Toolbar: Bring to Front & Send to Back
    const btnTextLayerFront = document.getElementById('btn-text-layer-front');
    if (btnTextLayerFront) {
      btnTextLayerFront.addEventListener('click', () => {
        const target = selectedTextEl ? (selectedTextEl.closest('.prezi-textbox, .custom-added-text-box, .canvas-card') || selectedTextEl) : document.querySelector('.prezi-textbox.selected');
        if (target && typeof bringElementToFront === 'function') {
          bringElementToFront(target);
        }
      });
    }

    const btnTextLayerBack = document.getElementById('btn-text-layer-back');
    if (btnTextLayerBack) {
      btnTextLayerBack.addEventListener('click', () => {
        const target = selectedTextEl ? (selectedTextEl.closest('.prezi-textbox, .custom-added-text-box, .canvas-card') || selectedTextEl) : document.querySelector('.prezi-textbox.selected');
        if (target && typeof sendElementToBack === 'function') {
          sendElementToBack(target);
        }
      });
    }

    const btnTextLock = document.getElementById('btn-text-lock');
    if (btnTextLock) {
      btnTextLock.addEventListener('click', () => {
        const target = selectedTextEl ? (selectedTextEl.closest('.prezi-textbox') || selectedTextEl) : document.querySelector('.prezi-textbox.selected');
        if (target) toggleElementLock(target);
      });
    }

    // Floating Image Toolbar Actions (Hình 1: Replace, Edit, Crop, Delete, Layer Ordering)
    const replaceInput = document.getElementById('replace-file-input');
    if (replaceInput) {
      replaceInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedImgEl) return;
        showToast('Đang tối ưu hóa hình ảnh...');
        try {
          const compressed = await compressImageFileOrUrl(file);
          selectedImgEl.src = compressed;
          saveEditsToStorage();
          showToast('Đã thay thế hình ảnh thành công!');
        } catch (err) {
          console.error(err);
          showToast('Lỗi xử lý hình ảnh!');
        }
      });
    }

    const btnImgFlip = document.getElementById('btn-img-flip');
    if (btnImgFlip) btnImgFlip.addEventListener('click', () => {
      if (selectedImgEl) {
        const curTrans = selectedImgEl.style.transform || '';
        selectedImgEl.style.transform = curTrans.includes('scaleX(-1)') ? curTrans.replace('scaleX(-1)', '').trim() : `${curTrans} scaleX(-1)`.trim();
        saveEditsToStorage();
      }
    });

    const btnImgRadius = document.getElementById('btn-img-radius');
    if (btnImgRadius) btnImgRadius.addEventListener('click', () => {
      if (selectedImgEl) {
        const curR = selectedImgEl.style.borderRadius;
        selectedImgEl.style.borderRadius = curR === '50%' ? '8px' : '50%';
        saveEditsToStorage();
      }
    });

    const btnImgLayerFront = document.getElementById('btn-img-layer-front');
    if (btnImgLayerFront) {
      btnImgLayerFront.addEventListener('click', () => {
        const target = selectedImgEl ? (selectedImgEl.closest('.user-image-wrapper') || selectedImgEl) : document.querySelector('.user-image-wrapper.selected');
        if (target && typeof bringElementToFront === 'function') {
          bringElementToFront(target);
        }
      });
    }

    const btnImgFit = document.getElementById('btn-img-fit-frame');
    if (btnImgFit) {
      btnImgFit.addEventListener('click', () => {
        if (!selectedImgEl) return;
        const wrapper = selectedImgEl.closest('.user-image-wrapper') || selectedImgEl.parentElement;
        if (!wrapper) return;

        pushUndoState();

        // Determine target frame: current parent frame, or overview frame, or active slide frame
        let targetFrame = wrapper.closest('.canvas-slide-frame');
        if (!targetFrame) {
          if (currentStopIndex === 0) {
            targetFrame = document.getElementById('overview-frame-box');
          } else if (STOPS[currentStopIndex]?.targetId) {
            targetFrame = document.getElementById(STOPS[currentStopIndex].targetId);
          }
        }
        if (!targetFrame) {
          targetFrame = document.getElementById('overview-frame-box');
        }

        if (targetFrame) {
          if (wrapper.parentElement !== targetFrame) {
            targetFrame.appendChild(wrapper);
          }
          wrapper.style.position = 'absolute';
          wrapper.style.left = '0px';
          wrapper.style.top = '0px';
          wrapper.style.width = '100%';
          wrapper.style.height = '100%';
          wrapper.style.transform = '';
          sendElementToBack(wrapper);
          positionImageToolbar(wrapper);
          saveEditsToStorage();
          showToast('⛶ Đã tự động khớp hình ảnh vừa khít toàn bộ khung!');
        }
      });
    }

    const btnImgLayerBack = document.getElementById('btn-img-layer-back');
    if (btnImgLayerBack) {
      btnImgLayerBack.addEventListener('click', () => {
        const target = selectedImgEl ? (selectedImgEl.closest('.user-image-wrapper') || selectedImgEl) : document.querySelector('.user-image-wrapper.selected');
        if (target && typeof sendElementToBack === 'function') {
          pushUndoState();
          sendElementToBack(target);
        }
      });
    }

    const btnImgLock = document.getElementById('btn-img-lock');
    if (btnImgLock) {
      btnImgLock.addEventListener('click', () => {
        const target = selectedImgEl ? (selectedImgEl.closest('.user-image-wrapper') || selectedImgEl) : document.querySelector('.user-image-wrapper.selected');
        if (target) toggleElementLock(target);
      });
    }

    const btnImgDel = document.getElementById('btn-img-delete');
    if (btnImgDel) btnImgDel.addEventListener('click', () => {
      if (selectedImgEl) {
        pushUndoState();
        const wrapper = selectedImgEl.closest('.user-image-wrapper') || selectedImgEl.parentElement;
        if (wrapper && wrapper.classList.contains('user-image-wrapper')) {
          wrapper.remove();
        } else {
          selectedImgEl.remove();
        }
        if (imgToolbar) imgToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa hình ảnh.');
      }
    });

    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
      btnUndo.addEventListener('click', (e) => {
        e.preventDefault();
        undo();
      });
    }

    const btnRedo = document.getElementById('btn-redo');
    if (btnRedo) {
      btnRedo.addEventListener('click', (e) => {
        e.preventDefault();
        redo();
      });
    }
    updateUndoRedoUI();

    // 2. Add New Text box button
    const btnAddText = document.getElementById('btn-tool-text');
    if (btnAddText) {
      btnAddText.addEventListener('click', () => {
        const activeCard = document.querySelector('.canvas-card.current-active') || document.getElementById('stop-01');
        const p = document.createElement('p');
        p.className = 'card-body-text';
        p.textContent = 'Nhập nội dung mới tại đây...';
        activeCard.appendChild(p);
        makeElementEditable(p);
        p.focus();
        showToast('Đã tạo khối văn bản mới. Bạn có thể gõ nội dung trực tiếp.');
      });
    }

    // 3. Insert Image from File Upload
    const fileInput = document.getElementById('file-input-image');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('Đang tối ưu hóa hình ảnh tải lên...');
        try {
          const compressed = await compressImageFileOrUrl(file);
          if (selectedImgEl && document.contains(selectedImgEl)) {
            selectedImgEl.src = compressed;
            saveEditsToStorage();
            showToast('Đã thay thế ảnh thành công!');
          } else {
            await placeImageOnCanvas(compressed);
          }
        } catch (err) {
          console.error(err);
          showToast('Lỗi tải hình ảnh!');
        }
        fileInput.value = '';
      });
    }

    // 4. ROBUST MULTI-SOURCE CLIPBOARD PASTE (CTRL+V)
    // Supports Image files, Screenshots, Browser Image Copies, HTML <img>, and URLs
    // Direct replace if an image is currently selected!
    window.addEventListener('paste', async (e) => {
      const clipboard = e.clipboardData;
      if (!clipboard) return;

      let handled = false;

      // Check 1: Clipboard Files & Items (Snipping Tool, PrintScreen, Copy Image from web)
      if (clipboard.items) {
        for (let i = 0; i < clipboard.items.length; i++) {
          const item = clipboard.items[i];
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            if (blob) {
              showToast('Đang tối ưu hình ảnh từ Clipboard...');
              try {
                const compressed = await compressImageFileOrUrl(blob);
                if (selectedImgEl && document.contains(selectedImgEl)) {
                  selectedImgEl.src = compressed;
                  saveEditsToStorage();
                  showToast('Đã dán đè thay thế hình ảnh đang chọn!');
                } else {
                  await placeImageOnCanvas(compressed);
                  showToast('Đã dán hình ảnh trực tiếp từ bộ nhớ đệm (Clipboard)!');
                }
              } catch (err) {
                console.error(err);
              }
              handled = true;
              return;
            }
          }
        }
      }

      // Check 2: HTML Image paste (Copy image in Chrome/Edge often pastes <img src="...">)
      if (!handled && clipboard.types.includes('text/html')) {
        const html = clipboard.getData('text/html');
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const img = doc.querySelector('img');
        if (img && img.src) {
          e.preventDefault();
          showToast('Đang tối ưu hình ảnh sao chép...');
          try {
            const compressed = await compressImageFileOrUrl(img.src);
            if (selectedImgEl && document.contains(selectedImgEl)) {
              selectedImgEl.src = compressed;
              saveEditsToStorage();
              showToast('Đã dán đè thay thế hình ảnh đang chọn!');
            } else {
              await placeImageOnCanvas(compressed);
              showToast('Đã chèn hình ảnh sao chép từ trình duyệt!');
            }
          } catch (err) {
            console.error(err);
          }
          handled = true;
          return;
        }
      }

      // Check 3: Raw image URL paste
      if (!handled && clipboard.types.includes('text/plain')) {
        const text = clipboard.getData('text/plain').trim();
        if (text.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || text.startsWith('data:image/')) {
          e.preventDefault();
          showToast('Đang xử lý hình ảnh URL...');
          try {
            const compressed = await compressImageFileOrUrl(text);
            if (selectedImgEl && document.contains(selectedImgEl)) {
              selectedImgEl.src = compressed;
              saveEditsToStorage();
              showToast('Đã dán đè thay thế hình ảnh đang chọn!');
            } else {
              await placeImageOnCanvas(compressed);
              showToast('Đã dán hình ảnh từ đường dẫn URL!');
            }
          } catch (err) {
            console.error(err);
          }
          handled = true;
          return;
        }
      }

      // Check 4: Text Paste (Copy text from Web, PDF, Word, Notepad, or Prezi)
      if (!handled) {
        const rawText = clipboard.getData('text/plain') || '';
        let plainText = rawText.trim();

        // --- PREZI SMART CLIPBOARD HANDLER ---
        let isPreziDoc = false;
        let preziExtractedTitle = 'Khung Prezi mới';
        let preziExtractedBody = '';

        if (plainText.startsWith('{') && plainText.includes('"type":"PreziDoc"')) {
          try {
            const preziData = JSON.parse(plainText);
            if (preziData && preziData.type === 'PreziDoc') {
              isPreziDoc = true;
              if (preziData.doc && typeof preziData.doc === 'string' && preziData.doc.trim()) {
                try {
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(preziData.doc, 'text/xml');
                  const nodes = xmlDoc.querySelectorAll('p, text, span, title, h1, h2, h3');
                  const extracted = [];
                  nodes.forEach(n => {
                    const t = n.textContent.trim();
                    if (t) extracted.push(t);
                  });
                  if (extracted.length > 0) {
                    preziExtractedTitle = extracted[0];
                    preziExtractedBody = extracted.slice(1).join('\n\n') || extracted[0];
                  }
                } catch(e) {}
              }
              if (!preziExtractedBody) {
                preziExtractedBody = 'Nhấp đúp chuột để chỉnh sửa nội dung thẻ này...';
              }
            }
          } catch(e) {}
        }

        if (isPreziDoc) {
          e.preventDefault();
          const textToInsert = preziExtractedBody && preziExtractedBody !== 'Nhấp đúp chuột để chỉnh sửa nội dung thẻ này...' ? preziExtractedBody : (preziExtractedTitle || 'Văn bản Prezi');
          if (document.activeElement && document.activeElement.isContentEditable) {
            document.execCommand('insertText', false, textToInsert);
            saveEditsToStorage();
            showToast('Đã dán văn bản từ Prezi!');
            handled = true;
            return;
          }

          // Create a clean, transparent Prezi floating text box (NO CARD, NO WHITE BOX)
          const vpRect = viewport.getBoundingClientRect();
          const scale = currentCamera.scale || 1;
          const centerX = (-currentCamera.x + vpRect.width / 2) / scale;
          const centerY = (-currentCamera.y + vpRect.height / 2) / scale;

          const newId = `textbox-${Date.now()}`;
          const textBox = document.createElement('div');
          textBox.className = 'prezi-textbox selected';
          textBox.id = newId;
          textBox.style.left = `${Math.round(centerX - 150)}px`;
          textBox.style.top = `${Math.round(centerY - 30)}px`;

          const contentDiv = document.createElement('div');
          contentDiv.className = 'textbox-content';
          contentDiv.setAttribute('contenteditable', 'true');
          contentDiv.setAttribute('spellcheck', 'false');
          contentDiv.textContent = textToInsert;

          textBox.appendChild(contentDiv);
          textBox.insertAdjacentHTML('beforeend', `
            <div class="box-handle tl"></div>
            <div class="box-handle tr"></div>
            <div class="box-handle bl"></div>
            <div class="box-handle br"></div>
          `);
          world.appendChild(textBox);
          setupTextBox(textBox);
          saveEditsToStorage();

          contentDiv.focus();
          selectedTextEl = contentDiv;
          if (typeof positionTextToolbar === 'function') {
            positionTextToolbar(contentDiv);
          }
          showToast('Đã dán văn bản trong suốt từ Prezi!');
          handled = true;
          return;
        }

        if (plainText) {
          e.preventDefault();
          // A. If user is currently focused inside a contenteditable element:
          if (document.activeElement && document.activeElement.isContentEditable) {
            document.execCommand('insertText', false, plainText);
            saveEditsToStorage();
            showToast('Đã dán văn bản!');
            handled = true;
            return;
          }

          // B. If a text element was previously clicked/selected:
          if (selectedTextEl && document.contains(selectedTextEl)) {
            selectedTextEl.focus();
            document.execCommand('insertText', false, plainText);
            saveEditsToStorage();
            showToast('Đã dán văn bản vào mục đang chọn!');
            handled = true;
            return;
          }

          // C. If a prezi textbox is selected:
          const selectedTextBox = document.querySelector('.prezi-textbox.selected');
          if (selectedTextBox) {
            const content = selectedTextBox.querySelector('.textbox-content');
            if (content) {
              content.focus();
              document.execCommand('insertText', false, plainText);
              saveEditsToStorage();
              showToast('Đã dán văn bản vào hộp chữ!');
              handled = true;
              return;
            }
          }

          // D. Canvas Paste: Create a clean, transparent Prezi floating text box (NO CARD, NO WHITE BOX, NO BADGE, NO SHADOW)
          const vpRect = viewport.getBoundingClientRect();
          const scale = currentCamera.scale || 1;
          const centerX = (-currentCamera.x + vpRect.width / 2) / scale;
          const centerY = (-currentCamera.y + vpRect.height / 2) / scale;

          const newId = `textbox-${Date.now()}`;
          const textBox = document.createElement('div');
          textBox.className = 'prezi-textbox selected';
          textBox.id = newId;
          textBox.style.left = `${Math.round(centerX - 150)}px`;
          textBox.style.top = `${Math.round(centerY - 30)}px`;

          const contentDiv = document.createElement('div');
          contentDiv.className = 'textbox-content';
          contentDiv.setAttribute('contenteditable', 'true');
          contentDiv.setAttribute('spellcheck', 'false');
          contentDiv.textContent = plainText;

          textBox.appendChild(contentDiv);
          textBox.insertAdjacentHTML('beforeend', `
            <div class="box-handle tl"></div>
            <div class="box-handle tr"></div>
            <div class="box-handle bl"></div>
            <div class="box-handle br"></div>
          `);
          world.appendChild(textBox);
          setupTextBox(textBox);
          saveEditsToStorage();

          contentDiv.focus();
          selectedTextEl = contentDiv;
          if (typeof positionTextToolbar === 'function') {
            positionTextToolbar(contentDiv);
          }
          showToast('Đã dán văn bản (Prezi Text trong suốt)');
          handled = true;
          return;
        }
      }
    });

    // Universal Keyboard Delete Shortcut (Delete or Backspace on selected card, image, or text block)
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      const activeEl = document.activeElement;

      // 1. If actively typing text characters inside contenteditable, input, or textarea:
      if (activeEl && (
        activeEl.isContentEditable || 
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.closest('[contenteditable="true"]') ||
        activeEl.closest('.textbox-content')
      )) {
        // While user is typing/editing text inside contenteditable:
        // NEVER delete the parent container box! Let native browser editing delete characters/words.
        return;
      }

      // 2. Universal single/bulk deletion of any selected canvas elements (textboxes, slide frames, cards, images):
      const allSelectedItems = Array.from(document.querySelectorAll(
        '.prezi-textbox.selected, .custom-added-text-box.selected, .custom-added-text-box.card-selected, .canvas-slide-frame.selected, .canvas-card.card-selected, .canvas-item.card-selected, .user-image-wrapper.selected, .user-image-wrapper.card-selected'
      )).filter(el => el.id !== 'overview-frame-box');

      if (allSelectedItems.length > 0) {
        const lockedItems = allSelectedItems.filter(el => el.classList.contains('is-locked') || el.getAttribute('data-locked') === 'true');
        if (lockedItems.length === allSelectedItems.length) {
          e.preventDefault();
          showToast('🔒 Phần tử đang bị khóa. Bấm Ctrl+L hoặc nút 🔓 Mở khóa trước khi xóa!');
          return;
        }

        const itemsToDelete = allSelectedItems.filter(el => !el.classList.contains('is-locked') && el.getAttribute('data-locked') !== 'true');
        if (itemsToDelete.length > 0) {
          e.preventDefault();
          pushUndoState();
          const count = itemsToDelete.length;
          itemsToDelete.forEach(item => item.remove());
          if (textToolbar) textToolbar.classList.remove('show');
          if (imgToolbar) imgToolbar.classList.remove('show');
          selectedTextEl = null;
          selectedImgEl = null;
          syncStopsFromDOM();
          saveEditsToStorage();
          showToast(count === 1 ? 'Đã xóa mục đang chọn.' : `Đã xóa ${count} mục đã chọn.`);
          goToStop(Math.min(currentStopIndex, Math.max(0, STOPS.length - 1)));
          return;
        }
      }

      // 3. If an individual editable text item was explicitly targeted (has .prezi-selected-el):
      if (selectedTextEl && document.contains(selectedTextEl) && selectedTextEl.classList.contains('prezi-selected-el')) {
        const parentBox = selectedTextEl.closest('.prezi-textbox, .custom-added-text-box, .custom-added-card, .canvas-card');
        if (parentBox && (parentBox.classList.contains('is-locked') || parentBox.getAttribute('data-locked') === 'true')) {
          e.preventDefault();
          showToast('🔒 Hộp chữ đang bị khóa. Bấm Ctrl+L hoặc 🔓 Mở khóa trước khi xóa!');
          return;
        }
        e.preventDefault();
        pushUndoState();
        if (parentBox && (parentBox.classList.contains('selected') || parentBox.classList.contains('card-selected'))) {
          parentBox.remove();
        } else {
          selectedTextEl.remove();
        }
        selectedTextEl = null;
        if (textToolbar) textToolbar.classList.remove('show');
        syncStopsFromDOM();
        saveEditsToStorage();
        showToast('Đã xóa khối văn bản.');
        return;
      }

      // 4. If a slide frame is explicitly selected:
      if (currentStopIndex > 0 && currentStopIndex < STOPS.length) {
        const stop = STOPS[currentStopIndex];
        if (stop && stop.targetId) {
          const targetFrame = document.getElementById(stop.targetId);
          if (targetFrame && targetFrame.classList.contains('selected') && targetFrame.id !== 'overview-frame-box') {
            if (targetFrame.classList.contains('is-locked') || targetFrame.getAttribute('data-locked') === 'true') {
              e.preventDefault();
              showToast('🔒 Khung slide đang bị khóa. Bấm Ctrl+L để mở khóa trước khi xóa!');
              return;
            }
            e.preventDefault();
            pushUndoState();
            deleteCard(targetFrame, true);
            return;
          }
        }
      }
    });

    // 5. Manual Save Button
    const btnSave = document.getElementById('btn-tool-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        saveEditsToStorage();
        showToast('Đã lưu toàn bộ bản thảo thành công!');
      });
    }

    loadEditsFromStorage();
  }

  // Positioning Floating Image Toolbar (Hình 1)
  function positionImageToolbar(targetEl) {
    const imgToolbar = document.getElementById('image-floating-toolbar');
    if (!imgToolbar || document.body.classList.contains('in-present-mode')) return;
    const rect = targetEl.getBoundingClientRect();
    const tbHeight = imgToolbar.offsetHeight || 44;
    const tbWidth = imgToolbar.offsetWidth || 440;

    // Smart clearance: if less than 65px above image (topbar clearance), place BELOW the image
    let topPos = rect.top - tbHeight - 14;
    if (topPos < 65) {
      topPos = rect.bottom + 14;
    }

    // Center horizontally on the image
    let leftPos = rect.left + rect.width / 2 - tbWidth / 2;
    leftPos = Math.max(250, Math.min(window.innerWidth - tbWidth - 16, leftPos));

    imgToolbar.style.top = `${Math.round(topPos)}px`;
    imgToolbar.style.left = `${Math.round(leftPos)}px`;
    imgToolbar.classList.add('show');
    if (typeof updateLockToolbarButtons === 'function') {
      updateLockToolbarButtons(targetEl ? (targetEl.closest('.user-image-wrapper') || targetEl) : null);
    }
  }
  window.positionImageToolbar = positionImageToolbar;

  // Attach full suite of interactive controls (Select, Resize, Drag, Delete, Double-click, Snap, Aspect-Ratio Lock)
  function attachImageWrapperEvents(wrapper, img, resizeHandle, btnDel) {
    if (!wrapper || !img) return;

    // 0. Ensure image fills wrapper and has natural aspect ratio sync
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.display = 'block';

    const syncAspectRatio = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight;
        if (!wrapper.style.height || wrapper.style.height === 'auto') {
          const w = wrapper.offsetWidth || 280;
          wrapper.style.height = `${Math.round(w / aspect)}px`;
        }
      }
    };
    if (img.complete) {
      syncAspectRatio();
    } else {
      img.addEventListener('load', syncAspectRatio, { once: true });
    }

    // 1. Select & Open Floating Toolbar
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedImgEl = img;
      document.querySelectorAll('.user-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
      wrapper.classList.add('selected');
      document.querySelectorAll('.prezi-selected-img').forEach(i => i.classList.remove('prezi-selected-img'));
      img.classList.add('prezi-selected-img');
      positionImageToolbar(wrapper);
    });

    // 2. Double-click to Replace Image from file
    wrapper.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      selectedImgEl = img;
      const replaceInput = document.getElementById('replace-file-input');
      if (replaceInput) replaceInput.click();
    });

    // 3. Quick Delete Button (✕)
    if (btnDel) {
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        pushUndoState();
        wrapper.remove();
        selectedImgEl = null;
        const imgToolbar = document.getElementById('image-floating-toolbar');
        if (imgToolbar) imgToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa hình ảnh.');
      });
    }

    // 4. Drag & Reposition with Magnetic Snapping
    let isDraggingImg = false;
    let dragStartX = 0, dragStartY = 0;
    let imgInitTransX = 0, imgInitTransY = 0;
    let imgInitLeft = 0, imgInitTop = 0;
    let isPositionAbsolute = false;

    wrapper.addEventListener('mousedown', (e) => {
      if (e.target === resizeHandle || e.target === btnDel) return;
      if (document.body.classList.contains('in-present-mode')) return;
      e.stopPropagation();

      if (wrapper.classList.contains('is-locked') || wrapper.getAttribute('data-locked') === 'true') {
        // Locked: select image so toolbar opens, but do not drag
        return;
      }

      pushUndoState();

      isDraggingImg = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      isPositionAbsolute = window.getComputedStyle(wrapper).position === 'absolute';
      if (isPositionAbsolute && !wrapper.style.transform) {
        imgInitLeft = parseFloat(wrapper.style.left) || wrapper.offsetLeft;
        imgInitTop = parseFloat(wrapper.style.top) || wrapper.offsetTop;
      } else {
        const curTrans = wrapper.style.transform || '';
        const match = curTrans.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        imgInitTransX = match ? parseFloat(match[1]) : 0;
        imgInitTransY = match ? parseFloat(match[2]) : 0;
      }
      wrapper.style.zIndex = '120';
    });

    // 5. Corner Resize Handle (Tự động khóa tỷ lệ chuẩn 1:1 bao sát ảnh, tự động khớp khung Overview / Slide)
    let isResizingImg = false;
    let resizeStartX = 0, resizeStartY = 0;
    let initW = 0, initH = 0;

    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        if (document.body.classList.contains('in-present-mode')) return;
        if (wrapper.classList.contains('is-locked') || wrapper.getAttribute('data-locked') === 'true') return;
        e.stopPropagation();
        e.preventDefault();

        pushUndoState();

        isResizingImg = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        initW = wrapper.offsetWidth;
        initH = wrapper.offsetHeight;
      });
    }

    // Window listeners for Smooth Drag & Resize
    window.addEventListener('mousemove', (e) => {
      const scale = currentCamera.scale || 1;
      if (isDraggingImg) {
        const dx = (e.clientX - dragStartX) / scale;
        const dy = (e.clientY - dragStartY) / scale;
        if (isPositionAbsolute && !wrapper.style.transform) {
          let targetX = imgInitLeft + dx;
          let targetY = imgInitTop + dy;

          // Magnetic snapping: Check parent frame or overview frame
          const parentFrame = wrapper.closest('.canvas-slide-frame') || (wrapper.parentElement && wrapper.parentElement.id === 'overview-frame-box' ? wrapper.parentElement : null);
          const snapThreshold = 18;

          if (parentFrame) {
            const fW = parentFrame.offsetWidth || 960;
            const fH = parentFrame.offsetHeight || 540;
            const wW = wrapper.offsetWidth;
            const wH = wrapper.offsetHeight;

            // X-axis snapping: Left (0), Right (fW - wW), Center ((fW - wW) / 2)
            if (Math.abs(targetX) < snapThreshold) targetX = 0;
            else if (Math.abs(targetX + wW - fW) < snapThreshold) targetX = fW - wW;
            else if (Math.abs(targetX + wW / 2 - fW / 2) < snapThreshold) targetX = Math.round((fW - wW) / 2);

            // Y-axis snapping: Top (0), Bottom (fH - wH), Center ((fH - wH) / 2)
            if (Math.abs(targetY) < snapThreshold) targetY = 0;
            else if (Math.abs(targetY + wH - fH) < snapThreshold) targetY = fH - wH;
            else if (Math.abs(targetY + wH / 2 - fH / 2) < snapThreshold) targetY = Math.round((fH - wH) / 2);
          } else {
            // Dragging on canvas: check snapping to Overview frame
            const ovFrame = document.getElementById('overview-frame-box');
            if (ovFrame) {
              const ovLeft = parseFloat(ovFrame.style.left) || 1000;
              const ovTop = parseFloat(ovFrame.style.top) || 1000;
              const ovW = ovFrame.offsetWidth || 960;
              const ovH = ovFrame.offsetHeight || 540;
              const wW = wrapper.offsetWidth;
              const wH = wrapper.offsetHeight;

              if (Math.abs(targetX - ovLeft) < snapThreshold) targetX = ovLeft;
              else if (Math.abs(targetX + wW - (ovLeft + ovW)) < snapThreshold) targetX = ovLeft + ovW - wW;
              else if (Math.abs(targetX + wW / 2 - (ovLeft + ovW / 2)) < snapThreshold) targetX = Math.round(ovLeft + (ovW - wW) / 2);

              if (Math.abs(targetY - ovTop) < snapThreshold) targetY = ovTop;
              else if (Math.abs(targetY + wH - (ovTop + ovH)) < snapThreshold) targetY = ovTop + ovH - wH;
              else if (Math.abs(targetY + wH / 2 - (ovTop + ovH / 2)) < snapThreshold) targetY = Math.round(ovTop + (ovH - wH) / 2);
            }
          }

          wrapper.style.left = `${Math.round(targetX)}px`;
          wrapper.style.top = `${Math.round(targetY)}px`;
        } else {
          wrapper.style.transform = `translate(${imgInitTransX + dx}px, ${imgInitTransY + dy}px)`;
        }
        if (wrapper.classList.contains('selected')) {
          positionImageToolbar(wrapper);
        }
      } else if (isResizingImg) {
        const dx = (e.clientX - resizeStartX) / scale;
        const dy = (e.clientY - resizeStartY) / scale;

        // Strictly lock aspect ratio to image proportions so bounding box wraps tightly with no gap!
        const aspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : ((initW / initH) || 1.4);
        
        let newW = Math.max(initW + dx, 50);
        let newH = Math.round(newW / aspect);

        // Magnetic snap resize to parent frame (Overview frame / Slide frame)
        const parentFrame = wrapper.closest('.canvas-slide-frame') || (wrapper.parentElement && wrapper.parentElement.id === 'overview-frame-box' ? wrapper.parentElement : null);
        if (parentFrame) {
          const fW = parentFrame.offsetWidth || 960;
          const fH = parentFrame.offsetHeight || 540;
          if (Math.abs(newW - fW) < 22) {
            newW = fW;
            newH = Math.round(newW / aspect);
          }
          if (Math.abs(newH - fH) < 22) {
            newH = fH;
            newW = Math.round(newH * aspect);
          }
        }

        wrapper.style.width = `${newW}px`;
        wrapper.style.height = `${newH}px`;
        if (wrapper.classList.contains('selected')) {
          positionImageToolbar(wrapper);
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingImg || isResizingImg) {
        isDraggingImg = false;
        isResizingImg = false;
        if (wrapper.classList.contains('selected')) {
          positionImageToolbar(wrapper);
        }
        saveEditsToStorage();
      }
    });
  }

  // Unified Upgrade: Makes all default card images fully interactive identical to pasted images
  function upgradeAllImagesToInteractive() {
    const images = document.querySelectorAll('.canvas-card img');
    images.forEach(img => {
      if (img.closest('.user-image-wrapper') || img.closest('.bg-manuscript-layer') || img.closest('.bg-splash-layer') || img.closest('.bg-note-paper-layer')) return;

      const parent = img.parentElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'user-image-wrapper default-card-image';
      
      const curW = img.offsetWidth || 140;
      const curH = img.offsetHeight || 135;
      wrapper.style.width = `${curW}px`;
      wrapper.style.height = `${curH}px`;

      parent.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      img.classList.add('user-placed-image');

      const btnDel = document.createElement('button');
      btnDel.className = 'btn-del-img';
      btnDel.innerHTML = '✕';
      btnDel.title = 'Xóa ảnh này';

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'img-resize-handle';
      resizeHandle.title = 'Kéo để co giãn kích thước ảnh';

      wrapper.appendChild(btnDel);
      wrapper.appendChild(resizeHandle);

      attachImageWrapperEvents(wrapper, img, resizeHandle, btnDel);
    });

    // Re-bind existing wrappers from saved storage if any
    document.querySelectorAll('.user-image-wrapper').forEach(wrapper => {
      if (wrapper.dataset.eventsBound) return;
      wrapper.dataset.eventsBound = 'true';
      const img = wrapper.querySelector('img');
      let resizeHandle = wrapper.querySelector('.img-resize-handle');
      let btnDel = wrapper.querySelector('.btn-del-img');

      if (!btnDel) {
        btnDel = document.createElement('button');
        btnDel.className = 'btn-del-img';
        btnDel.innerHTML = '✕';
        btnDel.title = 'Xóa ảnh này';
        wrapper.appendChild(btnDel);
      }
      if (!resizeHandle) {
        resizeHandle = document.createElement('div');
        resizeHandle.className = 'img-resize-handle';
        resizeHandle.title = 'Kéo để co giãn kích thước ảnh';
        wrapper.appendChild(resizeHandle);
      }
      attachImageWrapperEvents(wrapper, img, resizeHandle, btnDel);
    });
  }

  // High-performance client-side image compression
  // Preserves 100% alpha transparency for PNG/WebP (NO BLACK BACKGROUNDS!)
  // Compresses down to ~80-250KB for rapid, fail-proof saving to D1 & LocalStorage
  function compressImageFileOrUrl(input, maxWidth = 1400, maxHeight = 1000, quality = 0.85) {
    return new Promise((resolve) => {
      let isTransparentHint = false;
      if (input instanceof File || input instanceof Blob) {
        if (input.type === 'image/png' || input.type === 'image/webp' || input.type === 'image/gif' || input.type === 'image/svg+xml') {
          isTransparentHint = true;
        }
      } else if (typeof input === 'string') {
        if (input.startsWith('data:image/png') || input.startsWith('data:image/webp') || input.startsWith('data:image/gif') || input.includes('.png') || input.includes('.webp')) {
          isTransparentHint = true;
        }
        if (input.startsWith('data:image/svg')) {
          resolve(input);
          return;
        }
      }

      const renderToCanvas = (img) => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve(img.src);
          return;
        }
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        // Check if canvas actually has transparent pixels
        let hasAlpha = isTransparentHint;
        if (!hasAlpha) {
          try {
            const pixelData = ctx.getImageData(0, 0, w, h).data;
            for (let i = 3; i < pixelData.length; i += 64) {
              if (pixelData[i] < 250) {
                hasAlpha = true;
                break;
              }
            }
          } catch (e) {}
        }

        try {
          if (hasAlpha) {
            // First try WebP: supports alpha AND gives great compression
            const webpUrl = canvas.toDataURL('image/webp', quality);
            if (webpUrl && webpUrl.startsWith('data:image/webp')) {
              resolve(webpUrl);
              return;
            }
            // Fallback for browsers without webp canvas export: PNG
            const pngUrl = canvas.toDataURL('image/png');
            resolve(pngUrl);
            return;
          }
          // Non-transparent photos: JPEG
          const jpegUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegUrl);
        } catch (err) {
          resolve(img.src);
        }
      };

      if (typeof input === 'string') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => renderToCanvas(img);
        img.onerror = () => resolve(input);
        img.src = input;
      } else if (input instanceof Blob || input instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => renderToCanvas(img);
          img.onerror = () => resolve(e.target.result);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(input);
      } else {
        resolve(input);
      }
    });
  }
  window.compressImageFileOrUrl = compressImageFileOrUrl;

  // Place and attach draggable listeners to an image
  async function placeImageOnCanvas(srcDataUrl) {
    pushUndoState();

    // Safety check: ensure image is compressed if it's a large data URL
    if (typeof srcDataUrl === 'string' && srcDataUrl.startsWith('data:image/') && srcDataUrl.length > 250000) {
      srcDataUrl = await compressImageFileOrUrl(srcDataUrl);
    }

    // Identify active slide frame or card
    const activeFrame = document.querySelector('.canvas-slide-frame.selected') || 
                        (currentStopIndex > 0 && STOPS[currentStopIndex]?.targetId ? document.getElementById(STOPS[currentStopIndex].targetId) : null);

    const wrapper = document.createElement('div');
    wrapper.className = 'user-image-wrapper';

    // Calculate initial dimensions preserving aspect ratio strictly
    let imgW = 380;
    let imgH = 260;
    try {
      const tempImg = new Image();
      tempImg.src = srcDataUrl;
      await new Promise(r => {
        if (tempImg.complete) r();
        else { tempImg.onload = r; tempImg.onerror = r; }
      });
      if (tempImg.naturalWidth && tempImg.naturalHeight) {
        const aspect = tempImg.naturalWidth / tempImg.naturalHeight;
        if (aspect >= 1) {
          imgW = Math.min(460, tempImg.naturalWidth);
          imgH = Math.round(imgW / aspect);
        } else {
          imgH = Math.min(360, tempImg.naturalHeight);
          imgW = Math.round(imgH * aspect);
        }
      }
    } catch (e) {}

    if (activeFrame && activeFrame.id !== 'overview-frame-box') {
      // Place centered inside the current slide frame
      wrapper.style.position = 'absolute';
      const fW = activeFrame.offsetWidth || 960;
      const fH = activeFrame.offsetHeight || 540;
      wrapper.style.left = `${Math.round(Math.max(20, (fW - imgW) / 2))}px`;
      wrapper.style.top = `${Math.round(Math.max(20, (fH - imgH) / 2))}px`;
      wrapper.style.width = `${imgW}px`;
      wrapper.style.height = `${imgH}px`;
      activeFrame.appendChild(wrapper);
    } else {
      const vpRect = viewport.getBoundingClientRect();
      const scale = currentCamera.scale || 1;
      const centerX = (-currentCamera.x + vpRect.width / 2) / scale;
      const centerY = (-currentCamera.y + vpRect.height / 2) / scale;
      wrapper.style.left = `${Math.round(centerX - imgW / 2)}px`;
      wrapper.style.top = `${Math.round(centerY - imgH / 2)}px`;
      wrapper.style.width = `${imgW}px`;
      wrapper.style.height = `${imgH}px`;
      world.appendChild(wrapper);
    }

    const img = document.createElement('img');
    img.src = srcDataUrl;
    img.className = 'user-placed-image';
    img.alt = 'Hình ảnh chèn';

    const btnDel = document.createElement('button');
    btnDel.className = 'btn-del-img';
    btnDel.innerHTML = '✕';
    btnDel.title = 'Xóa ảnh này';

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'img-resize-handle';
    resizeHandle.title = 'Kéo để co giãn kích thước ảnh';

    wrapper.appendChild(img);
    wrapper.appendChild(btnDel);
    wrapper.appendChild(resizeHandle);

    wrapper.dataset.eventsBound = 'true';
    attachImageWrapperEvents(wrapper, img, resizeHandle, btnDel);

    // Auto-select newly placed image so toolbar is accessible
    document.querySelectorAll('.user-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
    document.querySelectorAll('.prezi-selected-img').forEach(i => i.classList.remove('prezi-selected-img'));
    wrapper.classList.add('selected');
    img.classList.add('prezi-selected-img');
    selectedImgEl = img;

    setTimeout(() => {
      positionImageToolbar(wrapper);
    }, 40);

    saveEditsToStorage();
    showToast('Đã chèn và lưu hình ảnh thành công!');
  }

  // Persistence with LocalStorage, IndexedDB & Cloudflare D1 Database
  let d1SyncTimer = null;
  async function saveEditsToStorage() {
    const saveIndicator = document.getElementById('save-status-indicator');
    if (saveIndicator) {
      saveIndicator.textContent = 'Đang lưu...';
      saveIndicator.className = 'save-status-indicator saving';
    }

    let content = world.innerHTML;
    // Sanitize ephemeral selection classes and event bound flags
    content = content
      .replace(/\s*data-events-bound="[^"]*"/g, '')
      .replace(/\bselected\b/g, '')
      .replace(/\bcard-selected\b/g, '')
      .replace(/\bcurrent-active\b/g, '')
      .replace(/\s{2,}/g, ' ');

    const saveTimestamp = Date.now();

    try {
      localStorage.setItem('prezi_saved_world_content', content);
      localStorage.setItem('prezi_saved_timestamp', String(saveTimestamp));
    } catch (err) {
      console.warn('LocalStorage quota limit reached, relying on IndexedDB and D1', err);
    }

    try {
      await saveToIndexedDB('world_backup', { content, timestamp: saveTimestamp });
    } catch (err) {
      console.warn('IndexedDB save warning:', err);
    }

    if (saveIndicator) {
      saveIndicator.textContent = 'Đã lưu tự động';
      saveIndicator.className = 'save-status-indicator saved';
    }

    // Debounced sync to Cloudflare D1 Database via Pages Functions API
    clearTimeout(d1SyncTimer);
    d1SyncTimer = setTimeout(async () => {
      try {
        const layoutRaw = localStorage.getItem('prezi_cards_layout_v2');
        const layout = layoutRaw ? JSON.parse(layoutRaw) : null;
        
        const res = await fetch('/api/presentation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            cardsLayout: layout,
            clientTimestamp: saveTimestamp
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.isConfigured !== false) {
            if (saveIndicator) {
              saveIndicator.textContent = 'Đã lưu Cloudflare D1';
              saveIndicator.className = 'save-status-indicator saved';
            }
          }
        } else {
          console.warn('D1 sync returned non-OK status:', res.status);
        }
      } catch (e) {
        // Offline or running without Pages Functions
      }
    }, 500);
  }

  async function loadEditsFromStorage() {
    let d1Content = null;
    let d1Layout = null;
    let d1Timestamp = 0;

    // 1. Try loading from Cloudflare D1 database first
    try {
      const res = await fetch('/api/presentation');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.content) {
          d1Content = json.data.content;
          d1Layout = json.data.cardsLayout;
          function parseIsoDate(val) {
            if (!val) return 0;
            if (typeof val === 'number') return val;
            const str = String(val).trim().replace(' ', 'T');
            const d = new Date(str.endsWith('Z') || str.includes('+') ? str : str + 'Z');
            return isNaN(d.getTime()) ? 0 : d.getTime();
          }
          d1Timestamp = parseIsoDate(json.data.updatedAt);
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // 2. Load from LocalStorage
    let localContent = null;
    let localTimestamp = 0;
    try {
      localContent = localStorage.getItem('prezi_saved_world_content');
      localTimestamp = parseInt(localStorage.getItem('prezi_saved_timestamp') || '0', 10);
    } catch (e) {}

    // 3. Load from IndexedDB
    let idbContent = null;
    let idbTimestamp = 0;
    try {
      const idbData = await loadFromIndexedDB('world_backup');
      if (idbData) {
        if (typeof idbData === 'object' && idbData.content) {
          idbContent = idbData.content;
          idbTimestamp = idbData.timestamp || 0;
        } else if (typeof idbData === 'string') {
          idbContent = idbData;
        }
      }
    } catch (e) {}

    // 4. Determine freshest version
    let savedContent = null;
    let savedLayout = d1Layout;

    // Filter out obsolete legacy templates
    function isObsoleteLegacy(html) {
      if (!html) return false;
      return html.includes('cluster-principles') || html.includes('bust_portrait_card');
    }

    if (d1Content && isObsoleteLegacy(d1Content)) d1Content = null;
    if (localContent && isObsoleteLegacy(localContent)) localContent = null;
    if (idbContent && isObsoleteLegacy(idbContent)) idbContent = null;

    // Compare timestamps to choose the newest content
    const maxLocalTs = Math.max(localTimestamp, idbTimestamp);
    if (d1Content && (d1Timestamp >= maxLocalTs || maxLocalTs === 0)) {
      savedContent = d1Content;
    } else if (localContent && localTimestamp >= idbTimestamp) {
      savedContent = localContent;
      // Sync newer local edits back to D1
      saveEditsToStorage();
    } else if (idbContent) {
      savedContent = idbContent;
      // Sync newer idb edits back to D1
      saveEditsToStorage();
    } else if (d1Content) {
      savedContent = d1Content;
    }

    if (savedContent) {
      savedContent = savedContent.replace(/<div class="canvas-watermark"[\s\S]*?<\/div>/gi, '');
      savedContent = savedContent.replace(/<div class="card-action-bar"[\s\S]*?<\/div>/gi, '');
      savedContent = savedContent.replace(/\s*data-events-bound="[^"]*"/g, '');
      world.innerHTML = savedContent;
      world.querySelectorAll('[data-events-bound]').forEach(el => delete el.dataset.eventsBound);
      world.querySelectorAll('.card-action-bar').forEach(el => el.remove());
      
      world.querySelectorAll('.prezi-textbox').forEach(setupTextBox);
      world.querySelectorAll('.canvas-slide-frame').forEach(setupSlideFrameInteractions);
      ensureOverviewFrameBox();
      separateOverlappingFrames();
      world.querySelectorAll('.selected, .card-selected, .current-active').forEach(el => el.classList.remove('selected', 'card-selected', 'current-active'));
      if (savedLayout) {
        try {
          localStorage.setItem('prezi_cards_layout_v2', JSON.stringify(savedLayout));
        } catch (e) {}
      }
      setupCardInteractions();
      
      // Re-enable ContentEditable for all text elements
      const editableSelectors = [
        '.hero-title', '.hero-subtitle', '.card-title-prezi', '.card-title-large',
        '.card-body-text', '.p-item', '.cmp-box', '.s-cap', '.m-card',
        '.cycle-box p', '.cycle-box h5', '.cycle-box', '.cy-badge', '.lenin-quote-strip p', '.spiral-quote',
        '.img-caption-tag', '.card-micro-quote', '.card-step-badge', '.card-header-badge', '.axis-svg-label',
        '.principles-dual-list strong', '.cmp-box strong', '.s-cap strong',
        'h1', 'h2', 'h3', 'h4', 'h5', 'p'
      ];
      document.querySelectorAll(editableSelectors.join(',')).forEach(el => {
        if (!el.closest('.prezi-topbar') && !el.closest('.prezi-sidebar') && !el.closest('.prezi-bottom-bar') && !el.closest('.card-action-bar')) {
          el.setAttribute('contenteditable', 'true');
          el.setAttribute('spellcheck', 'false');
        }
      });

      // Re-bind and upgrade all images to fully interactive
      upgradeAllImagesToInteractive();
      restoreLockBadges();
    }

    // Always dynamically sync STOPS and frame box from what is actually in the DOM!
    ensureOverviewFrameBox();
    syncStopsFromDOM();
    if (currentStopIndex === 0) {
      setTimeout(() => {
        goToStop(0, false);
      }, 60);
    }
  }

  function cleanUpLegacyCustomCards() {
    world.querySelectorAll('.canvas-card').forEach(el => {
      if (el.classList.contains('custom-added-card') || el.classList.contains('custom-added-text-box') || (el.querySelector('.card-body-text')?.textContent && el.querySelector('.card-body-text').textContent.includes('Quy luật phủ định của phủ định không chỉ là một lý thuyết'))) {
        const p = el.querySelector('.card-body-text') || el.querySelector('p');
        const textContent = p ? p.textContent.trim() : el.textContent.trim();
        if (textContent && textContent !== 'Khung Prezi mới' && textContent !== 'Click to edit text') {
          const newTextBox = document.createElement('div');
          newTextBox.className = 'prezi-textbox';
          newTextBox.id = `textbox-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          newTextBox.style.left = el.style.left || `${el.offsetLeft}px`;
          newTextBox.style.top = el.style.top || `${el.offsetTop}px`;
          newTextBox.innerHTML = `
            <div class="textbox-content" contenteditable="true" spellcheck="false">${textContent}</div>
            <div class="box-handle tl"></div>
            <div class="box-handle tr"></div>
            <div class="box-handle bl"></div>
            <div class="box-handle br"></div>
          `;
          world.appendChild(newTextBox);
          setupTextBox(newTextBox);
        }
        el.remove();
      }
    });
  }

  // Initialize
  cleanUpLegacyCustomCards();
  separateOverlappingFrames();
  ensureOverviewFrameBox();
  world.querySelectorAll('.prezi-textbox').forEach(setupTextBox);
  world.querySelectorAll('.canvas-slide-frame').forEach(setupSlideFrameInteractions);
  upgradeAllImagesToInteractive();
  restoreLockBadges();
  syncStopsFromDOM();
  setupCardInteractions();
  setupPanning();
  setupMarqueeSelection();
  setupContextMenu();
  generatePreziSpiral();
  setupControls();
  setupEditingEngine();

  // Initial state: Show Overview
  goToStop(0, false);
  setTimeout(() => {
    goToStop(0, false);
  }, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreziApp);
} else {
  initPreziApp();
}
