// ===================== АВТОРИЗАЦИЯ УЧИТЕЛЯ =====================
import {
  auth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from './firebase.js';
import { isTeacherLoggedIn, setIsTeacher } from './state.js';

const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');

const loginModal = document.getElementById('login-modal');
const closeLoginModalBtn = document.getElementById('close-login-modal-btn');
const teacherLoginForm = document.getElementById('teacher-login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

function updateTeacherUI() {
  if (isTeacherLoggedIn()) {
    adminBtn.textContent = '👩‍🏫 Панель учителя';
  }
}

// onAdminOpen вызывается каждый раз, когда учителю открывается панель
// (используется, чтобы заодно обновить превью печати)
export function initAuth(onAdminOpen) {
  // Все посетители (включая учеников) заходят анонимно — это нужно,
  // чтобы Firestore Rules вообще давали читать данные
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch(err => console.error("Anon sign-in error:", err));
      return;
    }
    // Считаем учителем только если вход был именно по email/паролю
    setIsTeacher(user.providerData.some(p => p.providerId === 'password'));
    updateTeacherUI();
  });

  adminBtn.addEventListener('click', () => {
    if (isTeacherLoggedIn()) {
      adminModal.classList.remove('hidden');
      onAdminOpen();
    } else {
      loginError.style.display = 'none';
      loginModal.classList.remove('hidden');
    }
  });

  teacherLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginModal.classList.add('hidden');
      teacherLoginForm.reset();
      adminModal.classList.remove('hidden');
      onAdminOpen();
    } catch (err) {
      loginError.textContent = '❌ Неверный email или пароль';
      loginError.style.display = 'block';
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      adminModal.classList.add('hidden');
      // signOut разлогинит и включит анонимный вход снова через onAuthStateChanged
    });
  }

  if (closeLoginModalBtn) closeLoginModalBtn.onclick = () => loginModal.classList.add('hidden');
  if (loginModal) loginModal.onclick = (e) => { if (e.target === loginModal) loginModal.classList.add('hidden'); };
}
// ===================== /АВТОРИЗАЦИЯ УЧИТЕЛЯ =====================
