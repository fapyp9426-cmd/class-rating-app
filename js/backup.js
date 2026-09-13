// ===================== РЕЗЕРВНОЕ КОПИРОВАНИЕ =====================
import { db, studentsCol, historyCol, doc, writeBatch, getDocs } from './firebase.js?v=1';
import { getStudents, getGlobalHistory } from './state.js?v=1';

const exportJsonBtn = document.getElementById('export-json-btn');
const importJsonFile = document.getElementById('import-json-file');
const resetAllBtn = document.getElementById('reset-all-btn');

export function initBackup() {
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const dataObj = { students: getStudents(), globalHistory: getGlobalHistory(), exportDate: new Date().toISOString() };
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
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.students)) {
            if (!confirm('Это заменит ВСЕХ текущих учеников данными из файла. Продолжить?')) return;

            // Удаляем текущих учеников
            const existing = await getDocs(studentsCol);
            const batch1 = writeBatch(db);
            existing.forEach(d => batch1.delete(d.ref));
            await batch1.commit();

            // Добавляем новых
            const batch2 = writeBatch(db);
            parsed.students.forEach(s => {
              const ref = doc(studentsCol);
              batch2.set(ref, {
                name: s.name,
                avatar: s.avatar || '😎',
                score: s.score || 0,
                history: s.history || []
              });
            });
            await batch2.commit();

            alert('Данные успешно импортированы!');
          } else {
            alert('Некорректная структура JSON-файла!');
          }
        } catch (err) {
          alert('Ошибка при чтении файла JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', async () => {
      if (confirm('ВНИМАНИЕ! Это действие удалит всех учеников и всю историю. Продолжить?')) {
        try {
          const studentsSnap = await getDocs(studentsCol);
          const historySnap = await getDocs(historyCol);
          const batch = writeBatch(db);
          studentsSnap.forEach(d => batch.delete(d.ref));
          historySnap.forEach(d => batch.delete(d.ref));
          await batch.commit();
          alert('Все данные сброшены!');
        } catch (err) {
          alert('Ошибка сброса: ' + err.message);
        }
      }
    });
  }
}
// ===================== /РЕЗЕРВНОЕ КОПИРОВАНИЕ =====================
