// ===================== ТОЧКА ВХОДА =====================
import { onSnapshot, studentsCol, historyCol } from './firebase.js';
import { setStudents, setGlobalHistory } from './state.js';

import {
  renderPodium, renderStudentsList, renderSelectOptions,
  renderGlobalHistory, renderManageStudentsList, updateTotalStudents
} from './render.js';
import { initSort } from './sort.js';
import { initAutoSeason } from './seasons.js';
import { updatePrintPreview, initPrint } from './print.js';
import { editStudent, deleteStudent, setScorePreset, initStudentForms } from './students.js';
import { initBackup } from './backup.js';
import { initAuth } from './auth.js';
import { initUI } from './ui.js';
import { MAINTENANCE_MODE, initMaintenance } from './maintenance.js';
import { initLoading } from './loading.js';
import { initNavigation } from './navigation.js';
import { initFeed } from './feed.js';

initMaintenance();

// Пока идёт технический перерыв — не грузим Firestore и не запускаем остальной сайт,
// чтобы не тратить трафик/батарею на слабых устройствах впустую.
if (!MAINTENANCE_MODE) {

initLoading();

// Рендер вызывается автоматически при любом изменении данных в Firestore
// (см. onSnapshot ниже), поэтому здесь только отрисовка — без сохранения.
function renderAll() {
  try {
    renderPodium();
    renderStudentsList();
    renderSelectOptions();
    renderGlobalHistory();
    renderManageStudentsList();
    updatePrintPreview();
    updateTotalStudents();
  } catch (err) {
    console.error('Ошибка внутри renderAll:', err);
  }
}

// Подписки на realtime-обновления Firestore — работают для всех устройств одновременно
onSnapshot(studentsCol, (snapshot) => {
  const students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  students.sort((a, b) => b.score - a.score);
  setStudents(students);
  renderAll();
}, (err) => console.error("students onSnapshot error:", err));

onSnapshot(historyCol, (snapshot) => {
  const globalHistory = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  setGlobalHistory(globalHistory);
  renderAll();
}, (err) => console.error("history onSnapshot error:", err));

initSort(renderStudentsList);
initPrint();
initStudentForms();
initBackup();
initAuth(updatePrintPreview);
initUI();
initAutoSeason();
initNavigation();
initFeed();

// app.js подключён как type="module" — функции, вызываемые из inline onclick="..."
// в HTML (renderManageStudentsList, setScorePreset), нужно явно повесить на window,
// иначе браузер их не найдёт.
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.setScorePreset = setScorePreset;

}
// ===================== /ТОЧКА ВХОДА =====================