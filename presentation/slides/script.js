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
  window.STOPS = STOPS;

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
        <div class="thumb-card-preview">
          <img src="assets/images/thumb_overview.png" alt="Overview thumbnail" class="thumb-img-ov">
          <div class="thumb-home-icon">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
        </div>
        <span class="thumb-caption">Overview</span>
      `;
      ov.onclick = () => goToStop(0);
      framesList.appendChild(ov);
    }

    STOPS.slice(1).forEach((stop, index) => {
      const item = document.createElement('div');
      item.className = 'frame-thumb-item' + (currentStopIndex === index + 1 ? ' active' : '');
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

    const targetX = (vpRect.width - worldWidth * fitScale) / 2;
    const targetY = (vpRect.height - worldHeight * fitScale) / 2;

    return { x: targetX, y: targetY, scale: fitScale };
  }

  // Focus camera into a specific HTML element using exact coordinates relative to #prezi-world
  function getElementFocusTransform(el, scaleMultiplier = 1.0) {
    const vpRect = viewport.getBoundingClientRect();
    const wRect = world.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const currentScale = currentCamera.scale || 1;

    // Element's unscaled world coordinates relative to (0,0) of #prezi-world
    const elWorldX = (elRect.left - wRect.left) / currentScale;
    const elWorldY = (elRect.top - wRect.top) / currentScale;
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    const scaleX = (vpRect.width * 0.82) / elW;
    const scaleY = (vpRect.height * 0.82) / elH;
    let targetScale = Math.min(scaleX, scaleY) * scaleMultiplier;
    // Allow zoom range from 0.4 up to 2.4 so cards comfortably fill the viewport
    targetScale = Math.min(Math.max(targetScale, 0.4), 2.4);

    // Target (X, Y) centers the specific element in viewport
    const targetX = vpRect.width / 2 - (elWorldX + elW / 2) * targetScale;
    const targetY = vpRect.height / 2 - (elWorldY + elH / 2) * targetScale;

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

      if (!card.querySelector('.card-action-bar')) {
        const bar = document.createElement('div');
        bar.className = 'card-action-bar';
        bar.innerHTML = `
          <button type="button" class="card-action-btn btn-drag-handle" title="Bấm giữ và kéo để di chuyển thẻ">⋮⋮ Kéo di chuyển</button>
          <button type="button" class="card-action-btn btn-focus-card" title="Phóng to thẻ này">🎯 Focus</button>
          <button type="button" class="card-action-btn btn-dup-card" title="Nhân bản thẻ này">⧉ Nhân bản</button>
          <button type="button" class="card-action-btn btn-reset-card" title="Khôi phục kích thước & vị trí ban đầu">↺ Reset</button>
          <button type="button" class="card-action-btn btn-del btn-del-card" title="Xóa thẻ khỏi bài thuyết trình">🗑 Xóa</button>
        `;
        card.appendChild(bar);
      }
    });

    restoreCardsLayout();

    // Card Selection & Button clicks (DO NOT JUMP CAMERA ON EDIT CLICK)
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // If in present mode, ignore edit selection
        if (document.body.classList.contains('in-present-mode')) return;

        // If clicking on resize handle, handled by resize mousedown
        if (e.target.classList.contains('card-resize-handle')) return;

        // Action Bar: Focus button
        if (e.target.closest('.btn-focus-card')) {
          e.stopPropagation();
          const stopIdx = STOPS.findIndex(s => s.targetId === card.id);
          if (stopIdx >= 0) {
            goToStop(stopIdx);
          } else {
            const focus = getElementFocusTransform(card, 1.15);
            applyCamera(focus.x, focus.y, focus.scale, true);
          }
          return;
        }

        // Action Bar: Duplicate button
        if (e.target.closest('.btn-dup-card')) {
          e.stopPropagation();
          duplicateCard(card);
          return;
        }

        // Action Bar: Delete button
        if (e.target.closest('.btn-del-card')) {
          e.stopPropagation();
          deleteCard(card);
          return;
        }

        // Action Bar: Reset size & position
        if (e.target.closest('.btn-reset-card')) {
          e.stopPropagation();
          card.style.width = '';
          card.style.height = '';
          card.style.transform = '';
          saveCardsLayout();
          showToast('Đã khôi phục kích thước và vị trí ban đầu của thẻ.');
          return;
        }

        // Action Bar: Drag handle click
        if (e.target.closest('.btn-drag-handle')) return;

        // Select this card for editing and resizing
        document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected').forEach(c => {
          if (c !== card) c.classList.remove('card-selected');
        });
        card.classList.add('card-selected');

        // Highlight corresponding stop in sidebar without moving camera!
        const stopIdx = STOPS.findIndex(s => s.targetId === card.id);
        if (stopIdx >= 0) {
          currentStopIndex = stopIdx;
          currentStopTitle.textContent = STOPS[stopIdx].title;
          stopCounter.textContent = `Trạm ${stopIdx} / ${STOPS.length - 1}`;
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
      if (!activeResizeCard) return;

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
      const dragBtn = e.target.closest('.btn-drag-handle');
      if (!dragBtn) return;
      e.stopPropagation();
      e.preventDefault();

      activeDragCard = dragBtn.closest('.canvas-card, .canvas-item');
      if (!activeDragCard) return;

      dStartX = e.clientX;
      dStartY = e.clientY;

      const curTrans = activeDragCard.style.transform || '';
      const match = curTrans.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      dStartTransX = match ? parseFloat(match[1]) : 0;
      dStartTransY = match ? parseFloat(match[2]) : 0;
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
    const newStop = {
      id: newId,
      title: `${newIndex < 10 ? '0' + newIndex : newIndex}. ${cardTitle}`,
      targetId: newId,
      scaleOffset: 1.15,
      previewImg: 'assets/images/thumb_overview.png'
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

    const stopIdx = STOPS.findIndex(s => s.targetId === card.id);
    if (stopIdx >= 0) {
      STOPS.splice(stopIdx, 1);
    }
    card.remove();

    buildSidebar();
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
    STOPS.splice(1); // Keep only Overview
    buildSidebar();
    saveEditsToStorage();
    showToast('Đã dọn sạch toàn bộ các thẻ trên bản vẽ!');
    goToStop(0);
  }
  window.clearAllCards = clearAllCards;

  // Add a brand new frame / slide
  function addNewFrame() {
    const newIndex = STOPS.length;
    const newId = `stop-custom-${Date.now()}`;
    const newTitle = `${newIndex < 10 ? '0' + newIndex : newIndex}. Nội Dung Mới`;

    const vpRect = viewport.getBoundingClientRect();
    const centerX = (-currentCamera.x + vpRect.width / 2) / (currentCamera.scale || 1);
    const centerY = (-currentCamera.y + vpRect.height / 2) / (currentCamera.scale || 1);

    const newCard = document.createElement('div');
    newCard.className = 'canvas-card custom-added-card';
    newCard.id = newId;
    newCard.style.left = `${Math.round(centerX - 360)}px`;
    newCard.style.top = `${Math.round(centerY - 160)}px`;
    newCard.style.width = '720px';
    newCard.style.position = 'absolute';
    newCard.style.zIndex = 25;

    newCard.innerHTML = `
      <div class="card-inner-layout">
        <div class="card-text-col">
          <span class="card-step-badge">${newIndex}</span>
          <h3 class="card-title-prezi" contenteditable="true" spellcheck="false">Tiêu Đề Trạm Mới</h3>
          <p class="card-body-text" contenteditable="true" spellcheck="false">Nhập nội dung thuyết trình tại đây... Bạn có thể kéo 8 chốt quanh thẻ để thay đổi kích thước, chèn ảnh, hoặc kéo di chuyển tự do.</p>
        </div>
      </div>
    `;

    world.appendChild(newCard);

    const newStop = {
      id: newId,
      title: newTitle,
      targetId: newId,
      scaleOffset: 1.15,
      previewImg: 'assets/images/thumb_overview.png'
    };
    STOPS.push(newStop);

    buildSidebar();
    setupCardInteractions();
    setupEditingEngine();

    goToStop(newIndex);
    showToast(`Đã thêm trạm mới: Trạm ${newIndex}!`);
    saveEditsToStorage();
  }

  document.querySelectorAll('.btn-add-frame').forEach(btn => {
    btn.addEventListener('click', addNewFrame);
  });

  const btnClearAll = document.getElementById('btn-clear-all-cards');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', clearAllCards);
  }

  // 5. Drag/Pan Canvas Engine
  function setupPanning() {
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.canvas-card') || e.target.closest('.canvas-item') || e.target.closest('.user-image-wrapper') || e.target.closest('.nav-btn') || e.target.closest('.card-action-bar') || e.target.closest('.card-resize-handle') || e.target.closest('.prezi-floating-text-toolbar') || e.target.closest('.prezi-floating-image-toolbar')) return;
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
        world.style.transition = 'transform 0.4s ease-out';
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
      const vpRect = viewport.getBoundingClientRect();
      const cx = vpRect.width / 2;
      const cy = vpRect.height / 2;
      const oldScale = currentCamera.scale || 1;
      const newScale = Math.min(oldScale * 1.25, 3.2);
      const newX = cx - (cx - currentCamera.x) * (newScale / oldScale);
      const newY = cy - (cy - currentCamera.y) * (newScale / oldScale);
      applyCamera(newX, newY, newScale, true);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      const vpRect = viewport.getBoundingClientRect();
      const cx = vpRect.width / 2;
      const cy = vpRect.height / 2;
      const oldScale = currentCamera.scale || 1;
      const newScale = Math.max(oldScale * 0.8, 0.15);
      const newX = cx - (cx - currentCamera.x) * (newScale / oldScale);
      const newY = cy - (cy - currentCamera.y) * (newScale / oldScale);
      applyCamera(newX, newY, newScale, true);
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
      // 1. If typing inside an editable element or input:
      const activeEl = document.activeElement;
      const isEditingText = (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) ||
                            (e.target && e.target.closest && (e.target.closest('[contenteditable="true"]') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'));

      // Special shortcut: Ctrl + A (Select All)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        const targetText = (activeEl && activeEl.isContentEditable) ? activeEl : (selectedTextEl && document.contains(selectedTextEl) ? selectedTextEl : null);
        if (targetText) {
          e.preventDefault();
          targetText.focus();
          const range = document.createRange();
          range.selectNodeContents(targetText);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }

        // If a card is selected, select all text inside that card
        const selectedCard = document.querySelector('.canvas-card.card-selected');
        if (selectedCard) {
          const p = selectedCard.querySelector('[contenteditable="true"]');
          if (p) {
            e.preventDefault();
            p.focus();
            const range = document.createRange();
            range.selectNodeContents(selectedCard.querySelector('.card-inner-layout') || selectedCard);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
        }

        // On Canvas: Select all cards!
        e.preventDefault();
        const allCards = document.querySelectorAll('.canvas-card, .canvas-item, .user-image-wrapper');
        allCards.forEach(c => c.classList.add('card-selected'));
        showToast(`Đã chọn tất cả ${allCards.length} thẻ trên bài thuyết trình!`);
        return;
      }

      if (isEditingText) {
        // Do not intercept Spacebar, Arrow keys, etc. when typing!
        return;
      }

      // 2. Navigation shortcuts when NOT editing text
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

    // Click outside to hide toolbars
    document.addEventListener('mousedown', (e) => {
      if (textToolbar && !textToolbar.contains(e.target) && !e.target.isContentEditable) {
        textToolbar.classList.remove('show');
        if (selectedTextEl) selectedTextEl.classList.remove('prezi-selected-el');
        selectedTextEl = null;
      }
      if (imgToolbar && !imgToolbar.contains(e.target) && !e.target.classList.contains('prezi-selected-img') && !e.target.classList.contains('card-portrait-img') && !e.target.classList.contains('user-placed-image')) {
        imgToolbar.classList.remove('show');
        if (selectedImgEl) selectedImgEl.classList.remove('prezi-selected-img');
        selectedImgEl = null;
      }
    });

    // Positioning Floating Text Toolbar (Hình 2)
    function positionTextToolbar(targetEl) {
      if (!textToolbar || document.body.classList.contains('in-present-mode')) return;
      const rect = targetEl.getBoundingClientRect();
      textToolbar.style.top = `${Math.max(rect.top - 54, 56)}px`;
      textToolbar.style.left = `${Math.max(rect.left, 240)}px`;
      textToolbar.classList.add('show');
    }

    // Positioning Floating Image Toolbar (Hình 1)
    function positionImageToolbar(targetEl) {
      if (!imgToolbar || document.body.classList.contains('in-present-mode')) return;
      const rect = targetEl.getBoundingClientRect();
      imgToolbar.style.top = `${Math.max(rect.top - 54, 56)}px`;
      imgToolbar.style.left = `${Math.max(rect.left + rect.width / 2 - 120, 240)}px`;
      imgToolbar.classList.add('show');
    }

    upgradeAllImagesToInteractive();

    // Floating Text Toolbar Actions
    const btnBold = document.getElementById('btn-format-bold');
    if (btnBold) btnBold.addEventListener('click', () => { document.execCommand('bold', false, null); saveEditsToStorage(); });
    
    const btnItalic = document.getElementById('btn-format-italic');
    if (btnItalic) btnItalic.addEventListener('click', () => { document.execCommand('italic', false, null); saveEditsToStorage(); });
    
    const btnUnderline = document.getElementById('btn-format-underline');
    if (btnUnderline) btnUnderline.addEventListener('click', () => { document.execCommand('underline', false, null); saveEditsToStorage(); });

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

    const btnFontInc = document.getElementById('btn-font-inc');
    if (btnFontInc) btnFontInc.addEventListener('click', () => {
      if (selectedTextEl) {
        const cur = parseInt(window.getComputedStyle(selectedTextEl).fontSize) || 16;
        selectedTextEl.style.fontSize = `${cur + 2}px`;
        document.getElementById('fl-font-size').textContent = `${cur + 2}`;
        saveEditsToStorage();
      }
    });

    const btnFontDec = document.getElementById('btn-font-dec');
    if (btnFontDec) btnFontDec.addEventListener('click', () => {
      if (selectedTextEl) {
        const cur = parseInt(window.getComputedStyle(selectedTextEl).fontSize) || 16;
        if (cur > 10) {
          selectedTextEl.style.fontSize = `${cur - 2}px`;
          document.getElementById('fl-font-size').textContent = `${cur - 2}`;
          saveEditsToStorage();
        }
      }
    });

    const btnDelText = document.getElementById('btn-del-text-el');
    if (btnDelText) btnDelText.addEventListener('click', () => {
      if (selectedTextEl) {
        selectedTextEl.remove();
        if (textToolbar) textToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa khối văn bản.');
      }
    });

    // Floating Image Toolbar Actions (Hình 1: Replace, Edit, Crop, Delete)
    const replaceInput = document.getElementById('replace-file-input');
    if (replaceInput) {
      replaceInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !selectedImgEl) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          selectedImgEl.src = ev.target.result;
          saveEditsToStorage();
          showToast('Đã thay thế hình ảnh thành công!');
        };
        reader.readAsDataURL(file);
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

    const btnImgDel = document.getElementById('btn-img-delete');
    if (btnImgDel) btnImgDel.addEventListener('click', () => {
      if (selectedImgEl) {
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
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (selectedImgEl && document.contains(selectedImgEl)) {
            selectedImgEl.src = event.target.result;
            saveEditsToStorage();
            showToast('Đã thay thế ảnh thành công!');
          } else {
            placeImageOnCanvas(event.target.result);
          }
        };
        reader.readAsDataURL(file);
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
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (selectedImgEl && document.contains(selectedImgEl)) {
                  selectedImgEl.src = ev.target.result;
                  saveEditsToStorage();
                  showToast('Đã dán đè thay thế hình ảnh đang chọn!');
                } else {
                  placeImageOnCanvas(ev.target.result);
                  showToast('Đã dán hình ảnh trực tiếp từ bộ nhớ đệm (Clipboard)!');
                }
              };
              reader.readAsDataURL(blob);
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
          if (selectedImgEl && document.contains(selectedImgEl)) {
            selectedImgEl.src = img.src;
            saveEditsToStorage();
            showToast('Đã dán đè thay thế hình ảnh đang chọn!');
          } else {
            placeImageOnCanvas(img.src);
            showToast('Đã chèn hình ảnh sao chép từ trình duyệt!');
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
          if (selectedImgEl && document.contains(selectedImgEl)) {
            selectedImgEl.src = text;
            saveEditsToStorage();
            showToast('Đã dán đè thay thế hình ảnh đang chọn!');
          } else {
            placeImageOnCanvas(text);
            showToast('Đã dán hình ảnh từ đường dẫn URL!');
          }
          handled = true;
          return;
        }
      }

      // Check 4: Text Paste (Copy text from Web, PDF, Word, Notepad, etc.)
      if (!handled) {
        const plainText = clipboard.getData('text/plain');
        if (plainText && plainText.trim()) {
          // A. If user is currently focused inside a contenteditable element:
          if (document.activeElement && document.activeElement.isContentEditable) {
            e.preventDefault();
            document.execCommand('insertText', false, plainText);
            saveEditsToStorage();
            showToast('Đã dán văn bản!');
            handled = true;
            return;
          }

          // B. If a text element was previously clicked/selected:
          if (selectedTextEl && document.contains(selectedTextEl)) {
            e.preventDefault();
            selectedTextEl.focus();
            document.execCommand('insertText', false, plainText);
            saveEditsToStorage();
            showToast('Đã dán văn bản vào mục đang chọn!');
            handled = true;
            return;
          }

          // C. If an active/selected card is present, append a new editable paragraph:
          const targetCard = document.querySelector('.canvas-card.card-selected') || document.querySelector('.canvas-card.current-active') || document.getElementById('stop-01');
          if (targetCard) {
            e.preventDefault();
            const p = document.createElement('p');
            p.className = 'card-body-text';
            p.textContent = plainText;
            targetCard.appendChild(p);
            makeElementEditable(p);
            p.focus();
            saveEditsToStorage();
            showToast('Đã dán đoạn văn bản mới vào thẻ!');
            handled = true;
            return;
          }

          // D. Fallback: Create a floating text note on the canvas at view center
          e.preventDefault();
          const vpRect = viewport.getBoundingClientRect();
          const centerX = (-currentCamera.x + vpRect.width / 2) / (currentCamera.scale || 1);
          const centerY = (-currentCamera.y + vpRect.height / 2) / (currentCamera.scale || 1);

          const newBox = document.createElement('div');
          newBox.className = 'canvas-card custom-added-card';
          newBox.style.left = `${Math.round(centerX - 160)}px`;
          newBox.style.top = `${Math.round(centerY - 60)}px`;
          newBox.style.width = '360px';
          newBox.style.position = 'absolute';
          newBox.style.zIndex = '35';
          newBox.innerHTML = `
            <div class="card-inner-layout" style="padding: 14px;">
              <p class="card-body-text" contenteditable="true" spellcheck="false" style="margin: 0;">${plainText}</p>
            </div>
          `;
          world.appendChild(newBox);
          setupCardInteractions();
          const pEl = newBox.querySelector('p');
          if (pEl) {
            makeElementEditable(pEl);
            pEl.focus();
          }
          saveEditsToStorage();
          showToast('Đã dán đoạn văn bản mới lên bảng!');
          handled = true;
          return;
        }
      }
    });

    // Universal Keyboard Delete Shortcut (Delete or Backspace on selected card, image, or text block)
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      // 1. If actively typing text characters inside contenteditable, let native backspace/delete work!
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      // 2. If an image is selected:
      if (selectedImgEl && document.contains(selectedImgEl)) {
        e.preventDefault();
        const wrapper = selectedImgEl.closest('.user-image-wrapper') || selectedImgEl;
        wrapper.remove();
        selectedImgEl = null;
        if (imgToolbar) imgToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa hình ảnh.');
        return;
      }

      // 3. If an image wrapper is selected:
      const selectedImgWrapper = document.querySelector('.user-image-wrapper.selected');
      if (selectedImgWrapper) {
        e.preventDefault();
        selectedImgWrapper.remove();
        selectedImgEl = null;
        if (imgToolbar) imgToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa hình ảnh.');
        return;
      }

      // 4. If card(s) are selected on canvas:
      const selectedCards = Array.from(document.querySelectorAll('.canvas-card.card-selected, .canvas-item.card-selected'));
      if (selectedCards.length > 0) {
        e.preventDefault();
        selectedCards.forEach(c => deleteCard(c, true));
        return;
      }

      // 5. If a text block element is selected:
      if (selectedTextEl && document.contains(selectedTextEl)) {
        e.preventDefault();
        selectedTextEl.remove();
        selectedTextEl = null;
        if (textToolbar) textToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa khối văn bản.');
        return;
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
    imgToolbar.style.top = `${Math.max(rect.top - 54, 56)}px`;
    imgToolbar.style.left = `${Math.max(rect.left + rect.width / 2 - 120, 240)}px`;
    imgToolbar.classList.add('show');
  }

  // Attach full suite of interactive controls (Select, Resize, Drag, Delete, Double-click)
  function attachImageWrapperEvents(wrapper, img, resizeHandle, btnDel) {
    if (!wrapper || !img) return;

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
        wrapper.remove();
        selectedImgEl = null;
        const imgToolbar = document.getElementById('image-floating-toolbar');
        if (imgToolbar) imgToolbar.classList.remove('show');
        saveEditsToStorage();
        showToast('Đã xóa hình ảnh.');
      });
    }

    // 4. Drag & Reposition
    let isDraggingImg = false;
    let dragStartX = 0, dragStartY = 0;
    let imgInitTransX = 0, imgInitTransY = 0;
    let imgInitLeft = 0, imgInitTop = 0;
    let isPositionAbsolute = false;

    wrapper.addEventListener('mousedown', (e) => {
      if (e.target === resizeHandle || e.target === btnDel) return;
      if (document.body.classList.contains('in-present-mode')) return;
      e.stopPropagation();

      isDraggingImg = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      isPositionAbsolute = window.getComputedStyle(wrapper).position === 'absolute';
      if (isPositionAbsolute && !wrapper.style.transform) {
        imgInitLeft = wrapper.offsetLeft;
        imgInitTop = wrapper.offsetTop;
      } else {
        const curTrans = wrapper.style.transform || '';
        const match = curTrans.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        imgInitTransX = match ? parseFloat(match[1]) : 0;
        imgInitTransY = match ? parseFloat(match[2]) : 0;
      }
      wrapper.style.zIndex = '120';
    });

    // 5. Corner Resize Handle (Co giãn ảnh tự do)
    let isResizingImg = false;
    let resizeStartX = 0, resizeStartY = 0;
    let initW = 0, initH = 0;

    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        if (document.body.classList.contains('in-present-mode')) return;
        e.stopPropagation();
        e.preventDefault();
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
          wrapper.style.left = `${imgInitLeft + dx}px`;
          wrapper.style.top = `${imgInitTop + dy}px`;
        } else {
          wrapper.style.transform = `translate(${imgInitTransX + dx}px, ${imgInitTransY + dy}px)`;
        }
      } else if (isResizingImg) {
        const dx = (e.clientX - resizeStartX) / scale;
        const dy = (e.clientY - resizeStartY) / scale;
        wrapper.style.width = `${Math.max(initW + dx, 50)}px`;
        wrapper.style.height = `${Math.max(initH + dy, 40)}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingImg || isResizingImg) {
        isDraggingImg = false;
        isResizingImg = false;
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

  // Place and attach draggable listeners to an image
  function placeImageOnCanvas(srcDataUrl) {
    const activeCard = document.querySelector('.canvas-card.current-active');
    const container = activeCard || world;

    const wrapper = document.createElement('div');
    wrapper.className = 'user-image-wrapper';

    if (activeCard) {
      wrapper.style.position = 'relative';
      wrapper.style.margin = '14px 0';
      wrapper.style.width = '100%';
      wrapper.style.height = '180px';
    } else {
      const vpRect = viewport.getBoundingClientRect();
      const centerX = (-currentCamera.x + vpRect.width / 2) / (currentCamera.scale || 1);
      const centerY = (-currentCamera.y + vpRect.height / 2) / (currentCamera.scale || 1);
      wrapper.style.left = `${Math.round(centerX - 150)}px`;
      wrapper.style.top = `${Math.round(centerY - 100)}px`;
      wrapper.style.width = '280px';
      wrapper.style.height = '200px';
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
    container.appendChild(wrapper);

    wrapper.dataset.eventsBound = 'true';
    attachImageWrapperEvents(wrapper, img, resizeHandle, btnDel);
    saveEditsToStorage();
  }

  const PREZI_APP_VERSION = '2026.09.23_v11_curved_collapse_tab';
  if (localStorage.getItem('prezi_app_version') !== PREZI_APP_VERSION) {
    localStorage.removeItem('prezi_saved_world_content');
    localStorage.setItem('prezi_app_version', PREZI_APP_VERSION);
  }

  // Persistence with LocalStorage, IndexedDB & Cloudflare D1 Database
  let d1SyncTimer = null;
  async function saveEditsToStorage() {
    const saveIndicator = document.getElementById('save-status-indicator');
    const content = world.innerHTML;
    try {
      localStorage.setItem('prezi_saved_world_content', content);
    } catch (err) {
      // LocalStorage hit 5MB limit, fallback seamlessly to IndexedDB
    }
    await saveToIndexedDB('world_backup', content);
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
            cardsLayout: layout
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
        }
      } catch (e) {
        // Offline or running without Pages Functions
      }
    }, 600);
  }

  async function loadEditsFromStorage() {
    let savedContent = null;
    let savedLayout = null;

    // 1. Try loading from Cloudflare D1 database first
    try {
      const res = await fetch('/api/presentation');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.content) {
          savedContent = json.data.content;
          savedLayout = json.data.cardsLayout;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // 2. If not loaded from D1, fallback to LocalStorage & IndexedDB
    if (!savedContent) {
      savedContent = localStorage.getItem('prezi_saved_world_content');
      if (!savedContent) {
        savedContent = await loadFromIndexedDB('world_backup');
      }
    }

    if (savedContent) {
      world.innerHTML = savedContent;
      if (savedLayout) {
        try {
          localStorage.setItem('prezi_cards_layout_v2', JSON.stringify(savedLayout));
        } catch (e) {}
      }
      setupCardInteractions();
      
      // Re-enable ContentEditable
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
    }
  }


  // Initialize
  buildSidebar();
  setupCardInteractions();
  setupPanning();
  generatePreziSpiral();
  setupControls();
  setupEditingEngine();

  // Initial state: Show Overview
  setTimeout(() => {
    goToStop(0, false);
  }, 100);
});
