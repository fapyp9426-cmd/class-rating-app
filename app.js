const TEACHER_PASSWORD = "Teach2026!Master";

const defaultStudents = [
  { id: 1, name: 'Алексей Смирнов', avatar: '🐱', score: 45, history: [{ id: 101, delta: 5, reason: 'Отличный ответ у доски' }] },
  { id: 2, name: 'Мария Иванова', avatar: '🦊', score: 60, history: [{ id: 102, delta: 10, reason: 'Победа в олимпиаде' }] },
  { id: 3, name: 'Дмитрий Козлов', avatar: '🦁', score: 38, history: [{ id: 103, delta: -2, reason: 'Забыл тетрадь' }] },
  { id: 4, name: 'Анна Соколова', avatar: '🐼', score: 52, history: [{ id: 104, delta: 3, reason: 'Активность на уроке' }] }
];

let students = JSON.parse(localStorage.getItem('class_students')) || defaultStudents;
let globalHistory = JSON.parse(localStorage.getItem('class_global_history')) || [];

// Безопасное экранирование HTML
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// DOM Элементы
const podiumEl = document.getElementById('podium');
const studentsListEl = document.getElementById('students-list');
const searchInput = document.getElementById('search-input');
const totalStudentsEl = document.getElementById('total-students');

const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const closeAdminModalBtn = document.getElementById('close-admin-modal-btn');

const studentModal = document.getElementById('student-modal');
const closeStudentModalBtn = document.getElementById('close-student-modal-btn');

const addStudentForm = document.getElementById('add-student-form');
const changeScoreForm = document.getElementById('change-score-form');
const selectStudent = document.getElementById('select-student');
const globalHistoryListEl = document.getElementById('global-history-list');
const undoLastBtn = document.getElementById('undo-last-btn');
const manageStudentsListEl = document.getElementById('manage-students-list');

// Бэкап DOM
const exportJsonBtn = document.getElementById('export-json-btn');
const importJsonFile = document.getElementById('import-json-file');
const resetAllBtn = document.getElementById('reset-all-btn');

// Настройки печати
const optTitle = document.getElementById('print-opt-title');
const optDate = document.getElementById('print-opt-date');
const optEmoji = document.getElementById('print-opt-emoji');
const optLast = document.getElementById('print-opt-last');
const optHistory = document.getElementById('print-opt-history');
const optSign = document.getElementById('print-opt-sign');
const triggerPrintBtn = document.getElementById('trigger-print-btn');
const pdfPreviewBox = document.getElementById('pdf-preview-box');

// Модалка вариантов печати
const printChoiceModal = document.getElementById('print-choice-modal');
const closePrintChoiceBtn = document.getElementById('close-print-choice-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const openPrintBtn = document.getElementById('open-print-btn');

// Сезоны
const seasonParticlesContainer = document.getElementById('season-particles');
const winterSnowdrifts = document.getElementById('winter-snowdrifts');
const seasonBadge = document.getElementById('season-badge');

// Сохранение и синхронный рендер
function saveAndRender() {
  students.sort((a, b) => b.score - a.score);
  
  localStorage.setItem('class_students', JSON.stringify(students));
  localStorage.setItem('class_global_history', JSON.stringify(globalHistory));

  renderPodium();
  renderStudentsList();
  renderSelectOptions();
  renderGlobalHistory();
  renderManageStudentsList();
  updatePrintPreview();

  totalStudentsEl.textContent = `Учеников: ${students.length}`;
}

function setScorePreset(val) {
  const input = document.getElementById('score-delta');
  if (input) input.value = val;
}

// Рендер ТОП-3
function renderPodium() {
  podiumEl.innerHTML = '';
  const top3 = students.slice(0, 3);
  const places = [
    { place: 2, class: 'place-2', crown: '🥈' },
    { place: 1, class: 'place-1', crown: '👑' },
    { place: 3, class: 'place-3', crown: '🥉' }
  ];

  places.forEach(p => {
    const student = top3[p.place - 1];
    if (student) {
      const card = document.createElement('div');
      card.className = `podium-card ${p.class}`;
      card.onclick = () => openStudentHistory(student.id);
      card.innerHTML = `
        <div class="crown">${p.crown}</div>
        <div class="avatar">${escapeHtml(student.avatar)}</div>
        <div class="name">${escapeHtml(student.name)}</div>
        <div class="score-badge">${student.score} б.</div>
      `;
      podiumEl.appendChild(card);
    }
  });
}

// Рендер списка учеников
function renderStudentsList() {
  const query = searchInput.value.toLowerCase().trim();
  studentsListEl.innerHTML = '';

  const filtered = students.filter(s => s.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    studentsListEl.innerHTML = '<div style="text-align:center; color: #94a3b8; padding: 20px;">Никого не найдено 🔍</div>';
    return;
  }

  filtered.forEach((student) => {
    const rank = students.findIndex(s => s.id === student.id) + 1;
    const lastAction = student.history && student.history.length > 0 ? student.history[student.history.length - 1] : null;

    const card = document.createElement('div');
    card.className = 'student-card';
    card.onclick = () => openStudentHistory(student.id);
    card.innerHTML = `
      <div class="student-info">
        <span class="rank-num">#${rank}</span>
        <span class="avatar">${escapeHtml(student.avatar)}</span>
        <div>
          <div class="name">${escapeHtml(student.name)}</div>
          ${lastAction ? `<div class="last-reason-tag">💬 ${escapeHtml(lastAction.reason)} (${lastAction.delta > 0 ? '+' : ''}${lastAction.delta})</div>` : ''}
        </div>
      </div>
      <div class="score">${student.score} б.</div>
    `;
    studentsListEl.appendChild(card);
  });
}

// Рендер выбора ученика
function renderSelectOptions() {
  selectStudent.innerHTML = '<option value="">-- Нажмите для выбора --</option>';
  students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.avatar} ${s.name} (${s.score} б.)`;
    selectStudent.appendChild(opt);
  });
}

// Рендер журнала событий
function renderGlobalHistory() {
  globalHistoryListEl.innerHTML = '';

  if (globalHistory.length === 0) {
    globalHistoryListEl.innerHTML = '<div style="color: #94a3b8; font-size: 13px;">История пуста</div>';
    return;
  }

  globalHistory.slice(-5).reverse().forEach((item) => {
    const div = document.createElement('div');
    const isPositive = item.delta > 0;
    div.className = `history-item ${isPositive ? 'positive' : 'negative'}`;
    div.innerHTML = `
      <div class="history-info">
        <strong>${escapeHtml(item.studentName)} (${isPositive ? '+' : ''}${item.delta} б.)</strong>
        <span class="history-reason">${escapeHtml(item.reason)}</span>
      </div>
    `;
    globalHistoryListEl.appendChild(div);
  });
}

// Управление учениками (Редактирование / Удаление)
function renderManageStudentsList() {
  if (!manageStudentsListEl) return;
  manageStudentsListEl.innerHTML = '';

  if (students.length === 0) {
    manageStudentsListEl.innerHTML = '<div style="color: #94a3b8;">Список учеников пуст.</div>';
    return;
  }

  students.forEach(student => {
    const item = document.createElement('div');
    item.className = 'manage-item';
    item.innerHTML = `
      <div class="manage-item-info">
        <span style="font-size: 20px;">${escapeHtml(student.avatar)}</span>
        <strong>${escapeHtml(student.name)}</strong>
        <span style="color: var(--accent-blue); font-weight: 700;">(${student.score} б.)</span>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary btn-sm" onclick="editStudent(${student.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStudent(${student.id})">🗑️</button>
      </div>
    `;
    manageStudentsListEl.appendChild(item);
  });
}

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  const newName = prompt('Имя ученика:', student.name);
  if (newName === null) return;

  const newAvatar = prompt('Эмодзи ученика:', student.avatar);
  if (newAvatar === null) return;

  const newScoreStr = prompt('Количество баллов:', student.score);
  if (newScoreStr === null) return;

  const newScore = parseInt(newScoreStr, 10);

  student.name = newName.trim() || student.name;
  student.avatar = newAvatar.trim() || student.avatar;
  if (!isNaN(newScore)) student.score = newScore;

  saveAndRender();
}

function deleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Удалить ученика "${student.name}" из базы?`)) {
    students = students.filter(s => s.id !== id);
    saveAndRender();
  }
}

// История ученика
function openStudentHistory(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('student-modal-name').textContent = student.name;
  document.getElementById('student-modal-avatar').textContent = student.avatar;
  document.getElementById('student-modal-score').textContent = `${student.score} очков`;

  const listEl = document.getElementById('student-history-list');
  listEl.innerHTML = '';

  if (!student.history || student.history.length === 0) {
    listEl.innerHTML = '<div style="color: #94a3b8; font-size: 13px; text-align: center; padding: 10px;">Записей пока нет 😇</div>';
  } else {
    student.history.slice().reverse().forEach(item => {
      const isPositive = item.delta > 0;
      const div = document.createElement('div');
      div.className = `history-item ${isPositive ? 'positive' : 'negative'}`;
      div.innerHTML = `
        <div class="history-info">
          <strong style="color: ${isPositive ? '#10b981' : '#ef4444'}">${isPositive ? '+' : ''}${item.delta} баллов</strong>
          <span class="history-reason">${escapeHtml(item.reason)}</span>
        </div>
      `;
      listEl.appendChild(div);
    });
  }

  studentModal.classList.remove('hidden');
}

// Сборка верстки печати
function buildPrintHTML() {
  const titleText = optTitle ? optTitle.value.trim() || 'Отчет: Рейтинг класса' : 'Отчет: Рейтинг класса';
  const showDate = optDate ? optDate.checked : true;
  const showEmoji = optEmoji ? optEmoji.checked : true;
  const showLast = optLast ? optLast.checked : true;
  const showHistory = optHistory ? optHistory.checked : false;
  const showSign = optSign ? optSign.checked : true;

  const now = new Date();
  const dateStr = showDate ? `Сформировано: ${now.toLocaleDateString('ru-RU')} в ${now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}` : '';

  let headHTML = '<th>Место</th><th>Ученик</th><th>Баллы</th>';
  if (showLast) headHTML += '<th>Последнее действие</th>';
  if (showHistory) headHTML += '<th>Вся история</th>';

  let bodyHTML = '';
  students.forEach((s, index) => {
    const displayName = showEmoji ? `${escapeHtml(s.avatar)} ${escapeHtml(s.name)}` : escapeHtml(s.name);
    const lastAction = s.history && s.history.length > 0 ? s.history[s.history.length - 1] : null;

    let row = `<tr><td><strong>#${index + 1}</strong></td><td>${displayName}</td><td><strong>${s.score}</strong></td>`;

    if (showLast) {
      row += `<td>${lastAction ? `${escapeHtml(lastAction.reason)} (${lastAction.delta > 0 ? '+' : ''}${lastAction.delta})` : '—'}</td>`;
    }

    if (showHistory) {
      const allHist = (s.history || []).map(h => `${escapeHtml(h.reason)} (${h.delta > 0 ? '+' : ''}${h.delta})`).join('; ');
      row += `<td>${allHist || '—'}</td>`;
    }

    row += '</tr>';
    bodyHTML += row;
  });

  return { titleText: escapeHtml(titleText), dateStr, headHTML, bodyHTML, showSign };
}

function updatePrintPreview() {
  const data = buildPrintHTML();

  const printTitle = document.getElementById('print-title');
  const printDate = document.getElementById('print-date');
  const printTableHead = document.getElementById('print-table-head');
  const printTableBody = document.getElementById('print-table-body');
  const printFooterSign = document.getElementById('print-footer-sign');

  if (printTitle) printTitle.textContent = optTitle ? optTitle.value.trim() || 'Отчет: Рейтинг класса' : 'Отчет: Рейтинг класса';
  if (printDate) {
    printDate.textContent = data.dateStr;
    printDate.style.display = data.dateStr ? 'block' : 'none';
  }
  if (printTableHead) printTableHead.innerHTML = data.headHTML;
  if (printTableBody) printTableBody.innerHTML = data.bodyHTML;
  if (printFooterSign) printFooterSign.style.display = data.showSign ? 'flex' : 'none';

  if (pdfPreviewBox) {
    pdfPreviewBox.innerHTML = `
      <h4 style="text-align: center; margin-bottom: 4px;">${data.titleText}</h4>
      ${data.dateStr ? `<div style="text-align: center; font-size: 9px; color: #666; margin-bottom: 10px;">${data.dateStr}</div>` : '<div style="margin-bottom: 10px;"></div>'}
      <table>
        <thead><tr>${data.headHTML}</tr></thead>
        <tbody>${data.bodyHTML}</tbody>
      </table>
      ${data.showSign ? '<div style="margin-top: 15px; font-size: 9px;">Подпись учителя: __________________ / __________________ /</div>' : ''}
    `;
  }
}

// Экспорт / Печать PDF
if (triggerPrintBtn) {
  triggerPrintBtn.addEventListener('click', () => {
    updatePrintPreview();
    if (printChoiceModal) {
      printChoiceModal.classList.remove('hidden');
    } else {
      window.print();
    }
  });
}

if (openPrintBtn) {
  openPrintBtn.addEventListener('click', () => {
    if (printChoiceModal) printChoiceModal.classList.add('hidden');
    window.print();
  });
}

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener('click', () => {
    if (printChoiceModal) printChoiceModal.classList.add('hidden');

    const titleText = optTitle ? optTitle.value.trim() || 'Отчет_Рейтинг_класса' : 'Отчет_Рейтинг_класса';

    if (typeof html2pdf !== 'undefined') {
      const data = buildPrintHTML();
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.background = '#ffffff';
      container.style.color = '#000000';
      container.style.fontFamily = 'sans-serif';
      container.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 4px;">${data.titleText}</h2>
        ${data.dateStr ? `<div style="text-align: center; font-size: 11px; color: #666; margin-bottom: 16px;">${data.dateStr}</div>` : ''}
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead><tr style="background: #f2f2f2;">${data.headHTML}</tr></thead>
          <tbody>${data.bodyHTML}</tbody>
        </table>
        ${data.showSign ? '<div style="margin-top: 30px; font-size: 11px;">Подпись учителя: __________________ / __________________ /</div>' : ''}
      `;

      // Применяем границы к таблице
      container.querySelectorAll('th, td').forEach(cell => {
        cell.style.border = '1px solid #ccc';
        cell.style.padding = '8px';
        cell.style.fontSize = '12px';
      });

      const opt = {
        margin: 10,
        filename: `${titleText.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(container).save();
    } else {
      window.print();
    }
  });
}

if (closePrintChoiceBtn) {
  closePrintChoiceBtn.onclick = () => printChoiceModal.classList.add('hidden');
}

// Сезоны (Зима, Весна, Лето, Осень)
function initAutoSeason() {
  const month = new Date().getMonth() + 1; // 1-12

  if (!seasonParticlesContainer || !winterSnowdrifts) return;

  seasonParticlesContainer.innerHTML = '';
  winterSnowdrifts.classList.add('hidden');

  if (seasonBadge) seasonBadge.style.display = 'flex';

  // Зима (12, 1, 2)
  if (month === 12 || month === 1 || month === 2) {
    if (seasonBadge) seasonBadge.innerHTML = '❄️ Зима';
    createWinterFX();
  } 
  // Весна (3, 4, 5)
  else if (month >= 3 && month <= 5) {
    if (seasonBadge) seasonBadge.innerHTML = '🌸 Весна';
    createSpringFX();
  }
  // Лето (6, 7, 8)
  else if (month >= 6 && month <= 8) {
    if (seasonBadge) seasonBadge.innerHTML = '☀️ Лето';
    createSummerFX();
  }
  // Осень (9, 10, 11)
  else if (month >= 9 && month <= 11) {
    if (seasonBadge) seasonBadge.innerHTML = '🍂 Осень';
    createAutumnFX();
  }
}

function createWinterFX() {
  winterSnowdrifts.classList.remove('hidden');
  const snowEmojis = ['❄️', '❅', '❆', '•'];

  for (let i = 0; i < 35; i++) {
    const flake = document.createElement('div');
    flake.className = 'falling-snow';
    flake.textContent = snowEmojis[Math.floor(Math.random() * snowEmojis.length)];
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.fontSize = `${10 + Math.random() * 18}px`;
    flake.style.animationDuration = `${4 + Math.random() * 6}s`;
    flake.style.animationDelay = `${Math.random() * 5}s`;
    flake.style.opacity = Math.random() * 0.8 + 0.2;
    seasonParticlesContainer.appendChild(flake);
  }
}

function createSpringFX() {
  const petals = ['🌸', '🌺', '🍃'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'falling-petal';
    p.textContent = petals[Math.floor(Math.random() * petals.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.fontSize = `${14 + Math.random() * 14}px`;
    p.style.animationDuration = `${5 + Math.random() * 5}s`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    seasonParticlesContainer.appendChild(p);
  }
}

function createSummerFX() {
  for (let i = 0; i < 25; i++) {
    const s = document.createElement('div');
    s.className = 'summer-sparkle';
    const size = 6 + Math.random() * 10;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDuration = `${3 + Math.random() * 4}s`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    seasonParticlesContainer.appendChild(s);
  }
}

function createAutumnFX() {
  const leafEmojis = ['🍂', '🍁', '🍃'];
  
  for (let i = 0; i < 20; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.6 + Math.random() * 0.4}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    seasonParticlesContainer.appendChild(drop);
  }

  for (let i = 0; i < 15; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.fontSize = `${16 + Math.random() * 16}px`;
    leaf.style.animationDuration = `${5 + Math.random() * 5}s`;
    leaf.style.animationDelay = `${Math.random() * 5}s`;
    seasonParticlesContainer.appendChild(leaf);
  }
}

// Резервное копирование и Экспорт/Импорт
if (exportJsonBtn) {
  exportJsonBtn.addEventListener('click', () => {
    const dataObj = { students, globalHistory, exportDate: new Date().toISOString() };
    const jsonStr = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_rating_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (importJsonFile) {
  importJsonFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && Array.isArray(parsed.students)) {
          students = parsed.students;
          globalHistory = parsed.globalHistory || [];
          saveAndRender();
          alert('Данные успешно импортированы!');
        } else {
          alert('Некорректная структура JSON-файла!');
        }
      } catch (err) {
        alert('Ошибка при чтении файла JSON!');
      }
    };
    reader.readAsText(file);
  });
}

if (resetAllBtn) {
  resetAllBtn.addEventListener('click', () => {
    if (confirm('ВНИМАНИЕ! Это действие удалит всех учеников и всю историю. Продолжить?')) {
      students = [];
      globalHistory = [];
      saveAndRender();
      alert('Все данные сброшены!');
    }
  });
}

// Настройки печати
[optTitle, optDate, optEmoji, optLast, optHistory, optSign].forEach(el => {
  if (el) {
    el.addEventListener('input', updatePrintPreview);
    el.addEventListener('change', updatePrintPreview);
  }
});

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

// Форма баллов
changeScoreForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const studentId = parseInt(selectStudent.value, 10);
  const delta = parseInt(document.getElementById('score-delta').value, 10);
  const reason = document.getElementById('score-reason').value.trim();

  if (isNaN(studentId)) return alert('Пожалуйста, выберите ученика!');
  if (isNaN(delta)) return alert('Пожалуйста, введите число баллов!');

  const student = students.find(s => s.id === studentId);
  if (!student) return;

  student.score += delta;
  
  if (!student.history) student.history = [];
  const actionObj = { id: Date.now() + Math.floor(Math.random() * 1000), delta, reason };
  student.history.push(actionObj);

  globalHistory.push({
    id: actionObj.id,
    studentId: student.id,
    studentName: student.name,
    delta: delta,
    reason: reason
  });

  document.getElementById('score-delta').value = '';
  document.getElementById('score-reason').value = '';
  selectStudent.value = '';

  saveAndRender();
  alert(`Успешно! ${student.name}: ${delta > 0 ? '+' : ''}${delta} б.`);
});

// Отмена последнего действия
undoLastBtn.addEventListener('click', () => {
  if (globalHistory.length === 0) return alert('История пуста!');

  const lastAction = globalHistory.pop();
  const student = students.find(s => s.id === lastAction.studentId);

  if (student) {
    student.score -= lastAction.delta;
    if (student.history) {
      student.history = student.history.filter(h => h.id !== lastAction.id);
    }
  }

  saveAndRender();
  alert('❌ Изменение отменено!');
});

// Добавление нового ученика
addStudentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('new-name');
  const avatarInput = document.getElementById('new-avatar');
  const scoreInput = document.getElementById('new-score');

  const name = nameInput.value.trim();
  if (!name) return;

  const scoreVal = parseInt(scoreInput.value, 10);

  students.push({
    id: Date.now(),
    name: name,
    avatar: avatarInput.value.trim() || '😎',
    score: isNaN(scoreVal) ? 0 : scoreVal,
    history: []
  });

  nameInput.value = '';
  avatarInput.value = '😎';
  scoreInput.value = '0';
  saveAndRender();
  alert('Ученик добавлен!');
});

if (searchInput) searchInput.addEventListener('input', renderStudentsList);

// Авторизация
adminBtn.addEventListener('click', () => {
  const inputPassword = prompt('Пароль учителя:');
  if (inputPassword === TEACHER_PASSWORD) {
    adminModal.classList.remove('hidden');
    updatePrintPreview();
  } else if (inputPassword !== null) {
    alert('❌ Неверный пароль!');
  }
});

// Закрытие модалок
if (closeAdminModalBtn) closeAdminModalBtn.onclick = () => adminModal.classList.add('hidden');
if (closeStudentModalBtn) closeStudentModalBtn.onclick = () => studentModal.classList.add('hidden');

if (adminModal) adminModal.onclick = (e) => { if (e.target === adminModal) adminModal.classList.add('hidden'); };
if (studentModal) studentModal.onclick = (e) => { if (e.target === studentModal) studentModal.classList.add('hidden'); };

// Инициализация
saveAndRender();
initAutoSeason();