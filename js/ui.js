// ===================== ОБЩИЙ UI: МОДАЛКИ И ВКЛАДКИ =====================
const adminModal = document.getElementById('admin-modal');
const closeAdminModalBtn = document.getElementById('close-admin-modal-btn');

const studentModal = document.getElementById('student-modal');
const closeStudentModalBtn = document.getElementById('close-student-modal-btn');

export function initUI() {
  // Переключение вкладок в панели учителя
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Закрытие модалок
  if (closeAdminModalBtn) closeAdminModalBtn.onclick = () => adminModal.classList.add('hidden');
  if (closeStudentModalBtn) closeStudentModalBtn.onclick = () => studentModal.classList.add('hidden');

  if (adminModal) adminModal.onclick = (e) => { if (e.target === adminModal) adminModal.classList.add('hidden'); };
  if (studentModal) studentModal.onclick = (e) => { if (e.target === studentModal) studentModal.classList.add('hidden'); };
}
// ===================== /ОБЩИЙ UI =====================
