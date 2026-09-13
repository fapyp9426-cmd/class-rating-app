// ===================== УЧЕНИКИ: CRUD И БАЛЛЫ =====================
import {
  db, doc, updateDoc, deleteDoc, addDoc, studentsCol, historyCol
} from './firebase.js?v=1';
import { getStudents, getGlobalHistory } from './state.js?v=1';

const addStudentForm = document.getElementById('add-student-form');
const changeScoreForm = document.getElementById('change-score-form');
const selectStudent = document.getElementById('select-student');
const undoLastBtn = document.getElementById('undo-last-btn');

export function setScorePreset(val) {
  const input = document.getElementById('score-delta');
  if (input) input.value = val;
}

export async function editStudent(id) {
  const students = getStudents();
  const student = students.find(s => s.id === id);
  if (!student) return;

  const newName = prompt('Имя ученика:', student.name);
  if (newName === null) return;

  const newAvatar = prompt('Эмодзи ученика:', student.avatar);
  if (newAvatar === null) return;

  const newScoreStr = prompt('Количество баллов:', student.score);
  if (newScoreStr === null) return;

  const newScore = parseInt(newScoreStr, 10);

  const updates = {
    name: newName.trim() || student.name,
    avatar: newAvatar.trim() || student.avatar
  };
  if (!isNaN(newScore)) updates.score = newScore;

  try {
    await updateDoc(doc(db, "students", id), updates);
  } catch (err) {
    alert('Ошибка сохранения: ' + err.message);
  }
}

export async function deleteStudent(id) {
  const students = getStudents();
  const student = students.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Удалить ученика "${student.name}" из базы?`)) {
    try {
      await deleteDoc(doc(db, "students", id));
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  }
}

export function initStudentForms() {
  // Форма начисления/списания баллов
  changeScoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = selectStudent.value;
    const delta = parseInt(document.getElementById('score-delta').value, 10);
    const reason = document.getElementById('score-reason').value.trim();

    if (!studentId) return alert('Пожалуйста, выберите ученика!');
    if (isNaN(delta)) return alert('Пожалуйста, введите число баллов!');

    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newScore = student.score + delta;
    const actionObj = { id: Date.now() + Math.floor(Math.random() * 1000), delta, reason };
    const newHistory = [...(student.history || []), actionObj];

    try {
      await updateDoc(doc(db, "students", studentId), {
        score: newScore,
        history: newHistory
      });

      await addDoc(historyCol, {
        actionId: actionObj.id,
        studentId: student.id,
        studentName: student.name,
        delta: delta,
        reason: reason,
        createdAt: Date.now()
      });

      document.getElementById('score-delta').value = '';
      document.getElementById('score-reason').value = '';
      selectStudent.value = '';

      alert(`Успешно! ${student.name}: ${delta > 0 ? '+' : ''}${delta} б.`);
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    }
  });

  // Отмена последнего действия
  undoLastBtn.addEventListener('click', async () => {
    const globalHistory = getGlobalHistory();
    if (globalHistory.length === 0) return alert('История пуста!');

    const lastAction = globalHistory[globalHistory.length - 1];
    const students = getStudents();
    const student = students.find(s => s.id === lastAction.studentId);

    try {
      if (student) {
        const newScore = student.score - lastAction.delta;
        const newHistory = (student.history || []).filter(h => h.id !== lastAction.actionId);
        await updateDoc(doc(db, "students", student.id), {
          score: newScore,
          history: newHistory
        });
      }

      await deleteDoc(doc(db, "history", lastAction.id));

      alert('❌ Изменение отменено!');
    } catch (err) {
      alert('Ошибка отмены: ' + err.message);
    }
  });

  // Добавление нового ученика
  addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('new-name');
    const avatarInput = document.getElementById('new-avatar');
    const scoreInput = document.getElementById('new-score');

    const name = nameInput.value.trim();
    if (!name) return;

    const scoreVal = parseInt(scoreInput.value, 10);

    try {
      await addDoc(studentsCol, {
        name: name,
        avatar: avatarInput.value.trim() || '😎',
        score: isNaN(scoreVal) ? 0 : scoreVal,
        history: []
      });

      nameInput.value = '';
      avatarInput.value = '😎';
      scoreInput.value = '0';
      alert('Ученик добавлен!');
    } catch (err) {
      alert('Ошибка добавления: ' + err.message);
    }
  });
}
// ===================== /УЧЕНИКИ: CRUD И БАЛЛЫ =====================
