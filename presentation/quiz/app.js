const ANSWERS = ['A', 'B', 'C', 'D'];
const QUESTION_COUNT = 20;
const SAVE_COPY = {
  saving: 'Đang lưu kết quả',
  success: 'Đã lưu bảng xếp hạng chung',
  fallback: 'Chưa lưu được — kết quả phòng vẫn còn'
};

function cleanOptions(options = {}) {
  return Object.fromEntries(ANSWERS.map((letter) => [letter, String(options[letter] ?? '')]));
}

export function resolveQuestion(snapshot, questionBank = { questions: [] }) {
  const remote = snapshot?.question || {};
  const id = remote.id || remote.qID || `q${String(Number(snapshot?.questionIndex ?? 0) + 1).padStart(2, '0')}`;
  const local = (questionBank.questions || []).find((question) => question.id === id);
  const source = local || remote;
  return {
    id,
    prompt: String(source.prompt || ''),
    options: cleanOptions(source.options)
  };
}

export function projectSnapshot(snapshot, role = 'player', questionBank = { questions: [] }) {
  const question = snapshot?.question ? resolveQuestion(snapshot, questionBank) : null;
  const reveal = snapshot?.reveal || null;
  const player = (snapshot?.participants || []).find((candidate) => candidate.role === role);
  const activeAnswer = player && snapshot?.answers ? snapshot.answers[player.playerId] : null;
  return {
    role,
    phase: snapshot?.phase || 'lobby',
    roomCode: String(snapshot?.roomCode || ''),
    questionIndex: Number(snapshot?.questionIndex ?? -1),
    question,
    reveal: reveal ? {
      correctOption: ANSWERS.includes(reveal.correctOption) ? reveal.correctOption : null,
      explanation: String(reveal.explanation || ''),
      reason: String(reveal.reason || '')
    } : null,
    activeAnswer: activeAnswer ? { accepted: true } : null,
    leaderboard: Array.isArray(snapshot?.leaderboard) ? snapshot.leaderboard : [],
    finalResults: Array.isArray(snapshot?.finalResults) ? snapshot.finalResults : [],
    deadlineAt: snapshot?.deadlineAt || null,
    serverNow: snapshot?.serverNow || null,
    remainingMs: snapshot?.remainingMs ?? null,
    autoAdvance: Boolean(snapshot?.autoAdvance),
    announcement: snapshot?.announcement ? String(snapshot.announcement.text || '') : ''
  };
}

function text(node, value) {
  if (node) node.textContent = value == null ? '' : String(value);
}

function formatScore(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} điểm`;
}

function roomWebSocketUrl(windowRef, roomCode, session, reconnectToken) {
  const location = windowRef?.location || { protocol: 'http:', host: 'localhost' };
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const query = new URLSearchParams({
    playerId: session.playerId,
    capabilityToken: session.capabilityToken
  });
  if (reconnectToken) query.set('reconnectToken', reconnectToken);
  return `${protocol}//${location.host}/api/quiz/rooms/${encodeURIComponent(roomCode)}/socket?${query}`;
}

export function createQuizController(options = {}) {
  const documentRef = options.documentRef || (typeof document !== 'undefined' ? document : null);
  const windowRef = options.windowRef || (typeof window !== 'undefined' ? window : globalThis);
  const fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
  const root = options.root || documentRef;
  const questionBank = options.questionBank || { questions: [] };
  const commandTransport = options.commandTransport || null;
  const now = options.now || (() => Date.now());
  const state = {
    role: null,
    session: null,
    snapshot: null,
    phase: 'entry',
    connection: 'disconnected',
    clockOffset: 0,
    globalLeaderboard: [],
    globalState: 'idle',
    saveState: 'idle',
    answerSubmitted: false,
    lastQuestionId: null,
    warned: new Set(),
    lastResult: null,
    socket: null,
    reconnectTimer: null,
    finalizing: false,
    timerHandle: null,
    previousFocus: null
  };

  const query = (selector) => root?.querySelector?.(selector) || null;
  const queryAll = (selector) => [...(root?.querySelectorAll?.(selector) || [])];
  const byRole = (role) => query(`[data-role="${role}"]`);
  const action = (name) => query(`[data-action="${name}"]`);

  function storage() {
    try { return windowRef?.localStorage || null; } catch { return null; }
  }

  function persistSession() {
    const store = storage();
    if (!store || !state.session) return;
    try { store.setItem('quiz_room_session', JSON.stringify(state.session)); } catch { /* metadata is optional */ }
  }

  function setConnection(status, copy) {
    state.connection = status;
    const band = byRole('status-band');
    if (band) band.dataset.state = status;
    text(byRole('connection-status'), copy || ({ connected: 'Đã kết nối', reconnecting: 'Mất kết nối. Đang thử kết nối lại…', offline: 'Mất kết nối' }[status] || 'Đang kết nối'));
  }

  async function request(url, init) {
    if (!fetchImpl) throw new Error('fetch_unavailable');
    const response = await fetchImpl(url, init);
    let body = {};
    try { body = await response.json(); } catch { body = {}; }
    if (!response.ok || body.ok === false) {
      const error = new Error(body.error || 'Dịch vụ quiz tạm thời không khả dụng.');
      error.code = body.code;
      error.status = response.status;
      throw error;
    }
    return body;
  }

  function showScreen(name) {
    state.phase = name;
    queryAll('[data-screen]').forEach((screen) => {
      const visible = screen.dataset.screen === name;
      screen.hidden = !visible;
      screen.setAttribute('aria-hidden', String(!visible));
    });
    const shell = byRole('quiz-shell');
    if (shell) shell.dataset.state = name;
  }

  function setRole(role) {
    state.role = role;
    text(byRole('role-badge'), role === 'host' ? 'Chủ phòng' : 'Người chơi');
    const badge = byRole('role-badge');
    if (badge) badge.hidden = false;
  }

  function renderParticipants(participants = []) {
    const list = byRole('participant-list');
    if (list && documentRef) {
      list.replaceChildren();
      participants.filter((candidate) => candidate.role === 'player').forEach((participant) => {
        const row = documentRef.createElement('li');
        row.className = 'participant-row';
        const name = documentRef.createElement('span');
        text(name, participant.displayName);
        const status = documentRef.createElement('span');
        status.className = 'participant-status';
        status.dataset.state = participant.status === 'online' ? 'online' : 'offline';
        text(status, participant.status === 'online' ? 'Đang trực tuyến' : 'Đang ngoại tuyến');
        row.append(name, status);
        list.append(row);
      });
    }
    text(byRole('participant-count'), String(participants.filter((candidate) => candidate.role === 'player').length));
    text(byRole('participant-count-player'), String(participants.length));
  }

  function renderLeaderboard(rows, listRole, emptyRole, countRole) {
    const list = byRole(listRole);
    const empty = byRole(emptyRole);
    if (list && documentRef) {
      list.replaceChildren();
      rows.forEach((rowData, index) => {
        const row = documentRef.createElement('li');
        row.className = 'leaderboard-row';
        const rank = documentRef.createElement('span');
        rank.className = 'rank';
        text(rank, String(rowData.rank || index + 1));
        const name = documentRef.createElement('span');
        name.className = 'leaderboard-name';
        text(name, rowData.displayName || 'Người chơi');
        const score = documentRef.createElement('span');
        score.className = 'score';
        text(score, formatScore(rowData.totalScore));
        row.append(rank, name, score);
        list.append(row);
      });
    }
    if (empty) empty.hidden = rows.length > 0;
    text(byRole(countRole), rows.length ? `${rows.length} người` : '');
  }

  function renderQuestion(snapshot) {
    const projected = projectSnapshot(snapshot, state.role, questionBank);
    const question = projected.question;
    if (!question) {
      text(byRole('error-message'), 'Không thể tải bộ câu hỏi. Vui lòng thử lại.');
      return;
    }
    text(byRole('question-progress'), `Câu ${projected.questionIndex + 1}/${QUESTION_COUNT}`);
    text(byRole('question-heading'), question.prompt);
    const remaining = snapshot.phase === 'paused_host_disconnect'
      ? Number(projected.remainingMs || 0)
      : projected.deadlineAt
        ? Math.max(0, Number(projected.deadlineAt) - (now() - state.clockOffset))
        : Number(projected.remainingMs || 0);
    updateTimer(remaining, snapshot.phase === 'paused_host_disconnect');
    const hostAnswers = byRole('host-answers');
    if (hostAnswers && documentRef) {
      hostAnswers.replaceChildren();
      ANSWERS.forEach((letter) => {
        const row = documentRef.createElement('div');
        row.className = 'answer-option';
        const marker = documentRef.createElement('span');
        marker.className = 'answer-letter';
        text(marker, letter);
        const answer = documentRef.createElement('span');
        text(answer, question.options[letter]);
        row.append(marker, answer);
        hostAnswers.append(row);
      });
    }
    ANSWERS.forEach((letter) => text(query(`[data-answer-text="${letter}"]`), question.options[letter]));
    const isPlayerQuestion = state.role === 'player' && snapshot.phase === 'question';
    queryAll('[data-answer]').forEach((button) => {
      button.hidden = !isPlayerQuestion;
      button.disabled = !isPlayerQuestion || state.answerSubmitted;
      if (state.answerSubmitted && snapshot.answers?.[state.session?.playerId]?.accepted) button.dataset.state = 'selected';
    });
    if (hostAnswers) hostAnswers.hidden = state.role !== 'host';
    const shortcut = byRole('shortcut-help');
    if (shortcut) shortcut.hidden = !isPlayerQuestion;
    text(byRole('answer-count'), state.role === 'host' ? `${Object.values(snapshot.answers || {}).filter(Boolean).length} đã trả lời` : '');
    text(byRole('answer-status'), state.answerSubmitted ? 'Đã ghi nhận câu trả lời.' : '');
  }

  function updateTimer(remainingMs, paused = false) {
    const seconds = Math.max(0, Math.ceil(Number(remainingMs || 0) / 1000));
    const timer = byRole('timer');
    text(byRole('timer-value'), String(seconds));
    if (timer) {
      const status = paused ? 'paused' : seconds <= 0 ? 'expired' : seconds <= 5 ? 'critical' : seconds <= 10 ? 'warning' : 'normal';
      timer.dataset.state = status;
      timer.setAttribute('aria-label', paused ? 'Phòng đang tạm dừng' : `Còn ${seconds} giây`);
    }
    const progress = byRole('timer-progress');
    if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, seconds / 30))})`;
    if (!paused && (seconds === 10 || seconds === 5) && !state.warned.has(seconds)) {
      state.warned.add(seconds);
      announce(`Còn ${seconds} giây`);
    }
  }

  function syncTimerLoop(phase) {
    if (phase === 'question' && !state.timerHandle && windowRef?.setInterval) {
      state.timerHandle = windowRef.setInterval(() => {
        if (state.snapshot?.phase === 'question') renderQuestion(state.snapshot);
        else syncTimerLoop(state.snapshot?.phase);
      }, 250);
    } else if (phase !== 'question' && state.timerHandle && windowRef?.clearInterval) {
      windowRef.clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function renderReveal(snapshot) {
    const question = resolveQuestion(snapshot, questionBank);
    const reveal = snapshot.reveal || {};
    const correct = ANSWERS.includes(reveal.correctOption) ? reveal.correctOption : '';
    text(byRole('correct-answer'), correct ? `Đáp án đúng: ${correct}. ${question.options[correct] || ''}` : '');
    text(byRole('explanation'), reveal.explanation || '');
    const mine = snapshot.leaderboard?.find((row) => row.playerId === state.session?.playerId);
    const answerAccepted = Boolean(snapshot.answers?.[state.session?.playerId]);
    if (!answerAccepted) text(byRole('result-message'), 'Bạn chưa chọn đáp án. Câu này được tính 0 điểm.');
    else if (mine) text(byRole('result-message'), `Kết quả hiện tại: ${formatScore(mine.totalScore)}.`);
    else text(byRole('result-message'), 'Đã ghi nhận câu trả lời.');
    announce(snapshot.announcement?.text || '');
  }

  function renderFinished(snapshot) {
    const mine = (snapshot.finalResults || snapshot.leaderboard || []).find((row) => row.playerId === state.session?.playerId);
    text(byRole('final-score'), String(mine?.totalScore || 0).toLocaleString('vi-VN'));
    text(byRole('final-rank'), mine ? `Xếp hạng ${mine.rank}` : '');
    text(byRole('final-announcement'), snapshot.announcement?.text || '');
    renderLeaderboard(snapshot.leaderboard || [], 'leaderboard-list', 'room-leaderboard-empty', 'leaderboard-count');
  }

  function render() {
    const snapshot = state.snapshot;
    if (!snapshot) {
      showScreen(state.phase === 'entry' ? 'entry' : state.phase);
      return;
    }
    const phase = snapshot.phase;
    syncTimerLoop(phase);
    if (phase === 'finished') showScreen('room');
    else if (phase === 'lobby') showScreen('room');
    else showScreen('room');
    const hostLobby = byRole('host-lobby');
    const playerLobby = byRole('player-lobby');
    const questionPanel = byRole('question-panel');
    const revealPanel = byRole('reveal-panel');
    const finishedPanel = byRole('finished-panel');
    const hostRail = byRole('host-rail');
    const pausedPanel = byRole('paused-panel');
    [hostLobby, playerLobby, questionPanel, revealPanel, finishedPanel, hostRail].forEach((node) => { if (node) node.hidden = true; });
    if (pausedPanel) pausedPanel.hidden = phase !== 'paused_host_disconnect';
    text(byRole('room-code'), snapshot.roomCode || state.session?.roomCode || '');
    text(byRole('player-name'), state.session?.displayName || '');
    renderParticipants(snapshot.participants || []);
    renderLeaderboard(snapshot.leaderboard || [], 'leaderboard-list', 'room-leaderboard-empty', 'leaderboard-count');
    const globalPanel = byRole('global-leaderboard');
    if (globalPanel) globalPanel.hidden = phase !== 'finished';
    renderLeaderboard(state.globalLeaderboard, 'global-leaderboard-list', 'global-leaderboard-empty', 'global-leaderboard-count');
    const globalEmpty = byRole('global-leaderboard-empty');
    const globalError = byRole('global-leaderboard-error');
    const globalSave = byRole('global-save-state');
    if (globalEmpty) globalEmpty.hidden = state.globalState === 'loading' || state.globalState === 'error' || state.globalLeaderboard.length > 0;
    if (globalError) globalError.hidden = state.globalState !== 'error';
    if (globalSave) {
      globalSave.dataset.state = state.globalState === 'error' ? 'error' : state.globalState === 'success' ? 'success' : '';
      text(globalSave, state.globalState === 'loading' ? 'Đang tải bảng xếp hạng chung…' : state.globalState === 'success' ? SAVE_COPY.success : state.globalState === 'error' ? SAVE_COPY.fallback : '');
    }
    if (state.role === 'host' && hostRail) hostRail.hidden = false;
    if (phase === 'lobby') {
      if (state.role === 'host' && hostLobby) hostLobby.hidden = false;
      if (state.role === 'player' && playerLobby) playerLobby.hidden = false;
    } else if (phase === 'question' || phase === 'paused_host_disconnect') {
      if (questionPanel) questionPanel.hidden = false;
      renderQuestion(snapshot);
      if (phase === 'paused_host_disconnect') updateTimer(snapshot.remainingMs, true);
    } else if (phase === 'reveal') {
      if (revealPanel) revealPanel.hidden = false;
      renderReveal(snapshot);
    } else if (phase === 'finished') {
      if (finishedPanel) finishedPanel.hidden = false;
      renderFinished(snapshot);
      const saveState = byRole('save-state');
      if (saveState) { saveState.dataset.state = state.saveState; text(saveState, SAVE_COPY[state.saveState] || ''); }
    }
    const paused = phase === 'paused_host_disconnect';
    const pauseBanner = byRole('pause-banner');
    if (pauseBanner) pauseBanner.hidden = !paused;
    const status = byRole('status-band');
    if (status) status.dataset.state = state.connection;
  }

  function announce(message) {
    text(byRole('announcement'), message);
    text(byRole('announcement-footer'), message || 'Bạn sẽ luôn thấy thông báo bằng chữ khi âm thanh bị tắt.');
  }

  async function sendCommand(command) {
    if (commandTransport) return commandTransport(command, state);
    if (!state.socket || state.socket.readyState !== 1) throw new Error('socket_unavailable');
    state.socket.send(JSON.stringify(command));
    return null;
  }

  async function submitAnswer(option) {
    if (state.role !== 'player' || state.snapshot?.phase !== 'question' || state.answerSubmitted || !ANSWERS.includes(option)) return false;
    state.answerSubmitted = true;
    queryAll('[data-answer]').forEach((button) => { button.disabled = true; });
    query(`[data-answer="${option}"]`)?.setAttribute('data-state', 'selected');
    try {
      const result = await sendCommand({ type: 'answer', option });
      if (result) applyMessage(result);
      text(byRole('answer-status'), 'Đã ghi nhận câu trả lời.');
      return true;
    } catch (error) {
      state.answerSubmitted = false;
      queryAll('[data-answer]').forEach((button) => { button.disabled = false; });
      text(byRole('answer-status'), error.message || 'Không thể ghi nhận câu trả lời.');
      return false;
    }
  }

  async function createOrJoin(event, role) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = { type: role === 'host' ? 'create' : 'join', role, nickname: values.nickname };
    if (role === 'player') payload.roomCode = String(values.roomCode || '').trim().toUpperCase();
    try {
      setConnection('reconnecting', 'Đang kết nối');
      const body = await request('/api/quiz/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      state.session = { ...body.player, roomCode: body.snapshot.roomCode, capabilityToken: body.capabilityToken, reconnectToken: body.reconnectToken };
      persistSession();
      state.snapshot = body.snapshot;
      setRole(role);
      setConnection('connected');
      render();
      byRole(role === 'host' ? 'host-lobby-heading' : 'player-lobby-heading')?.focus();
      connectSocket();
    } catch (error) {
      setConnection('offline');
      const target = role === 'host' ? byRole('host-nickname-error') : (error.code === 'invalid_nickname' ? byRole('player-nickname-error') : byRole('room-code-error'));
      if (target) { target.hidden = false; text(target, error.message || 'Không thể kết nối.'); }
    }
  }

  function connectSocket() {
    if (!state.session || !windowRef) return;
    const factory = options.webSocketFactory || ((url) => new windowRef.WebSocket(url));
    try {
      state.socket = factory(roomWebSocketUrl(windowRef, state.session.roomCode, state.session, state.session.reconnectToken));
      state.socket.addEventListener?.('open', () => { setConnection('connected'); render(); });
      state.socket.addEventListener?.('message', (event) => { try { applyMessage(JSON.parse(event.data)); } catch { /* protocol errors arrive as structured server events */ } });
      state.socket.addEventListener?.('close', () => {
        state.socket = null;
        setConnection('reconnecting');
        render();
        if (!state.reconnectTimer) state.reconnectTimer = windowRef.setTimeout(() => { state.reconnectTimer = null; connectSocket(); }, 1500);
      });
      state.socket.addEventListener?.('error', () => setConnection('reconnecting'));
    } catch {
      setConnection('offline');
      render();
    }
  }

  async function loadGlobalLeaderboard() {
    if (!state.session) return;
    state.globalState = 'loading';
    render();
    try {
      const params = new URLSearchParams({ roomCode: state.session.roomCode, playerId: state.session.playerId, capabilityToken: state.session.capabilityToken });
      const body = await request(`/api/leaderboard?${params}`);
      state.globalLeaderboard = Array.isArray(body.globalLeaderboard) ? body.globalLeaderboard : [];
      state.globalState = 'success';
      state.saveState = 'success';
    } catch {
      state.globalState = 'error';
      state.saveState = 'fallback';
    }
    render();
  }

  async function persistFinalResult() {
    if (state.finalizing || !state.session || state.snapshot?.phase !== 'finished') return;
    state.finalizing = true;
    state.saveState = 'saving';
    render();
    let scoreSaved = true;
    try {
      const resultId = state.snapshot.resultId || `${state.session.roomCode}:${state.session.playerId}`;
      await request('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        roomCode: state.session.roomCode,
        playerId: state.session.playerId,
        capabilityToken: state.session.capabilityToken,
        resultId
      }) });
    } catch {
      scoreSaved = false;
      state.saveState = 'fallback';
    }
    await loadGlobalLeaderboard();
    if (!scoreSaved) state.saveState = 'fallback';
    state.finalizing = false;
    render();
  }

  function applyMessage(payload) {
    if (!payload || typeof payload !== 'object') return;
    if (payload.event === 'error' || payload.ok === false) {
      text(byRole('error-message'), payload.error || 'Chưa thể kết nối lại. Kiểm tra mạng rồi thử lại.');
      if (!state.snapshot) showScreen('error');
      return;
    }
    if (payload.snapshot) {
      const previousPhase = state.snapshot?.phase;
      state.snapshot = payload.snapshot;
      if (Number.isFinite(Number(payload.snapshot.serverNow))) state.clockOffset = now() - Number(payload.snapshot.serverNow);
      const questionId = payload.snapshot.question?.id;
      if (questionId !== state.lastQuestionId) {
        state.lastQuestionId = questionId;
        state.answerSubmitted = Boolean(payload.snapshot.answers?.[state.session?.playerId]);
        state.warned.clear();
        byRole('question-heading')?.focus();
      }
      if (payload.event === 'correct' || payload.event === 'incorrect') state.lastResult = payload.result || null;
      if (payload.event === 'finished' || payload.snapshot.phase === 'finished') {
        state.saveState = 'saving';
      }
      render();
      if (payload.event === 'finished' || payload.snapshot.phase === 'finished') persistFinalResult();
      if (previousPhase !== 'question' && payload.snapshot.phase === 'question') byRole('question-heading')?.focus();
    }
  }

  function openConfirmation() {
    const dialog = byRole('confirm-dialog');
    if (!dialog) return;
    state.previousFocus = documentRef?.activeElement || null;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    dialog.querySelector('[data-action="cancel-confirm"]')?.focus();
  }

  function closeConfirmation() {
    const dialog = byRole('confirm-dialog');
    if (dialog?.open && typeof dialog.close === 'function') dialog.close(); else dialog?.removeAttribute('open');
    state.previousFocus?.focus?.();
    state.previousFocus = null;
  }

  async function copyRoomCode() {
    const code = state.snapshot?.roomCode || state.session?.roomCode || '';
    if (!code) return;
    let copied = false;
    try { if (windowRef.navigator?.clipboard?.writeText) { await windowRef.navigator.clipboard.writeText(code); copied = true; } } catch { copied = false; }
    if (!copied && documentRef) {
      const selection = documentRef.getSelection?.();
      const range = documentRef.createRange?.();
      const node = byRole('room-code');
      try { if (range && selection && node) { range.selectNodeContents(node); selection.removeAllRanges(); selection.addRange(range); copied = documentRef.execCommand?.('copy') || false; selection.removeAllRanges(); } } catch { copied = false; }
    }
    text(byRole('copy-feedback'), copied ? 'Đã sao chép mã phòng' : 'Mã phòng đã được chọn, bạn có thể sao chép.');
  }

  async function shareRoom() {
    const code = state.snapshot?.roomCode || state.session?.roomCode || '';
    try { if (windowRef.navigator?.share) await windowRef.navigator.share({ title: 'Phòng chơi Triết học', text: `Tham gia phòng ${code}` }); else await copyRoomCode(); } catch { /* user cancellation is not an error */ }
  }

  function onKeydown(event) {
    const dialog = byRole('confirm-dialog');
    if (dialog?.open) {
      if (event.key === 'Escape') { event.preventDefault(); closeConfirmation(); return; }
      if (event.key === 'Tab') {
        const focusable = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((node) => !node.disabled && !node.hidden);
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && documentRef.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && documentRef.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
      return;
    }
    if (state.role !== 'player' || state.snapshot?.phase !== 'question' || state.answerSubmitted) return;
    const map = { a: 'A', b: 'B', c: 'C', d: 'D', '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
    const option = map[String(event.key || '').toLowerCase()];
    if (!option || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)) return;
    event.preventDefault();
    submitAnswer(option);
  }

  function bind() {
    if (!root?.addEventListener) return;
    action('show-create')?.addEventListener('click', () => showScreen('create'));
    action('show-join')?.addEventListener('click', () => showScreen('join'));
    query('[data-form="create"]')?.addEventListener('submit', (event) => createOrJoin(event, 'host'));
    query('[data-form="join"]')?.addEventListener('submit', (event) => createOrJoin(event, 'player'));
    queryAll('[data-action="back-entry"]').forEach((node) => node.addEventListener('click', () => showScreen('entry')));
    queryAll('[data-answer]').forEach((node) => node.addEventListener('click', () => submitAnswer(node.dataset.answer)));
    action('start-quiz')?.addEventListener('click', () => { if (state.role === 'host') sendCommand({ type: 'start' }); });
    action('next-question')?.addEventListener('click', () => { if (state.role === 'host') sendCommand({ type: 'next' }); });
    action('toggle-auto')?.addEventListener('change', (event) => { if (state.role === 'host') sendCommand({ type: 'setAutoAdvance', enabled: event.target.checked }); });
    action('finish-quiz')?.addEventListener('click', () => { if (state.role === 'host') openConfirmation(); });
    action('confirm-finish')?.addEventListener('click', () => { if (state.role === 'host') { closeConfirmation(); sendCommand({ type: 'finish' }); } });
    action('cancel-confirm')?.addEventListener('click', closeConfirmation);
    action('copy-code')?.addEventListener('click', copyRoomCode);
    action('share-room')?.addEventListener('click', shareRoom);
    action('load-global')?.addEventListener('click', loadGlobalLeaderboard);
    action('new-room')?.addEventListener('click', () => { state.session = null; state.snapshot = null; state.role = null; showScreen('entry'); });
    action('retry')?.addEventListener('click', () => state.session ? connectSocket() : showScreen('entry'));
    action('toggle-audio')?.addEventListener('click', (event) => {
      const pressed = event.currentTarget.getAttribute('aria-pressed') === 'true';
      event.currentTarget.setAttribute('aria-pressed', String(!pressed));
      text(byRole('audio-label'), pressed ? 'Bật âm thanh' : 'Tắt âm thanh');
    });
    byRole('confirm-dialog')?.addEventListener('click', (event) => { if (event.target === event.currentTarget) closeConfirmation(); });
    windowRef?.addEventListener?.('keydown', onKeydown);
  }

  async function start() {
    bind();
    setConnection('disconnected', 'Đang kết nối');
    render();
    if (!state.session) return;
    setRole(state.session.role);
    try {
      const params = new URLSearchParams({ roomCode: state.session.roomCode, playerId: state.session.playerId, capabilityToken: state.session.capabilityToken });
      const body = await request(`/api/quiz/rooms?${params}`);
      state.snapshot = body.snapshot;
      setConnection('connected');
      render();
      connectSocket();
    } catch { setConnection('reconnecting'); render(); connectSocket(); }
  }

  return { state, start, bind, render, applyMessage, sendCommand, submitAnswer, loadGlobalLeaderboard, persistFinalResult, copyRoomCode, project: () => projectSnapshot(state.snapshot, state.role, questionBank) };
}

if (typeof document !== 'undefined' && document.querySelector('[data-role="quiz-shell"]')) {
  const controller = createQuizController();
  window.quizController = controller;
  controller.start();
}
