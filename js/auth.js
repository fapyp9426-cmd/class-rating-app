
// ===================== АВТОРИЗАЦИЯ УЧИТЕЛЯ =====================
import {
  auth,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from './firebase.js';

import {
  isTeacherLoggedIn,
  setIsTeacher
} from './state.js';

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
  } else {
    adminBtn.textContent = '👩‍🏫 Войти как учитель';
  }

}


/**
 * onAdminOpen вызывается каждый раз,
 * когда учитель открывает основную панель.
 *
 * onTeacherStateChanged вызывается каждый раз,
 * когда меняется статус учителя.
 *
 * Это позволяет отдельным модулям приложения
 * реагировать на вход/выход учителя.
 */
export function initAuth(
  onAdminOpen,
  onTeacherStateChanged = null
) {

  // Все посетители заходят анонимно,
  // пока не авторизуются как учитель.
  onAuthStateChanged(auth, (user) => {

    if (!user) {

      signInAnonymously(auth)
        .catch(err =>
          console.error(
            'Anon sign-in error:',
            err
          )
        );

      return;
    }


    // Учитель — только email/password.
    const teacher = user.providerData.some(
      provider =>
        provider.providerId === 'password'
    );


    setIsTeacher(teacher);

    updateTeacherUI();


    // Сообщаем другим модулям
    // об изменении статуса.
    if (typeof onTeacherStateChanged === 'function') {

      onTeacherStateChanged(teacher);

    }

  });


  /**
   * Кнопка панели учителя
   */
  adminBtn.addEventListener('click', () => {

    if (isTeacherLoggedIn()) {

      adminModal.classList.remove('hidden');

      onAdminOpen();

    } else {

      loginError.style.display = 'none';

      loginModal.classList.remove('hidden');

    }

  });


  /**
   * Вход учителя
   */
  teacherLoginForm.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();

      const email =
        document
          .getElementById('login-email')
          .value
          .trim();

      const password =
        document
          .getElementById('login-password')
          .value;


      try {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        loginModal.classList.add('hidden');

        teacherLoginForm.reset();

        adminModal.classList.remove('hidden');

        onAdminOpen();

      } catch (err) {

        loginError.textContent =
          '❌ Неверный email или пароль';

        loginError.style.display = 'block';

      }

    }
  );


  /**
   * Выход учителя
   */
  if (logoutBtn) {

    logoutBtn.addEventListener(
      'click',
      async () => {

        await signOut(auth);

        adminModal.classList.add('hidden');

        // После signOut onAuthStateChanged
        // снова включит анонимную авторизацию.

      }
    );

  }


  /**
   * Закрытие окна входа
   */
  if (closeLoginModalBtn) {

    closeLoginModalBtn.onclick = () => {

      loginModal.classList.add('hidden');

    };

  }


  if (loginModal) {

    loginModal.onclick = (e) => {

      if (e.target === loginModal) {

        loginModal.classList.add('hidden');

      }

    };

  }

}
// ===================== /АВТОРИЗАЦИЯ УЧИТЕЛЯ =====================
