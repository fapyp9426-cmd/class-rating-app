// ===================== ТОЧКА ВХОДА =====================
import { onSnapshot, studentsCol, historyCol } from './firebase.js?v=3';
import { setStudents, setGlobalHistory } from './state.js?v=3';

import {
  renderPodium, renderStudentsList, renderSelectOptions,
  renderGlobalHistory, renderManageStudentsList, updateTotalStudents
} from './render.js?v=3';
import { initSort } from './sort.js?v=3';
import { initAutoSeason } from './seasons.js?v=3';
import { updatePrintPreview, initPrint } from './print.js?v=3';
import { editStudent, deleteStudent, setScorePreset, initStudentForms } from './students.js?v=3';
import { initBackup } from './backup.js?v=3';
import { initAuth } from './auth.js?v=3';
import { initUI } from './ui.js?v=3';
import { MAINTENANCE_MODE, initMaintenance } from './maintenance.js?v=3';
import { initLoading, markDataReady } from './loading.js?v=3';

initMaintenance();
console.log('[DEBUG] main.js запустился, MAINTENANCE_MODE =', MAINTENANCE_MODE);

// Пока идёт технический перерыв — не грузим Firestore и не запускаем остальной сайт,
// чтобы не тратить трафик/батарею на слабых устройствах впустую.
if (!MAINTENANCE_MODE) {

initLoading();

// Рендер вызывается автоматически при любом изменении данных в Firestore
// (см. onSnapshot ниже), поэтому здесь только отрисовка — без сохранения.
function renderAll() {
  renderPodium();
  renderStudentsList();
  renderSelectOptions();
  renderGlobalHistory();
  renderManageStudentsList();
  updatePrintPreview();
  updateTotalStudents();
}

// Подписки на realtime-обновления Firestore — работают для всех устройств одновременно
onSnapshot(studentsCol, (snapshot) => {
  console.log('[DEBUG] students onSnapshot сработал, документов:', snapshot.docs.length, 'empty:', snapshot.empty, 'metadata:', snapshot.metadata);
  const students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('[DEBUG] students массив после map:', students);
  students.sort((a, b) => b.score - a.score);
  setStudents(students);
  renderAll();
  markDataReady();
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

// app.js подключён как type="module" — функции, вызываемые из inline onclick="..."
// в HTML (renderManageStudentsList, setScorePreset), нужно явно повесить на window,
// иначе браузер их не найдёт.
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.setScorePreset = setScorePreset;

}
// ===================== /ТОЧКА ВХОДА =====================