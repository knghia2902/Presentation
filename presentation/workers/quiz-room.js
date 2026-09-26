import { questions } from './questions.js';
import { QUESTION_MS, calculateScore, compareLeaderboard } from './scoring.js';

export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;
export const CAPABILITY_TTL_MS = 2 * 60 * 60 * 1000;
export const RECONNECT_TTL_MS = 15 * 60 * 1000;
export const REVEAL_MS = 2_500;
export const MAX_MESSAGE_BYTES = 8 * 1024;
export const MAX_PLAYERS = 100;

const STORAGE_KEY = 'quiz-room-state-v1';
const PHASES = new Set([
  'lobby',
  'question',
  'reveal',
  'finished',
  'paused_host_disconnect'
]);
const ROLES = new Set(['host', 'player']);
const OPTIONS = new Set(['A', 'B', 'C', 'D']);

function currentTime() {
  return Date.now();
}

export function normalizeRoomCode(value) {
  const roomCode = String(value || '').trim().toUpperCase();
  if (!ROOM_CODE_PATTERN.test(roomCode)) {
    throw new RoomError('Mã phòng phải gồm đúng 6 ký tự chữ hoặc số.', 400, 'invalid_room_code');
  }
  return roomCode;
}

export function normalizeNickname(value) {
  const nickname = String(value || '').trim().replace(/\s+/g, ' ');
  if (!nickname || nickname.length > 32 || /[\u0000-\u001f\u007f]/u.test(nickname)) {
    throw new RoomError('Biệt danh phải dài từ 1 đến 32 ký tự.', 400, 'invalid_nickname');
  }
  return nickname;
}

function assertOption(value) {
  if (!OPTIONS.has(value)) {
    throw new RoomError('Đáp án không hợp lệ.', 400, 'invalid_option');
  }
  return value;
}

function tokenBytes(token) {
  return new TextEncoder().encode(token);
}

function bytesToHex(bytes) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

export async function hashCapability(token) {
  const digest = await crypto.subtle.digest('SHA-256', tokenBytes(token));
  return bytesToHex(new Uint8Array(digest));
}

export function createOpaqueToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function safeJson(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function publicQuestion(question) {
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options
  };
}

function newPlayer({ playerId, roomCode, displayName, role, playerSequence, capability, reconnect, now }) {
  return {
    playerId,
    roomCode,
    displayName,
    role,
    playerSequence,
    status: 'online',
    capabilityTokenHash: capability.hash,
    capabilityIssuedAt: now,
    capabilityExpiresAt: now + CAPABILITY_TTL_MS,
    capabilityRevokedAt: null,
    reconnectTokenHash: reconnect.hash,
    reconnectIssuedAt: null,
    reconnectExpiresAt: null,
    reconnectRevokedAt: null,
    totalScore: 0,
    totalResponseMs: 0,
    missedQuestions: 0,
    connectedAt: now,
    disconnectedAt: null,
    leftAt: null
  };
}

export class RoomError extends Error {
  constructor(message, status = 400, code = 'room_error') {
    super(message);
    this.name = 'RoomError';
    this.status = status;
    this.code = code;
  }
}

export class QuizRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sessions = new Map();
    this.room = null;
    this.ready = this.ctx.blockConcurrencyWhile(async () => {
      this.room = await this.ctx.storage.get(STORAGE_KEY) || null;
      for (const websocket of this.ctx.getWebSockets()) {
        const attachment = websocket.deserializeAttachment();
        if (attachment?.playerId) {
          this.sessions.set(websocket, attachment);
        }
      }
    });
  }

  async fetch(request) {
    await this.ready;

    try {
      const url = new URL(request.url);
      const roomCode = this.roomCodeFromRequest(url, request);
      if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
        return await this.upgradeWebSocket(request, roomCode);
      }

      if (request.method === 'GET') {
        await this.expireIfNeeded();
        const capabilityToken = url.searchParams.get('capabilityToken');
        const playerId = url.searchParams.get('playerId');
        if (capabilityToken && playerId) {
          await this.authenticate({ playerId, capabilityToken });
        }
        return safeJson({ ok: true, event: 'snapshot', snapshot: this.snapshot() });
      }

      if (request.method !== 'POST') {
        return safeJson({ ok: false, error: 'Phương thức không được hỗ trợ.', code: 'method_not_allowed' }, 405);
      }

      const body = await this.readJson(request);
      const result = await this.dispatchCommand(body, { roomCode });
      return safeJson({ ok: true, ...result });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  roomCodeFromRequest(url, request) {
    const match = url.pathname.match(/\/rooms\/([^/]+)/u);
    const value = match?.[1] || request.headers.get('X-Room-Code');
    return value ? normalizeRoomCode(value) : null;
  }

  async readJson(request) {
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_MESSAGE_BYTES) {
      throw new RoomError('Thông điệp quá lớn.', 413, 'message_too_large');
    }
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_MESSAGE_BYTES) {
      throw new RoomError('Thông điệp quá lớn.', 413, 'message_too_large');
    }
    try {
      const body = JSON.parse(text);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new Error('not_object');
      }
      return body;
    } catch {
      throw new RoomError('JSON không hợp lệ.', 400, 'invalid_json');
    }
  }

  errorResponse(error) {
    if (error instanceof RoomError) {
      return safeJson({ ok: false, error: error.message, code: error.code }, error.status);
    }
    return safeJson({ ok: false, error: 'Lỗi máy chủ phòng chơi.', code: 'internal_error' }, 500);
  }

  async dispatchCommand(command, context = {}) {
    const type = typeof command?.type === 'string' ? command.type : '';
    if (![
      'create',
      'join',
      'snapshot',
      'start',
      'answer',
      'next',
      'setAutoAdvance',
      'resume',
      'finish',
      'leave'
    ].includes(type)) {
      throw new RoomError('Loại lệnh không hợp lệ.', 400, 'invalid_message_type');
    }

    await this.expireIfNeeded();
    if (type === 'create') return this.createRoom(context.roomCode || command.roomCode, command.nickname);
    if (type === 'join') return this.joinRoom(context.roomCode || command.roomCode, command.nickname);
    if (type === 'snapshot') {
      await this.authenticate(command);
      return { event: 'snapshot', snapshot: this.snapshot() };
    }

    const player = await this.authenticate(command);
    if (type === 'start') return this.startQuiz(player);
    if (type === 'answer') return this.submitAnswer(player, command);
    if (type === 'next') return this.hostNext(player);
    if (type === 'setAutoAdvance') return this.setAutoAdvance(player, command.enabled);
    if (type === 'resume') return this.resumePlayer(player, command.reconnectToken);
    if (type === 'finish') return this.finishQuiz(player, 'host');
    if (type === 'leave') return this.leaveRoom(player);
    throw new RoomError('Lệnh không được xử lý.', 400, 'unhandled_command');
  }

  requireHost(player) {
    if (player.role !== 'host') {
      throw new RoomError('Chỉ chủ phòng mới được thực hiện thao tác này.', 403, 'host_only');
    }
  }

  async createRoom(roomCodeValue, nicknameValue) {
    const roomCode = normalizeRoomCode(roomCodeValue);
    if (this.room) {
      throw new RoomError('Phòng đã tồn tại.', 409, 'room_exists');
    }

    const now = currentTime();
    const capabilityToken = createOpaqueToken();
    const reconnectToken = createOpaqueToken();
    const [capabilityHash, reconnectHash] = await Promise.all([
      hashCapability(capabilityToken),
      hashCapability(reconnectToken)
    ]);
    const host = newPlayer({
      playerId: crypto.randomUUID(),
      roomCode,
      displayName: normalizeNickname(nicknameValue),
      role: 'host',
      playerSequence: 1,
      capability: { hash: capabilityHash },
      reconnect: { hash: reconnectHash },
      now
    });
    this.room = {
      roomCode,
      phase: 'lobby',
      roomStatus: 'active',
      roomVersion: 1,
      questionIndex: -1,
      questionStartedAt: null,
      deadlineAt: null,
      pausedFromPhase: null,
      pausedRemainingMs: null,
      revealUntil: null,
      reveal: null,
      announcement: { kind: 'room_ready', text: 'Phòng chơi đã sẵn sàng.' },
      autoAdvance: false,
      createdAt: now,
      expiresAt: now + CAPABILITY_TTL_MS,
      finishedAt: null,
      players: [host],
      answers: {},
      persisted: false,
      rateWindows: {}
    };
    await this.save();
    return this.credentialsResult(host, capabilityToken, reconnectToken, 'created');
  }

  async joinRoom(roomCodeValue, nicknameValue) {
    const roomCode = normalizeRoomCode(roomCodeValue);
    if (!this.room || this.room.roomCode !== roomCode) {
      throw new RoomError('Không tìm thấy phòng chơi.', 404, 'room_not_found');
    }
    if (this.room.phase !== 'lobby') {
      throw new RoomError('Phòng đã bắt đầu hoặc đã kết thúc.', 409, 'room_not_joinable');
    }
    if (this.room.players.length >= MAX_PLAYERS) {
      throw new RoomError('Phòng đã đủ người chơi.', 409, 'room_full');
    }

    const now = currentTime();
    const displayName = this.uniqueNickname(normalizeNickname(nicknameValue));
    const capabilityToken = createOpaqueToken();
    const reconnectToken = createOpaqueToken();
    const [capabilityHash, reconnectHash] = await Promise.all([
      hashCapability(capabilityToken),
      hashCapability(reconnectToken)
    ]);
    const player = newPlayer({
      playerId: crypto.randomUUID(),
      roomCode,
      displayName,
      role: 'player',
      playerSequence: this.room.players.length + 1,
      capability: { hash: capabilityHash },
      reconnect: { hash: reconnectHash },
      now
    });
    this.room.players.push(player);
    this.bumpVersion({ kind: 'participant_joined', text: `${displayName} đã tham gia phòng.` });
    await this.save();
    this.broadcast({ event: 'snapshot', snapshot: this.snapshot() });
    return this.credentialsResult(player, capabilityToken, reconnectToken, 'joined');
  }

  uniqueNickname(baseName) {
    const used = new Set(this.room.players.map((player) => player.displayName));
    if (!used.has(baseName)) return baseName;
    let suffix = 2;
    while (used.has(`${baseName} #${suffix}`)) suffix += 1;
    return `${baseName} #${suffix}`;
  }

  credentialsResult(player, capabilityToken, reconnectToken, event) {
    return {
      event,
      player: this.publicPlayer(player),
      capabilityToken,
      reconnectToken,
      snapshot: this.snapshot()
    };
  }

  publicPlayer(player) {
    return {
      playerId: player.playerId,
      displayName: player.displayName,
      role: player.role,
      playerSequence: player.playerSequence,
      status: player.status
    };
  }

  async authenticate(command) {
    if (!this.room || this.room.phase === 'finished' || this.room.roomStatus === 'expired') {
      throw new RoomError('Phiên phòng đã kết thúc.', 401, 'room_finished');
    }
    const playerId = String(command?.playerId || '');
    const token = typeof command?.capabilityToken === 'string' ? command.capabilityToken : '';
    const player = this.room.players.find((candidate) => candidate.playerId === playerId);
    if (!player || !token) {
      throw new RoomError('Capability không hợp lệ.', 401, 'invalid_capability');
    }
    const tokenHash = await hashCapability(token);
    const now = currentTime();
    if (
      tokenHash !== player.capabilityTokenHash ||
      player.capabilityRevokedAt !== null ||
      now >= player.capabilityExpiresAt ||
      player.status === 'left'
    ) {
      throw new RoomError('Capability đã hết hạn hoặc bị thu hồi.', 401, 'invalid_capability');
    }
    return player;
  }

  async authenticateSession(session) {
    if (!session?.playerId || !this.room) {
      throw new RoomError('Phiên WebSocket không hợp lệ.', 401, 'invalid_session');
    }
    const player = this.room.players.find((candidate) => candidate.playerId === session.playerId);
    const now = currentTime();
    if (
      !player ||
      player.capabilityTokenHash !== session.capabilityTokenHash ||
      player.capabilityRevokedAt !== null ||
      now >= player.capabilityExpiresAt ||
      player.status === 'left' ||
      this.room.phase === 'finished'
    ) {
      throw new RoomError('Capability đã hết hạn hoặc bị thu hồi.', 401, 'invalid_capability');
    }
    return player;
  }

  startQuiz(player) {
    this.requireHost(player);
    if (this.room.phase !== 'lobby') {
      throw new RoomError('Quiz không ở sảnh chờ.', 409, 'invalid_phase');
    }
    this.beginQuestion(0, { announcement: { kind: 'quiz_started', text: 'Quiz bắt đầu!' } });
    return { event: 'question', snapshot: this.snapshot() };
  }

  submitAnswer(player, command) {
    if (player.role !== 'player') {
      throw new RoomError('Chủ phòng không trả lời như người chơi.', 403, 'host_cannot_answer');
    }
    this.maybeExpireQuestion();
    if (this.room.phase !== 'question') {
      throw new RoomError('Câu hỏi hiện tại đã khóa.', 409, 'question_locked');
    }
    if (player.status !== 'online') {
      throw new RoomError('Người chơi đang ngoại tuyến.', 409, 'player_offline');
    }
    const option = assertOption(command.option);
    const answerKey = this.answerKey(player.playerId, this.room.questionIndex);
    if (this.room.answers[answerKey]) {
      throw new RoomError('Bạn chỉ được trả lời một lần cho mỗi câu.', 409, 'duplicate_answer');
    }
    const now = currentTime();
    if (now >= this.room.deadlineAt) {
      throw new RoomError('Đã hết giờ trả lời.', 409, 'late_answer');
    }
    const question = questions[this.room.questionIndex];
    const result = calculateScore({
      isCorrect: option === question.correctOption,
      questionStartedAt: this.room.questionStartedAt,
      deadlineAt: this.room.deadlineAt,
      receivedAt: now
    });
    this.room.answers[answerKey] = {
      answerId: crypto.randomUUID(),
      playerId: player.playerId,
      questionIndex: this.room.questionIndex,
      questionId: question.id,
      option,
      isCorrect: option === question.correctOption,
      score: result.score,
      responseTimeMs: result.responseTimeMs,
      receivedAt: now
    };
    player.totalScore += result.score;
    player.totalResponseMs += result.responseTimeMs;
    this.bumpVersion();
    this.save();
    const event = result.score > 0 ? 'correct' : 'incorrect';
    this.broadcast({ event, snapshot: this.snapshot(), result: { ...result, accepted: true } });
    return { event, result: { ...result, accepted: true }, snapshot: this.snapshot() };
  }

  hostNext(player) {
    this.requireHost(player);
    if (this.room.phase === 'question') {
      this.maybeExpireQuestion();
      if (this.room.phase === 'question') {
        this.enterReveal('manual');
      }
    } else if (this.room.phase === 'reveal') {
      this.advanceQuestion();
    } else {
      throw new RoomError('Không thể chuyển câu ở giai đoạn này.', 409, 'invalid_phase');
    }
    return { event: this.room.phase === 'reveal' ? 'reveal' : this.room.phase === 'finished' ? 'finished' : 'question', snapshot: this.snapshot() };
  }

  setAutoAdvance(player, enabled) {
    this.requireHost(player);
    if (typeof enabled !== 'boolean') {
      throw new RoomError('Chế độ tự chuyển phải là true hoặc false.', 400, 'invalid_auto_advance');
    }
    this.room.autoAdvance = enabled;
    this.bumpVersion({ kind: 'auto_advance_changed', enabled });
    this.save();
    this.broadcast({ event: 'snapshot', snapshot: this.snapshot() });
    return { event: 'snapshot', snapshot: this.snapshot() };
  }

  resumePlayer(player, reconnectToken) {
    const token = typeof reconnectToken === 'string' ? reconnectToken : '';
    return this.resumeWithReconnect(player, token);
  }

  async resumeWithReconnect(player, reconnectToken) {
    const hash = await hashCapability(reconnectToken);
    const now = currentTime();
    if (
      !reconnectToken ||
      hash !== player.reconnectTokenHash ||
      player.reconnectRevokedAt !== null ||
      player.reconnectExpiresAt === null ||
      now >= player.reconnectExpiresAt
    ) {
      throw new RoomError('Reconnect token đã hết hạn hoặc bị thu hồi.', 401, 'invalid_reconnect');
    }
    const replacement = await this.rotateReconnectToken(player);
    player.status = 'online';
    player.connectedAt = now;
    player.disconnectedAt = null;
    if (this.room.phase === 'paused_host_disconnect' && player.role === 'host') {
      this.resumeHostAfterDisconnect();
    }
    this.bumpVersion({ kind: 'participant_resumed', playerId: player.playerId });
    await this.save();
    this.broadcast({ event: 'snapshot', snapshot: this.snapshot() });
    return {
      event: 'resumed',
      reconnectToken: replacement.token,
      snapshot: this.snapshot()
    };
  }

  async rotateReconnectToken(player) {
    const token = createOpaqueToken();
    player.reconnectTokenHash = await hashCapability(token);
    player.reconnectIssuedAt = null;
    player.reconnectExpiresAt = null;
    player.reconnectRevokedAt = null;
    return { token };
  }

  finishQuiz(player, reason = 'host') {
    this.requireHost(player);
    if (!['lobby', 'question', 'reveal', 'paused_host_disconnect'].includes(this.room.phase)) {
      throw new RoomError('Quiz đã kết thúc.', 409, 'invalid_phase');
    }
    if (this.room.phase === 'question') this.enterReveal('finish');
    this.room.phase = 'finished';
    this.room.roomStatus = reason === 'expired' ? 'expired' : 'finished';
    this.room.finishedAt = currentTime();
    this.room.revealUntil = null;
    this.room.announcement = {
      kind: 'final_results',
      text: 'Quiz đã kết thúc.',
      topFive: this.leaderboard().slice(0, 5).map(({ displayName, totalScore, rank }) => ({ displayName, totalScore, rank }))
    };
    this.revokeAllTokens();
    this.bumpVersion();
    this.save();
    this.persistFinalResults();
    this.broadcast({ event: 'finished', snapshot: this.snapshot() });
    return { event: 'finished', snapshot: this.snapshot() };
  }

  leaveRoom(player) {
    player.status = 'left';
    player.leftAt = currentTime();
    player.disconnectedAt = player.leftAt;
    this.revokePlayerTokens(player);
    if (player.role === 'host' && this.room.phase !== 'finished') {
      this.pauseForHostDisconnect(player.leftAt);
    } else {
      this.bumpVersion({ kind: 'participant_left', playerId: player.playerId });
      this.save();
      this.broadcast({ event: 'snapshot', snapshot: this.snapshot() });
    }
    return { event: 'left', snapshot: this.snapshot() };
  }

  beginQuestion(index, { announcement = null } = {}) {
    const now = currentTime();
    this.room.phase = 'question';
    this.room.pausedFromPhase = null;
    this.room.pausedRemainingMs = null;
    this.room.questionIndex = index;
    this.room.questionStartedAt = now;
    this.room.deadlineAt = now + QUESTION_MS;
    this.room.reveal = null;
    this.room.revealUntil = null;
    this.room.announcement = announcement;
    this.bumpVersion();
    this.save();
    this.ctx.storage.setAlarm(this.room.deadlineAt);
    this.broadcast({ event: 'question', snapshot: this.snapshot() });
  }

  answerKey(playerId, questionIndex) {
    return `${playerId}:${questionIndex}`;
  }

  maybeExpireQuestion() {
    if (this.room.phase === 'question' && currentTime() >= this.room.deadlineAt) {
      this.enterReveal('timeout');
    }
  }

  enterReveal(reason) {
    if (this.room.phase !== 'question') return;
    const now = currentTime();
    const question = questions[this.room.questionIndex];
    const answers = Object.values(this.room.answers)
      .filter((answer) => answer.questionIndex === this.room.questionIndex);
    for (const player of this.room.players) {
      if (player.role !== 'player' || player.status === 'left') continue;
      const answer = this.room.answers[this.answerKey(player.playerId, this.room.questionIndex)];
      if (!answer) {
        player.missedQuestions += 1;
        player.totalResponseMs += QUESTION_MS;
      }
    }
    const correct = answers
      .filter((answer) => answer.isCorrect)
      .sort((left, right) => left.responseTimeMs - right.responseTimeMs || this.playerSequence(left.playerId) - this.playerSequence(right.playerId))[0];
    this.room.phase = 'reveal';
    this.room.deadlineAt = null;
    this.room.revealUntil = this.room.autoAdvance ? now + REVEAL_MS : null;
    this.room.reveal = {
      questionId: question.id,
      correctOption: question.correctOption,
      explanation: question.explanation,
      reason,
      fastestCorrectPlayerId: correct?.playerId || null
    };
    this.room.announcement = correct
      ? { kind: 'fastest_correct', text: `${this.playerById(correct.playerId).displayName} trả lời đúng và nhanh nhất!`, playerId: correct.playerId }
      : { kind: 'no_correct_answer', text: 'Chưa có người trả lời đúng câu này.' };
    this.bumpVersion();
    this.save();
    if (this.room.autoAdvance) this.ctx.storage.setAlarm(this.room.revealUntil);
    this.broadcast({ event: 'reveal', snapshot: this.snapshot() });
  }

  advanceQuestion() {
    if (this.room.questionIndex >= questions.length - 1) {
      const host = this.room.players.find((player) => player.role === 'host');
      if (host) return this.finishQuiz(host, 'host');
      this.room.phase = 'finished';
      this.room.roomStatus = 'finished';
      this.revokeAllTokens();
      this.bumpVersion();
      this.save();
      return;
    }
    this.beginQuestion(this.room.questionIndex + 1);
  }

  pauseForHostDisconnect(now = currentTime()) {
    if (this.room.phase === 'finished' || this.room.phase === 'paused_host_disconnect') return;
    this.room.pausedFromPhase = this.room.phase;
    this.room.pausedRemainingMs = this.room.phase === 'question'
      ? Math.max(0, this.room.deadlineAt - now)
      : null;
    this.room.phase = 'paused_host_disconnect';
    this.room.deadlineAt = null;
    this.room.revealUntil = null;
    this.room.announcement = { kind: 'host_disconnected', text: 'Chủ phòng đã mất kết nối. Đang tạm dừng.' };
    this.bumpVersion();
    this.save();
    this.broadcast({ event: 'paused_host_disconnect', snapshot: this.snapshot() });
  }

  resumeHostAfterDisconnect() {
    if (this.room.phase !== 'paused_host_disconnect') return;
    const previousPhase = this.room.pausedFromPhase || 'lobby';
    this.room.phase = previousPhase;
    if (previousPhase === 'question') {
      const remainingMs = Math.max(0, this.room.pausedRemainingMs || 0);
      const now = currentTime();
      this.room.questionStartedAt = now - (QUESTION_MS - remainingMs);
      this.room.deadlineAt = now + remainingMs;
      if (remainingMs === 0) this.enterReveal('timeout');
      else this.ctx.storage.setAlarm(this.room.deadlineAt);
    }
    this.room.pausedFromPhase = null;
    this.room.pausedRemainingMs = null;
    this.room.announcement = { kind: 'host_resumed', text: 'Chủ phòng đã kết nối lại.' };
    this.bumpVersion();
    this.save();
  }

  async expireIfNeeded() {
    if (!this.room || this.room.phase === 'finished') return;
    if (currentTime() < this.room.expiresAt) return;
    this.room.roomStatus = 'expired';
    this.room.phase = 'finished';
    this.room.finishedAt = currentTime();
    this.room.announcement = { kind: 'room_expired', text: 'Phòng chơi đã hết hạn.' };
    this.revokeAllTokens();
    this.bumpVersion();
    await this.save();
    await this.persistFinalResults();
    this.broadcast({ event: 'finished', snapshot: this.snapshot() });
  }

  playerById(playerId) {
    const player = this.room.players.find((candidate) => candidate.playerId === playerId);
    if (!player) throw new RoomError('Không tìm thấy người chơi.', 404, 'player_not_found');
    return player;
  }

  playerSequence(playerId) {
    return this.playerById(playerId).playerSequence;
  }

  revokePlayerTokens(player) {
    const now = currentTime();
    player.capabilityRevokedAt = now;
    player.reconnectRevokedAt = now;
  }

  revokeAllTokens() {
    for (const player of this.room.players) this.revokePlayerTokens(player);
  }

  bumpVersion(announcement = undefined) {
    this.room.roomVersion += 1;
    if (announcement !== undefined) this.room.announcement = announcement;
  }

  publicAnswerForPlayer(player) {
    if (this.room.questionIndex < 0) return null;
    const answer = this.room.answers[this.answerKey(player.playerId, this.room.questionIndex)];
    return answer ? { option: answer.option, score: answer.score, responseTimeMs: answer.responseTimeMs } : null;
  }

  leaderboard() {
    return this.room.players
      .filter((player) => player.role === 'player' && player.status !== 'left')
      .map((player) => ({
        playerId: player.playerId,
        displayName: player.displayName,
        playerSequence: player.playerSequence,
        totalScore: player.totalScore,
        totalResponseMs: player.totalResponseMs,
        status: player.status
      }))
      .sort(compareLeaderboard)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }

  snapshot() {
    const now = currentTime();
    const question = this.room && this.room.questionIndex >= 0 ? questions[this.room.questionIndex] : null;
    const currentAnswer = question ? Object.fromEntries(this.room.players.map((player) => [
      player.playerId,
      this.publicAnswerForPlayer(player)
    ])) : {};
    return {
      roomCode: this.room?.roomCode || null,
      roomVersion: this.room?.roomVersion || 0,
      phase: this.room?.phase || 'lobby',
      roomStatus: this.room?.roomStatus || 'active',
      questionIndex: this.room?.questionIndex ?? -1,
      questionStartedAt: this.room?.questionStartedAt || null,
      deadlineAt: this.room?.deadlineAt || null,
      serverNow: now,
      remainingMs: this.room?.phase === 'question' && this.room.deadlineAt
        ? Math.max(0, this.room.deadlineAt - now)
        : this.room?.phase === 'paused_host_disconnect' ? this.room.pausedRemainingMs : null,
      autoAdvance: this.room?.autoAdvance || false,
      question: question ? publicQuestion(question) : null,
      reveal: this.room?.reveal || null,
      announcement: this.room?.announcement || null,
      participants: this.room?.players?.map((player) => ({
        ...this.publicPlayer(player),
        connectedAt: player.connectedAt,
        disconnectedAt: player.disconnectedAt,
        answeredCurrent: Boolean(currentAnswer[player.playerId])
      })) || [],
      answers: currentAnswer,
      leaderboard: this.room ? this.leaderboard() : [],
      finalResults: this.room?.phase === 'finished' ? this.leaderboard().slice(0, 5) : null
    };
  }

  async save() {
    await this.ctx.storage.put(STORAGE_KEY, this.room);
  }

  async persistFinalResults() {
    if (this.room?.persisted || !this.room || !this.env.DB) return;
    const statements = [
      this.env.DB.prepare(
        'INSERT OR REPLACE INTO quiz_rooms (room_code, host_player_id, status, created_at, updated_at, finished_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        this.room.roomCode,
        this.room.players.find((player) => player.role === 'host')?.playerId || null,
        this.room.roomStatus === 'expired' ? 'expired' : 'finished',
        new Date(this.room.createdAt).toISOString(),
        new Date(currentTime()).toISOString(),
        this.room.finishedAt ? new Date(this.room.finishedAt).toISOString() : null
      )
    ];
    for (const player of this.room.players) {
      statements.push(this.env.DB.prepare(
        'INSERT OR REPLACE INTO quiz_players (player_id, room_code, display_name, role, player_sequence, connected_at, disconnected_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        player.playerId,
        this.room.roomCode,
        player.displayName,
        player.role,
        player.playerSequence,
        player.connectedAt ? new Date(player.connectedAt).toISOString() : null,
        player.disconnectedAt ? new Date(player.disconnectedAt).toISOString() : null
      ));
    }
    for (const answer of Object.values(this.room.answers)) {
      statements.push(this.env.DB.prepare(
        'INSERT OR REPLACE INTO quiz_answers (answer_id, room_code, player_id, question_id, answer_option, is_correct, score, response_time_ms, accepted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        answer.answerId,
        this.room.roomCode,
        answer.playerId,
        answer.questionId,
        answer.option,
        answer.isCorrect ? 1 : 0,
        answer.score,
        answer.responseTimeMs,
        new Date(answer.receivedAt).toISOString()
      ));
    }
    for (const player of this.room.players) {
      statements.push(this.env.DB.prepare(
        'INSERT OR REPLACE INTO quiz_results (result_id, room_code, player_id, display_name, player_sequence, total_score, total_response_ms, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        `${this.room.roomCode}:${player.playerId}`,
        this.room.roomCode,
        player.playerId,
        player.displayName,
        player.playerSequence,
        player.totalScore,
        player.totalResponseMs,
        new Date(this.room.finishedAt || currentTime()).toISOString()
      ));
    }
    await this.env.DB.batch(statements);
    this.room.persisted = true;
    await this.save();
  }

  async upgradeWebSocket(request, roomCode) {
    if (!this.room || !roomCode || this.room.roomCode !== roomCode) {
      return new Response('Room not found', { status: 404 });
    }
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    const capabilityToken = url.searchParams.get('capabilityToken');
    const reconnectToken = url.searchParams.get('reconnectToken');
    const player = await this.authenticate({ playerId, capabilityToken });
    if (reconnectToken) {
      await this.resumeWithReconnect(player, reconnectToken);
    }
    player.status = 'online';
    player.connectedAt = currentTime();
    player.disconnectedAt = null;
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    const attachment = {
      playerId: player.playerId,
      role: player.role,
      capabilityTokenHash: player.capabilityTokenHash
    };
    server.serializeAttachment(attachment);
    this.sessions.set(server, attachment);
    this.bumpVersion({ kind: 'participant_online', playerId: player.playerId });
    await this.save();
    this.broadcast({ event: 'snapshot', snapshot: this.snapshot() });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(websocket, message) {
    await this.ready;
    if (typeof message !== 'string' || new TextEncoder().encode(message).byteLength > MAX_MESSAGE_BYTES) {
      websocket.close(1009, 'message too large');
      return;
    }
    let command;
    try {
      command = JSON.parse(message);
    } catch {
      this.send(websocket, { event: 'error', error: 'JSON không hợp lệ.', code: 'invalid_json' });
      return;
    }
    const session = this.sessions.get(websocket) || websocket.deserializeAttachment();
    try {
      const player = await this.authenticateSession(session);
      this.enforceRateLimit(player.playerId);
      const result = await this.dispatchSocketCommand(command, player);
      this.send(websocket, { ok: true, ...result });
    } catch (error) {
      this.send(websocket, {
        ok: false,
        event: 'error',
        error: error instanceof RoomError ? error.message : 'Lỗi máy chủ phòng chơi.',
        code: error instanceof RoomError ? error.code : 'internal_error'
      });
    }
  }

  async dispatchSocketCommand(command, player) {
    const tokenCommand = { ...command, playerId: player.playerId };
    if (command.type === 'resume') return this.resumeWithReconnect(player, command.reconnectToken);
    const result = await this.dispatchCommand(tokenCommand, { roomCode: this.room.roomCode });
    return result;
  }

  enforceRateLimit(playerId) {
    const now = currentTime();
    const windowStart = now - 10_000;
    const timestamps = (this.room.rateWindows[playerId] || []).filter((timestamp) => timestamp > windowStart);
    if (timestamps.length >= 60) {
      throw new RoomError('Bạn gửi thao tác quá nhanh.', 429, 'rate_limited');
    }
    timestamps.push(now);
    this.room.rateWindows[playerId] = timestamps;
  }

  send(websocket, payload) {
    try {
      websocket.send(JSON.stringify(payload));
    } catch {
      // The close handler owns offline state; a stale socket cannot break the room actor.
    }
  }

  broadcast(payload) {
    for (const websocket of this.sessions.keys()) this.send(websocket, payload);
  }

  async webSocketClose(websocket) {
    await this.markSocketOffline(websocket);
  }

  async webSocketError(websocket) {
    await this.markSocketOffline(websocket);
  }

  async markSocketOffline(websocket) {
    const session = this.sessions.get(websocket) || websocket.deserializeAttachment();
    this.sessions.delete(websocket);
    if (!session?.playerId || !this.room) return;
    const player = this.room.players.find((candidate) => candidate.playerId === session.playerId);
    if (!player || player.status === 'left' || this.room.phase === 'finished') return;
    const now = currentTime();
    player.status = 'offline';
    player.disconnectedAt = now;
    player.reconnectIssuedAt = now;
    player.reconnectExpiresAt = now + RECONNECT_TTL_MS;
    if (player.role === 'host') this.pauseForHostDisconnect(now);
    else {
      this.bumpVersion({ kind: 'player_offline', playerId: player.playerId });
      await this.save();
      this.broadcast({ event: 'snapshot', snapshot: this.snapshot() });
    }
  }

  async alarm() {
    await this.ready;
    if (!this.room || this.room.phase === 'finished') return;
    if (this.room.phase === 'question' && currentTime() >= this.room.deadlineAt) {
      this.enterReveal('timeout');
      return;
    }
    if (this.room.phase === 'reveal' && this.room.autoAdvance && currentTime() >= this.room.revealUntil) {
      this.advanceQuestion();
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/rooms\/([^/]+)/u);
    if (!match) {
      return safeJson({ ok: true, service: 'quiz-room-worker' });
    }
    const roomCode = normalizeRoomCode(match[1]);
    if (!env.QUIZ_ROOM) {
      return safeJson({ ok: false, error: 'Durable Object binding chưa được cấu hình.', code: 'missing_room_binding' }, 503);
    }
    const id = env.QUIZ_ROOM.idFromName(roomCode);
    return env.QUIZ_ROOM.get(id).fetch(request);
  }
};
