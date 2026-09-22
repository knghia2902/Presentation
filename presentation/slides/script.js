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

  // ==========================================================================
  // 8. INTERACTIVE EDITING & COPY-PASTE IMAGE ENGINE
  // Allows user to edit text, paste images from clipboard, and persist changes
  // ==========================================================================
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
    }, 2800);
  }

  function setupEditingEngine() {
    const saveIndicator = document.getElementById('save-status-indicator');

    // 1. Enable ContentEditable on all titles, subtitles, body text, cards
    const editableSelectors = [
      '.hero-title', '.hero-subtitle', '.card-title-prezi', '.card-title-large',
      '.card-body-text', '.p-item', '.cmp-box', '.s-cap', '.m-card',
      '.cycle-box p', '.cycle-box h5', '.lenin-quote-strip p', '.spiral-quote'
    ];

    document.querySelectorAll(editableSelectors.join(',')).forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');

      el.addEventListener('input', () => {
        if (saveIndicator) {
          saveIndicator.textContent = 'Đang có thay đổi...';
          saveIndicator.className = 'save-status-indicator saving';
        }
      });
      el.addEventListener('blur', () => {
        saveEditsToStorage();
      });
    });

    // 2. Add New Text box button
    const btnAddText = document.getElementById('btn-tool-text');
    if (btnAddText) {
      btnAddText.addEventListener('click', () => {
        const activeCard = document.querySelector('.canvas-card.current-active') || document.getElementById('stop-01');
        const p = document.createElement('p');
        p.className = 'card-body-text';
        p.setAttribute('contenteditable', 'true');
        p.textContent = 'Nhập nội dung mới tại đây...';
        activeCard.appendChild(p);
        p.focus();
        showToast('Đã thêm khối văn bản mới. Nhập trực tiếp để chỉnh sửa!');
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
          placeImageOnCanvas(event.target.result);
        };
        reader.readAsDataURL(file);
      });
    }

    // 4. COPY - PASTE (CTRL+V) IMAGE FROM ANYWHERE DIRECTLY ONTO CANVAS
    window.addEventListener('paste', (e) => {
      // If user is editing text and pasting plain text, let default behavior run
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
              placeImageOnCanvas(event.target.result);
              showToast('Đã dán hình ảnh vào bản đồ thành công! Bạn có thể kéo thả để đổi vị trí.');
            };
            reader.readAsDataURL(blob);
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
        showToast('Đã lưu toàn bộ bản thảo vào trình duyệt!');
      });
    }

    // Load previously saved edits if any
    loadEditsFromStorage();
  }

  // Helper to place and make image draggable on canvas
  function placeImageOnCanvas(srcDataUrl, posX = null, posY = null) {
    const activeCard = document.querySelector('.canvas-card.current-active');
    const container = activeCard || world;

    const wrapper = document.createElement('div');
    wrapper.className = 'user-image-wrapper';

    // Position near current focus or center of card
    if (posX !== null && posY !== null) {
      wrapper.style.left = `${posX}px`;
      wrapper.style.top = `${posY}px`;
    } else if (activeCard) {
      wrapper.style.position = 'relative';
      wrapper.style.marginTop = '14px';
    } else {
      wrapper.style.left = '1200px';
      wrapper.style.top = '600px';
    }

    const img = document.createElement('img');
    img.src = srcDataUrl;
    img.className = 'user-placed-image';
    img.alt = 'User added image';

    const btnDel = document.createElement('button');
    btnDel.className = 'btn-del-img';
    btnDel.innerHTML = '✕';
    btnDel.title = 'Xóa ảnh này';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.remove();
      saveEditsToStorage();
      showToast('Đã xóa hình ảnh.');
    });

    wrapper.appendChild(img);
    wrapper.appendChild(btnDel);
    container.appendChild(wrapper);

    // Make Draggable
    let isDraggingImg = false;
    let dragStartX = 0, dragStartY = 0;
    let imgInitX = 0, imgInitY = 0;

    img.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDraggingImg = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      imgInitX = wrapper.offsetLeft;
      imgInitY = wrapper.offsetTop;
      wrapper.style.position = 'absolute';
      wrapper.style.zIndex = 100;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingImg) return;
      const dx = (e.clientX - dragStartX) / (currentCamera.scale || 1);
      const dy = (e.clientY - dragStartY) / (currentCamera.scale || 1);
      wrapper.style.left = `${imgInitX + dx}px`;
      wrapper.style.top = `${imgInitY + dy}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingImg) {
        isDraggingImg = false;
        saveEditsToStorage();
      }
    });

    saveEditsToStorage();
  }

  function saveEditsToStorage() {
    const saveIndicator = document.getElementById('save-status-indicator');
    try {
      localStorage.setItem('prezi_saved_world_content', world.innerHTML);
      if (saveIndicator) {
        saveIndicator.textContent = 'Đã lưu tự động';
        saveIndicator.className = 'save-status-indicator saved';
      }
    } catch (err) {
      console.warn('LocalStorage limit exceeded or private mode', err);
    }
  }

  function loadEditsFromStorage() {
    const saved = localStorage.getItem('prezi_saved_world_content');
    if (saved) {
      // Re-hydrate saved content
      world.innerHTML = saved;
      // Rebind card clicks
      setupClickableCards();
      // Rebind editable attributes
      const editableSelectors = [
        '.hero-title', '.hero-subtitle', '.card-title-prezi', '.card-title-large',
        '.card-body-text', '.p-item', '.cmp-box', '.s-cap', '.m-card',
        '.cycle-box p', '.cycle-box h5', '.lenin-quote-strip p', '.spiral-quote'
      ];
      document.querySelectorAll(editableSelectors.join(',')).forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      });
      // Re-bind delete buttons for user images
      document.querySelectorAll('.btn-del-img').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          btn.parentElement.remove();
          saveEditsToStorage();
        });
      });
    }
  }

  // Initialize
  buildSidebar();
  setupClickableCards();
  setupPanning();
  generatePreziSpiral();
  setupControls();
  setupEditingEngine();

  // Initial state: Show Overview
  setTimeout(() => {
    goToStop(0, false);
  }, 100);
});
