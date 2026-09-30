const root = document;
const $ = (selector) => root.querySelector(selector);
const status = $('[data-role="status"]');
const settingsPanel = $('[data-role="settings"]');
const settingsForm = $('[data-role="settings-form"]');
const previewForm = $('[data-role="preview-form"]');
const previewAudio = $('[data-role="preview-audio"]');
const quizSettingsPanel = $('[data-role="quiz-settings"]');
const quizSettingsForm = $('[data-role="quiz-settings-form"]');
const questionSetsPanel = $('[data-role="question-sets"]');
const questionSetForm = $('[data-role="question-set-form"]');
const activeQuestionSetSelect = $('[data-role="active-question-set"]');
const questionSetList = $('[data-role="question-set-list"]');
const elevenLabsStatusCard = $('[data-role="elevenlabs-status-card"]');
const elevenLabsAccountList = $('[data-role="elevenlabs-account-list"]');
const engineSettings = [...root.querySelectorAll('[data-engine-settings]')];
const engineSelect = settingsForm?.elements.namedItem('engine');
const engineSelectTrigger = $('[data-role="engine-select-trigger"]');
const engineSelectMenu = $('[data-role="engine-select-menu"]');
const engineSelectOptions = [...root.querySelectorAll('[data-engine-option]')];

let previewUrl = null;
let questionSets = [];
const VOLUME_KEYS = ['master', 'music', 'correct', 'incorrect', 'welcome', 'roomReady', 'finalResults', 'dynamicVoice'];

function setStatus(message, state = '') {
  if (!status) return;
  status.hidden = !message;
  status.textContent = message;
  status.dataset.state = state;
}

function headers(extra = {}) {
  return { ...extra };
}

async function api(path, init = {}) {
  const response = await fetch(path, { ...init, headers: headers(init.headers || {}) });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.blob();
  if (!response.ok) {
    if (response.status === 401) {
      window.location.replace('/admin');
    }
    const error = new Error(body?.message || body?.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

function fillSettings(values) {
  for (const [name, value] of Object.entries(values)) {
    const input = settingsForm.elements.namedItem(name);
    if (input) input.value = value;
  }
  for (const key of VOLUME_KEYS) {
    const input = root.querySelector(`[data-volume-input="${key}"]`);
    const output = root.querySelector(`[data-volume-output="${key}"]`);
    const value = Number(values.audio_volume?.[key]);
    if (input && Number.isFinite(value)) input.value = String(value);
    if (output && Number.isFinite(value)) output.value = `${Math.round(value)}%`;
    if (output && Number.isFinite(value)) output.textContent = `${Math.round(value)}%`;
  }
  const referenceState = $('[data-role="reference-state"]');
  const endpoint = $('[data-role="endpoint"]');
  if (referenceState) referenceState.textContent = values.reference_exists ? 'Đã tìm thấy file mẫu' : 'Thiếu file mẫu';
  if (endpoint) endpoint.textContent = values.engine === 'elevenlabs' ? 'Tích hợp trong Quiz' : '127.0.0.1:8786';
  const cloneSpeed = settingsForm.elements.namedItem('clone_speed');
  if (cloneSpeed) cloneSpeed.value = values.speed;
  updateEngineSettings(values.engine);
}

function updateEngineSettings(engine) {
  syncEngineSelector(engine);
  for (const panel of engineSettings) {
    panel.hidden = panel.dataset.engineSettings === 'elevenlabs' ? engine !== 'elevenlabs' : engine === 'elevenlabs';
  }
}

function syncEngineSelector(value) {
  if (!engineSelect || !engineSelectTrigger) return;
  const option = [...engineSelect.options].find((item) => item.value === value) || engineSelect.options[0];
  if (!option) return;
  engineSelect.value = option.value;
  engineSelectTrigger.textContent = option.textContent;
  for (const item of engineSelectOptions) item.setAttribute('aria-selected', String(item.dataset.engineOption === option.value));
}

function closeEngineMenu() {
  if (!engineSelectMenu || !engineSelectTrigger) return;
  engineSelectMenu.hidden = true;
  engineSelectTrigger.setAttribute('aria-expanded', 'false');
}

engineSelectTrigger?.addEventListener('click', () => {
  const isOpen = !engineSelectMenu.hidden;
  engineSelectMenu.hidden = isOpen;
  engineSelectTrigger.setAttribute('aria-expanded', String(!isOpen));
});
engineSelectOptions.forEach((option) => option.addEventListener('click', () => {
  if (!engineSelect) return;
  engineSelect.value = option.dataset.engineOption;
  engineSelect.dispatchEvent(new Event('change', { bubbles: true }));
  closeEngineMenu();
}));
document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-role="engine-select"]')) closeEngineMenu();
});

async function loadSettings() {
  setStatus('Đang đọc cấu hình service…');
  try {
    const result = await api('/api/admin/tts-settings');
    fillSettings(result.settings);
    settingsPanel.hidden = false;
    settingsForm.removeAttribute('aria-busy');
    setStatus('');
  } catch (error) {
    settingsPanel.hidden = true;
    setStatus(error.status === 401 ? 'Launcher chưa kết nối quyền quản trị. Hãy chạy start-quiz.ps1.' : (error.message || 'Không đọc được cấu hình.'), 'error');
  }
}

function fillQuizSettings(values) {
  const input = quizSettingsForm?.elements.namedItem('questionDurationSec');
  if (input) input.value = values.questionDurationSec;
  questionSets = Array.isArray(values.questionSets) ? values.questionSets : [];
  renderQuestionSets(values.activeQuestionSetId);
}

function renderQuestionSets(activeId = activeQuestionSetSelect?.value) {
  if (!activeQuestionSetSelect) return;
  activeQuestionSetSelect.replaceChildren();
  for (const set of questionSets) {
    const option = document.createElement('option');
    option.value = set.id;
    option.textContent = set.name;
    activeQuestionSetSelect.append(option);
  }
  if (questionSets.some((set) => set.id === activeId)) activeQuestionSetSelect.value = activeId;
  else if (questionSets[0]) activeQuestionSetSelect.value = questionSets[0].id;

  if (questionSetList) {
    questionSetList.replaceChildren();
    for (const set of questionSets) {
      const item = document.createElement('li');
      item.className = 'question-set-item';
      const title = document.createElement('strong');
      title.textContent = set.name;
      const meta = document.createElement('span');
      meta.className = 'question-set-item-meta';
      meta.textContent = `${Array.isArray(set.questions) ? set.questions.length : 0} câu hỏi`;
      const actions = document.createElement('div');
      actions.className = 'question-set-item-actions';
      if (set.id === activeQuestionSetSelect.value) {
        const active = document.createElement('span');
        active.className = 'question-set-active';
        active.textContent = 'Đang dùng';
        actions.append(active);
      } else {
        const use = document.createElement('button');
        use.type = 'button';
        use.className = 'secondary-button';
        use.dataset.questionSetId = set.id;
        use.textContent = 'Dùng bộ này';
        actions.append(use);
      }
      item.append(title, meta, actions);
      questionSetList.append(item);
    }
  }
  loadQuestionSetEditor();
}

function selectedQuestionSet() {
  return questionSets.find((set) => set.id === activeQuestionSetSelect?.value) || questionSets[0] || null;
}

function loadQuestionSetEditor() {
  const selected = selectedQuestionSet();
  const name = questionSetForm?.elements.namedItem('questionSetName');
  const json = questionSetForm?.elements.namedItem('questionSetJson');
  if (!selected || !name || !json) return;
  name.value = '';
  json.value = JSON.stringify(selected.questions, null, 2);
}

function parseQuestionSetDraft(nameValue, jsonValue) {
  const name = String(nameValue || '').trim();
  if (!name) throw new Error('Hãy nhập tên bộ câu hỏi.');
  let parsed;
  try {
    parsed = JSON.parse(jsonValue);
  } catch {
    throw new Error('JSON bộ câu hỏi không hợp lệ.');
  }
  const questions = Array.isArray(parsed) ? parsed : parsed?.questions;
  if (!Array.isArray(questions) || questions.length !== 20) throw new Error('Bộ câu hỏi phải có đúng 20 câu.');
  for (const [index, question] of questions.entries()) {
    if (!question?.prompt || !question?.explanation || !/^[ABCD]$/u.test(String(question.correctOption || '').toUpperCase())) {
      throw new Error(`Câu ${index + 1} thiếu nội dung, đáp án đúng hoặc giải thích.`);
    }
    for (const answer of ['A', 'B', 'C', 'D']) {
      if (!question.options?.[answer]) throw new Error(`Câu ${index + 1} thiếu đáp án ${answer}.`);
    }
  }
  const id = `set-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    name,
    questions: questions.map((question, index) => ({
      id: String(question.id || `q${String(index + 1).padStart(2, '0')}`),
      prompt: String(question.prompt).trim(),
      options: Object.fromEntries(['A', 'B', 'C', 'D'].map((answer) => [answer, String(question.options[answer]).trim()])),
      correctOption: String(question.correctOption).trim().toUpperCase(),
      explanation: String(question.explanation).trim()
    }))
  };
}

async function persistQuizSettings(successMessage) {
  const questionDurationSec = Number(new FormData(quizSettingsForm).get('questionDurationSec'));
  if (!Number.isFinite(questionDurationSec) || questionDurationSec < 5 || questionDurationSec > 300) {
    throw new Error('Thời lượng phải từ 5 đến 300 giây.');
  }
  const result = await api('/api/admin/quiz-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionDurationSec, activeQuestionSetId: activeQuestionSetSelect?.value, questionSets })
  });
  fillQuizSettings(result.settings);
  setStatus(successMessage, 'ok');
  return result;
}

async function loadQuizSettings() {
  try {
    const result = await api('/api/admin/quiz-settings');
    fillQuizSettings(result.settings);
    quizSettingsPanel.hidden = false;
    if (questionSetsPanel) questionSetsPanel.hidden = false;
  } catch (error) {
    quizSettingsPanel.hidden = true;
    if (questionSetsPanel) questionSetsPanel.hidden = true;
    setStatus(error.message || 'Không đọc được cấu hình quiz.', 'error');
  }
}

async function loadAllSettings() {
  await Promise.all([loadSettings(), loadQuizSettings(), loadElevenLabsStatus()]);
}

async function loadElevenLabsStatus() {
  if (!elevenLabsStatusCard) return;
  elevenLabsStatusCard.hidden = false;
  const pill = $('[data-role="elevenlabs-status-pill"]');
  const message = $('[data-role="elevenlabs-status-message"]');
  const error = $('[data-role="elevenlabs-account-error"]');
  try {
    const result = await api('/api/admin/elevenlabs-status');
    applyElevenLabsStatus(result, { pill, message, error });
  } catch (requestError) {
    if (pill) {
      pill.hidden = false;
      pill.textContent = 'OFFLINE';
      pill.dataset.state = 'error';
    }
    message.textContent = requestError.message || 'Không kiểm tra được ElevenLabs tool.';
    error.hidden = true;
  }
}

function applyElevenLabsStatus(result, { pill, message, error }) {
  const accounts = Array.isArray(result.accounts) ? result.accounts : [];
  const account = accounts.find((item) => item.status !== 'invalid_auth') || accounts[0];
  const ready = result.ok && Number(result.active_accounts) > 0;
  if (pill) {
    pill.hidden = ready;
    pill.textContent = ready ? '' : 'CẦN ĐĂNG NHẬP';
    pill.dataset.state = ready ? 'ok' : 'error';
  }
  const remaining = Number(result.total_remaining_characters || 0);
  const limit = Number(result.total_character_limit || accounts.reduce((sum, item) => sum + Number(item.character_limit || 0), 0) || 0);
  message.textContent = ready
    ? `Tổng Credit: ${remaining.toLocaleString('vi-VN')} / ${limit.toLocaleString('vi-VN')}`
    : 'Chưa có tài khoản ElevenLabs hợp lệ. Bấm Quét & Lấy Token ngay để cập nhật session.';
  const accountError = account?.error_message || '';
  error.hidden = !accountError;
  error.textContent = accountError ? `Chi tiết: ${accountError}` : '';
  if (elevenLabsAccountList) {
    elevenLabsAccountList.replaceChildren();
    for (const item of accounts) {
      const row = document.createElement('li');
      row.className = 'elevenlabs-account-row';
      const details = document.createElement('div');
      details.className = 'elevenlabs-account-details';
      const name = document.createElement('strong');
      name.textContent = item.name || item.email || 'Tài khoản ElevenLabs';
      const credit = document.createElement('span');
      credit.textContent = `${Number(item.remaining_characters || 0).toLocaleString('vi-VN')} / ${Number(item.character_limit || 0).toLocaleString('vi-VN')} credit`;
      details.append(name, credit);
      const actions = document.createElement('div');
      actions.className = 'elevenlabs-account-actions';
      const state = document.createElement('span');
      state.className = 'account-status';
      state.dataset.state = item.status === 'active' ? 'ok' : 'error';
      state.textContent = item.status === 'active' ? 'Hoạt động' : (item.status || 'Chưa kiểm tra');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'account-delete-button';
      remove.dataset.accountId = item.id || '';
      remove.textContent = 'Xóa';
      remove.disabled = !item.id;
      actions.append(state, remove);
      row.append(details, actions);
      elevenLabsAccountList.append(row);
    }
    elevenLabsAccountList.hidden = accounts.length === 0;
  }
}

async function scanElevenLabs() {
  const button = $('[data-action="refresh-elevenlabs"]');
  if (!button) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang quét…';
  setStatus('Đang quét session ElevenLabs từ Chrome/Edge trên máy chạy Quiz…');
  try {
    const result = await api('/api/admin/elevenlabs-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    await loadElevenLabsStatus();
    const count = Number(result.scanned_accounts || 0);
    setStatus(count > 0 ? `Đã quét và cập nhật ${count} session ElevenLabs trên máy chạy Quiz.` : 'Đã quét máy chạy Quiz. Không tìm thấy session mới trong Chrome/Edge.', count > 0 ? 'ok' : '');
  } catch (error) {
    setStatus(error.message || 'Không quét được session ElevenLabs.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function addElevenLabsAccount() {
  const button = $('[data-action="add-elevenlabs"]');
  if (!button) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang mở…';
  setStatus('Đang mở phiên đăng nhập ElevenLabs riêng…');
  try {
    const result = await api('/api/admin/elevenlabs-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!result.ok) throw new Error(result.message || 'Không mở được phiên đăng nhập ElevenLabs.');
    setStatus('Đã mở cửa sổ ElevenLabs. Đăng nhập tài khoản mới ở đó; Quiz sẽ tự nhận session.');
    for (let attempt = 0; attempt < 120; attempt += 1) {
      await sleep(1500);
      const login = await api('/api/admin/elevenlabs-login-status');
      if (login.state === 'captured') {
        await loadElevenLabsStatus();
        setStatus('Đã thêm tài khoản ElevenLabs mới.', 'ok');
        return;
      }
      if (['error', 'timeout', 'unavailable'].includes(login.state)) {
        throw new Error(login.message || 'Phiên đăng nhập ElevenLabs không hoàn tất.');
      }
    }
    setStatus('Phiên đăng nhập vẫn đang chờ. Nếu đã đăng nhập, bấm Quét để cập nhật danh sách.');
  } catch (error) {
    setStatus(error.message || 'Không thêm được tài khoản ElevenLabs.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

async function deleteElevenLabsAccount(accountId, button) {
  if (!accountId || !button) return;
  if (!window.confirm('Xóa session ElevenLabs này khỏi Quiz?')) return;
  button.disabled = true;
  setStatus('Đang xóa tài khoản ElevenLabs…');
  try {
    await api('/api/admin/elevenlabs-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId })
    });
    await loadElevenLabsStatus();
    setStatus('Đã xóa tài khoản ElevenLabs khỏi Quiz.', 'ok');
  } catch (error) {
    button.disabled = false;
    setStatus(error.message || 'Không xóa được tài khoản ElevenLabs.', 'error');
  }
}

async function logout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
  } finally {
    window.location.replace('/admin');
  }
}

async function saveSettings(event) {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(settingsForm).entries());
  body.audio_volume = Object.fromEntries(VOLUME_KEYS.map((key) => [key, Number(body[`audio_${key}`])]));
  for (const key of VOLUME_KEYS) delete body[`audio_${key}`];
  body.speed = Number(body.engine === 'elevenlabs' ? body.speed : body.clone_speed);
  delete body.clone_speed;
  body.nfe_step = Number(body.nfe_step);
  body.max_chunk_duration = Number(body.max_chunk_duration);
  body.elevenlabs_stability = Number(body.elevenlabs_stability);
  body.elevenlabs_similarity_boost = Number(body.elevenlabs_similarity_boost);
  setStatus('Đang áp dụng cấu hình…');
  try {
    const result = await api('/api/admin/tts-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    fillSettings(result.settings);
    setStatus('Đã lưu. Cấu hình mới áp dụng cho audio tạo sau đó.', 'ok');
  } catch (error) { setStatus(error.message || 'Không lưu được cấu hình.', 'error'); }
}

async function saveQuizSettings(event) {
  event.preventDefault();
  setStatus('Đang lưu cài đặt quiz…');
  try {
    const result = await persistQuizSettings('Đã lưu cài đặt quiz. Áp dụng cho phòng tạo mới.');
    setStatus(`Đã lưu ${result.settings.questionDurationSec} giây/câu và bộ câu hỏi đang dùng.`, 'ok');
  } catch (error) { setStatus(error.message || 'Không lưu được cài đặt quiz.', 'error'); }
}

async function createQuestionSet(event) {
  event.preventDefault();
  try {
    const draft = parseQuestionSetDraft(
      new FormData(questionSetForm).get('questionSetName'),
      new FormData(questionSetForm).get('questionSetJson')
    );
    questionSets = [...questionSets, draft];
    activeQuestionSetSelect.value = draft.id;
    setStatus('Đang lưu bộ câu hỏi mới…');
    await persistQuizSettings(`Đã tạo và chọn bộ “${draft.name}”.`);
  } catch (error) {
    setStatus(error.message || 'Không tạo được bộ câu hỏi.', 'error');
  }
}

async function preview(event) {
  event.preventDefault();
  const text = new FormData(previewForm).get('text')?.toString().trim();
  if (!text) return;
  const currentSettings = Object.fromEntries(new FormData(settingsForm).entries());
  const previewSettings = Object.fromEntries([
    'engine', 'speed', 'nfe_step', 'max_chunk_duration', 'reference_audio', 'reference_text',
    'elevenlabs_voice_id', 'elevenlabs_model_id', 'elevenlabs_stability', 'elevenlabs_similarity_boost'
  ].filter((key) => currentSettings[key] !== undefined).map((key) => [key, currentSettings[key]]));
  if (currentSettings.engine !== 'elevenlabs' && currentSettings.clone_speed !== undefined) {
    previewSettings.speed = currentSettings.clone_speed;
  }
  setStatus('Đang tạo audio thử…');
  previewAudio.hidden = true;
  try {
    const blob = await api('/api/admin/tts-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, ...previewSettings }) });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(blob);
    previewAudio.src = previewUrl;
    previewAudio.hidden = false;
    await previewAudio.play().catch(() => {});
    setStatus(`Đã tạo audio thử theo Speed ${currentSettings.speed || '1.0'}x.`, 'ok');
  } catch (error) { setStatus(error.message || 'Không tạo được audio thử.', 'error'); }
}

settingsForm?.addEventListener('submit', saveSettings);
settingsForm?.elements.namedItem('engine')?.addEventListener('change', (event) => {
  updateEngineSettings(event.target.value);
});
quizSettingsForm?.addEventListener('submit', saveQuizSettings);
questionSetForm?.addEventListener('submit', createQuestionSet);
activeQuestionSetSelect?.addEventListener('change', () => renderQuestionSets(activeQuestionSetSelect.value));
questionSetList?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-question-set-id]');
  if (!button) return;
  activeQuestionSetSelect.value = button.dataset.questionSetId;
  renderQuestionSets(activeQuestionSetSelect.value);
  setStatus('Đang lưu bộ câu hỏi đang dùng…');
  try { await persistQuizSettings('Đã đổi bộ câu hỏi. Áp dụng cho phòng tạo mới.'); }
  catch (error) { setStatus(error.message || 'Không đổi được bộ câu hỏi.', 'error'); }
});
$('[data-action="save-question-set-selection"]')?.addEventListener('click', async () => {
  setStatus('Đang lưu bộ câu hỏi đang dùng…');
  try { await persistQuizSettings('Đã lưu bộ câu hỏi đang dùng. Áp dụng cho phòng tạo mới.'); }
  catch (error) { setStatus(error.message || 'Không lưu được bộ câu hỏi.', 'error'); }
});
$('[data-action="load-question-set-editor"]')?.addEventListener('click', loadQuestionSetEditor);
previewForm?.addEventListener('submit', preview);
for (const input of root.querySelectorAll('[data-volume-input]')) {
  input.addEventListener('input', () => {
    const output = root.querySelector(`[data-volume-output="${input.dataset.volumeInput}"]`);
    if (output) {
      output.value = `${input.value}%`;
      output.textContent = `${input.value}%`;
    }
  });
}
$('[data-action="reload"]')?.addEventListener('click', loadAllSettings);
$('[data-action="logout"]')?.addEventListener('click', logout);
$('[data-action="refresh-elevenlabs"]')?.addEventListener('click', scanElevenLabs);
$('[data-action="add-elevenlabs"]')?.addEventListener('click', addElevenLabsAccount);
elevenLabsAccountList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-account-id]');
  if (button) void deleteElevenLabsAccount(button.dataset.accountId, button);
});
void loadAllSettings();
