// ===================== РЕНДЕР =====================
import { getStudents, getGlobalHistory } from './state.js?v=1';
import { escapeHtml } from './utils.js?v=1';
import { applySortMode } from './sort.js?v=1';

const podiumEl = document.getElementById('podium');
const studentsListEl = document.getElementById('students-list');
const searchInput = document.getElementById('search-input');
const totalStudentsEl = document.getElementById('total-students');
const selectStudent = document.getElementById('select-student');
const globalHistoryListEl = document.getElementById('global-history-list');
const manageStudentsListEl = document.getElementById('manage-students-list');

const studentModal = document.getElementById('student-modal');

// Рендер ТОП-3
export function renderPodium() {
  const students = getStudents();
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

// Рендер списка учеников (учитывает поиск и выбранный режим сортировки)
export function renderStudentsList() {
  const students = getStudents();
  const query = searchInput.value.toLowerCase().trim();
  studentsListEl.innerHTML = '';

  // students уже отсортирован по баллам (см. renderAll) — от этого порядка считаем ранг (#1, #2...)
  const filtered = applySortMode(students).filter(s => s.name.toLowerCase().includes(query));

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

if (searchInput) searchInput.addEventListener('input', renderStudentsList);

// Рендер выбора ученика (форма начисления баллов)
export function renderSelectOptions() {
  const students = getStudents();
  selectStudent.innerHTML = '<option value="">-- Нажмите для выбора --</option>';
  students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.avatar} ${s.name} (${s.score} б.)`;
    selectStudent.appendChild(opt);
  });
}

// Рендер журнала событий (последние 5)
export function renderGlobalHistory() {
  const globalHistory = getGlobalHistory();
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

// Управление учениками (кнопки Редактировать / Удалить)
export function renderManageStudentsList() {
  const students = getStudents();
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
        <button class="btn btn-secondary btn-sm" onclick="editStudent('${student.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.id}')">🗑️</button>
      </div>
    `;
    manageStudentsListEl.appendChild(item);
  });
}

// История конкретного ученика (модалка при клике на карточку)
export function openStudentHistory(studentId) {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  if (!student.history) student.history = [];

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

export function updateTotalStudents() {
  const students = getStudents();
  totalStudentsEl.textContent = `Учеников: ${students.length}`;
}
// ===================== /РЕНДЕР =====================
