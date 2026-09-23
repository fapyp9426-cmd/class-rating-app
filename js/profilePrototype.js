// ===================== ПРОФИЛЬ УЧЕНИКА =====================

import {
  studentsCol,
  studentAuthCol,
  profilesCol,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot
} from './firebase.js';


import {
  getTitleName
} from './rewards/titles.js';

import {
  openTitleChest
} from './rewards/chests.js';

// ===================== НАСТРОЙКИ =====================

const SESSION_KEY =
  'class_rating_student_id';

const HASH_ITERATIONS = 600000;
const HASH_LENGTH = 256;

const EMOJIS = [
  '😀',
  '😎',
  '🤓',
  '🥶',
  '🔥',
  '👑',
  '🚀',
  '⭐',
  '😈',
  '🤯'
];


let currentStudent = null;
let currentProfile = null;
let profileUnsubscribe = null;


// ===================== BASE64 =====================

function base64ToBytes(base64) {
  const binary =
    atob(base64);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return bytes;
}


// ===================== HASH =====================

async function hashPassword(
  password,
  saltBase64
) {
  const encoder =
    new TextEncoder();

  const passwordBytes =
    encoder.encode(password);

  const salt =
    base64ToBytes(
      saltBase64
    );

  const key =
    await crypto.subtle.importKey(
      'raw',
      passwordBytes,
      {
        name: 'PBKDF2'
      },
      false,
      [
        'deriveBits'
      ]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: HASH_ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      HASH_LENGTH
    );

  return new Uint8Array(
    bits
  );
}


function compareBytes(
  a,
  b
) {
  if (
    a.length !== b.length
  ) {
    return false;
  }

  let difference = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    difference |=
      a[i] ^ b[i];
  }

  return difference === 0;
}


// ===================== ПОИСК УЧЕНИКА =====================

async function findStudentByName(
  name
) {
  const normalizedName =
    String(name || '')
      .trim()
      .toLowerCase();

  if (!normalizedName) {
    return null;
  }

  const snapshot =
    await getDocs(
      studentsCol
    );

  const matches =
    snapshot.docs.filter(
      studentDoc => {

        const student =
          studentDoc.data();

        return (
          String(
            student.name || ''
          )
            .trim()
            .toLowerCase() ===
          normalizedName
        );
      }
    );

  if (
    matches.length !== 1
  ) {
    return null;
  }

  return {
    id: matches[0].id,
    ...matches[0].data()
  };
}


// ===================== ПРОВЕРКА ПАРОЛЯ =====================

async function checkPassword(
  studentId,
  password
) {
  const authRef =
    doc(
      studentAuthCol,
      studentId
    );

  const snapshot =
    await getDoc(
      authRef
    );

  if (
    !snapshot.exists()
  ) {
    return false;
  }

  const authData =
    snapshot.data();

  if (
    !authData.passwordSalt ||
    !authData.passwordHash
  ) {
    return false;
  }

  const calculatedHash =
    await hashPassword(
      password,
      authData.passwordSalt
    );

  const savedHash =
    base64ToBytes(
      authData.passwordHash
    );

  return compareBytes(
    calculatedHash,
    savedHash
  );
}


// ===================== ВХОД =====================

async function loginStudent(
  name,
  password
) {
  const student =
    await findStudentByName(
      name
    );

  if (!student) {
    throw new Error(
      'Ученик с таким именем не найден.'
    );
  }

  const correct =
    await checkPassword(
      student.id,
      password
    );

  if (!correct) {
    throw new Error(
      'Неверный пароль.'
    );
  }

  localStorage.setItem(
    SESSION_KEY,
    student.id
  );

  return student;
}


// ===================== ЗАГРУЗКА СТУДЕНТА =====================

async function loadCurrentStudent() {
  const studentId =
    localStorage.getItem(
      SESSION_KEY
    );

  if (!studentId) {
    return null;
  }

  const studentRef =
    doc(
      studentsCol,
      studentId
    );

  const snapshot =
    await getDoc(
      studentRef
    );

  if (
    !snapshot.exists()
  ) {
    localStorage.removeItem(
      SESSION_KEY
    );

    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}


// ===================== ЗАГРУЗКА ПРОФИЛЯ =====================

// ===================== ЗАГРУЗКА ПРОФИЛЯ =====================

async function loadProfile(
  student
) {
  const profileRef =
    doc(
      profilesCol,
      student.id
    );

  const snapshot =
    await getDoc(
      profileRef
    );

  if (
    snapshot.exists()
  ) {
    const data =
      snapshot.data();

    // ===================== ПРОФИЛЬ =====================

    return {
      studentId:
        student.id,

      emoji:
        data.emoji ||
        student.avatar ||
        '😀',

      chests: {
        titles:
          Number(
            data.chests?.titles
          ) || 0
      },

      unlockedTitles:
        Array.isArray(
          data.unlockedTitles
        )
          ? data.unlockedTitles
          : [],

      unlockedCardThemes:
        Array.isArray(
          data.unlockedCardThemes
        )
          ? data.unlockedCardThemes
          : [],

      selectedTitle:
        data.selectedTitle ||
        null,

      selectedCardTheme:
        data.selectedCardTheme ||
        null
    };
  }


  // Первый запуск профиля.
  // Пока наград нет — всё пусто.

const profile = {
  studentId: student.id,
  emoji: student.avatar || '😀',
  chests: {
    titles: 1
  },
  unlockedTitles: [],
  unlockedCardThemes: [],
  selectedTitle: null,
  selectedCardTheme: null
};


  await setDoc(
    profileRef,
    profile
  );


  return profile;
}


// ===================== СОХРАНЕНИЕ ПРОФИЛЯ =====================

async function saveProfile() {
  if (
    !currentStudent ||
    !currentProfile
  ) {
    return;
  }

  const status =
    document.getElementById(
      'student-profile-save-status'
    );

  if (status) {
    status.textContent =
      'Сохраняем...';
  }

  try {

    await setDoc(
      doc(
        profilesCol,
        currentStudent.id
      ),
      {
        studentId:
          currentStudent.id,

        emoji:
          currentProfile.emoji,

        // ===================== СУНДУКИ =====================

        chests: {
          titles:
            Number(
              currentProfile.chests?.titles
            ) || 0
        },

        // ===================== НАГРАДЫ =====================

        unlockedTitles:
          currentProfile.unlockedTitles || [],

        unlockedCardThemes:
          currentProfile.unlockedCardThemes || [],

        selectedTitle:
          currentProfile.selectedTitle || null,

        selectedCardTheme:
          currentProfile.selectedCardTheme || null
      },
      {
        merge: true
      }
    );

    if (status) {
      status.textContent =
        '✓ Изменения сохранены';

      setTimeout(() => {
        status.textContent = '';
      }, 2200);
    }

  } catch (error) {

    console.error(
      'Ошибка сохранения профиля:',
      error
    );

    if (status) {
      status.textContent =
        'Не удалось сохранить изменения.';
    }
  }
}


// ===================== РЕНДЕР КАРТОЧКИ =====================

function renderCard() {
  if (
    !currentStudent ||
    !currentProfile
  ) {
    return;
  }

  const card =
    document.getElementById(
      'student-profile-card'
    );

  const emoji =
    document.getElementById(
      'student-profile-card-emoji'
    );

  const name =
    document.getElementById(
      'student-profile-card-name'
    );

  const title =
    document.getElementById(
      'student-profile-card-title'
    );

  const score =
    document.getElementById(
      'student-profile-card-score'
    );


  if (emoji) {
    emoji.textContent =
      currentProfile.emoji;
  }

  if (name) {
    name.textContent =
      currentStudent.name || '';
  }

if (title) {
  title.textContent =
    getTitleName(
      currentProfile.selectedTitle
    ) || '';

  title.style.display =
    currentProfile.selectedTitle
      ? ''
      : 'none';
}
if (score) {
    score.textContent =
      `🏆 ${Number(currentStudent.score) || 0} баллов`;
  }

if (card) {
  card.dataset.theme =
    currentProfile.selectedCardTheme ||
    'default';
  }
}


// ===================== РЕНДЕР ЭМОДЗИ =====================

function renderEmojis() {
  const container =
    document.getElementById(
      'student-profile-emojis'
    );

  if (!container) {
    return;
  }

  container.innerHTML = '';

  EMOJIS.forEach(
    emoji => {

      const button =
        document.createElement(
          'button'
        );

      button.type =
        'button';

      button.className =
        'student-profile-emoji-btn';

      button.textContent =
        emoji;

      button.dataset.emoji =
        emoji;

      if (
        emoji ===
        currentProfile.emoji
      ) {
        button.classList.add(
          'active'
        );
      }

      button.addEventListener(
        'click',
        () => {

          currentProfile.emoji =
            emoji;

          renderEmojis();
          renderCard();
        }
      );

      container.appendChild(
        button
      );
    }
  );
}


// ===================== РЕНДЕР ТИТУЛОВ =====================
// ===================== РЕНДЕР ТИТУЛОВ =====================

function renderTitles() {
  const select =
    document.getElementById(
      'student-profile-title'
    );

  if (!select) return;

  select.innerHTML = '';

  const titles =
    currentProfile.unlockedTitles || [];


  // ===================== БЕЗ ТИТУЛА =====================

  const noneOption =
    document.createElement(
      'option'
    );

  noneOption.value = '';

  noneOption.textContent =
    'Без титула';

  noneOption.selected =
    !currentProfile.selectedTitle;

  select.appendChild(
    noneOption
  );


  // ===================== РАЗБЛОКИРОВАННЫЕ ТИТУЛЫ =====================

  titles.forEach(
    titleId => {

      const option =
        document.createElement(
          'option'
        );

      option.value =
        titleId;

      option.textContent =
        getTitleName(titleId) ||
        titleId;

      option.selected =
        titleId ===
        currentProfile.selectedTitle;

      select.appendChild(
        option
      );
    }
  );


  // ===================== ИЗМЕНЕНИЕ =====================

  select.onchange = () => {

    currentProfile.selectedTitle =
      select.value || null;

    renderCard();
  };
}


// ===================== РЕНДЕР ТЕМ =====================

function renderThemes() {
  const select =
    document.getElementById(
      'student-profile-theme'
    );

  if (!select) return;

  select.innerHTML = '';

  const themes =
    currentProfile.unlockedCardThemes || [];

  if (
    themes.length === 0
  ) {
    const option =
      document.createElement(
        'option'
      );

    option.value = '';
    option.textContent =
      'Нет доступных тем';

    option.selected = true;

    select.appendChild(
      option
    );

    return;
  }

  themes.forEach(theme => {
    const option =
      document.createElement(
        'option'
      );

    option.value = theme;
    option.textContent = theme;

    option.selected =
      theme ===
      currentProfile.selectedCardTheme;

    select.appendChild(
      option
    );
  });

  select.onchange = () => {
    currentProfile.selectedCardTheme =
      select.value || null;

    renderCard();
  };
}

// ===================== РЕНДЕР СУНДУКОВ =====================

function renderChests() {

  const countElement =
    document.getElementById(
      'student-profile-title-chest-count'
    );

  if (!countElement) {
    return;
  }

  const count =
    Number(
      currentProfile?.chests?.titles
    ) || 0;


  if (count === 1) {

    countElement.textContent =
      '1 сундук';

  } else if (
    count >= 2 &&
    count <= 4
  ) {

    countElement.textContent =
      `${count} сундука`;

  } else {

    countElement.textContent =
      `${count} сундуков`;
  }
}

async function handleTitleChestClick() {

  if (!currentStudent) {
    return;
  }

  const chestCount =
    Number(
      currentProfile?.chests?.titles
    ) || 0;

  if (chestCount <= 0) {
    return;
  }

  const modal =
    document.getElementById(
      'student-profile-chest-modal'
    );

  const animation =
    document.getElementById(
      'student-profile-chest-animation'
    );

  const info =
    document.getElementById(
      'student-profile-chest-info'
    );

  const reward =
    document.getElementById(
      'student-profile-chest-reward'
    );

  const rewardTitle =
    document.getElementById(
      'student-profile-chest-reward-title'
    );

  const closeButton =
    document.getElementById(
      'student-profile-chest-close'
    );

console.log('CHEST ELEMENTS:', {
  modal: !!modal,
  animation: !!animation,
  info: !!info,
  reward: !!reward,
  rewardTitle: !!rewardTitle,
  closeButton: !!closeButton
});


  if (
    !modal ||
    !animation ||
    !info ||
    !reward ||
    !rewardTitle ||
    !closeButton
  ) {
    console.error(
      'Элементы анимации сундука не найдены.'
    );

    return;
  }

  modal.classList.remove('hidden');

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  reward.classList.add('hidden');
  info.classList.add('hidden');
  closeButton.classList.add('hidden');

  closeButton.textContent =
    'Забрать награду';

  animation.classList.remove(
    'is-shaking'
  );

  animation.textContent = '🎁';

  await new Promise(
    resolve =>
      setTimeout(resolve, 250)
  );

  animation.classList.add(
    'is-shaking'
  );

  await new Promise(
    resolve =>
      setTimeout(resolve, 700)
  );

  try {

    const result =
      await openTitleChest(
        currentStudent.id
      );

    if (!result.success) {

      animation.classList.remove(
        'is-shaking'
      );

      if (
        result.reason ===
        'all_titles_unlocked'
      ) {

        animation.textContent = '🏆';

        info.classList.remove(
          'hidden'
        );

        closeButton.textContent =
          'Понятно';

        closeButton.classList.remove(
          'hidden'
        );

        const closeModal = () => {

          modal.classList.add(
            'hidden'
          );

          modal.setAttribute(
            'aria-hidden',
            'true'
          );

          closeButton.removeEventListener(
            'click',
            closeModal
          );
        };

        closeButton.addEventListener(
          'click',
          closeModal
        );

        return;
      }

      closeButton.textContent =
        'Закрыть';

      closeButton.classList.remove(
        'hidden'
      );

      return;
    }

    currentProfile.chests = {
      titles: result.chestCount
    };

    currentProfile.unlockedTitles =
      Array.isArray(
        currentProfile.unlockedTitles
      )
        ? currentProfile.unlockedTitles
        : [];

    if (
      !currentProfile.unlockedTitles.includes(
        result.title.id
      )
    ) {
      currentProfile.unlockedTitles.push(
        result.title.id
      );
    }

    currentProfile.selectedTitle =
      result.title.id;

    renderProfile();

    animation.classList.remove(
      'is-shaking'
    );

    animation.textContent = '✨';

    rewardTitle.textContent =
      result.title.name;

    reward.classList.remove(
      'hidden'
    );

    closeButton.classList.remove(
      'hidden'
    );

    const closeModal = () => {

      modal.classList.add(
        'hidden'
      );

      modal.setAttribute(
        'aria-hidden',
        'true'
      );

      closeButton.removeEventListener(
        'click',
        closeModal
      );
    };

    closeButton.addEventListener(
      'click',
      closeModal
    );

  } catch (error) {

    console.error(
      'Ошибка открытия сундука:',
      error
    );

    animation.classList.remove(
      'is-shaking'
    );

    closeButton.textContent =
      'Закрыть';

    closeButton.classList.remove(
      'hidden'
    );
  }
}




  

// ===================== ПОЛНЫЙ РЕНДЕР =====================

function renderProfile() {
  renderCard();
  renderEmojis();
  renderTitles();
  renderThemes();
  renderChests();
}


// ===================== СИНХРОНИЗАЦИЯ FIRESTORE =====================

function startProfileSync(
  studentId
) {
  stopProfileSync();

  const profileRef =
    doc(
      profilesCol,
      studentId
    );

  profileUnsubscribe =
    onSnapshot(
      profileRef,
      snapshot => {

        if (
          !snapshot.exists()
        ) {
          return;
        }

        const data =
          snapshot.data();


        currentProfile = {
          studentId,

          emoji:
            data.emoji ||
            '😀',

          // ===================== СУНДУКИ =====================

          chests: {
            titles:
              Number(
                data.chests?.titles
              ) || 0
          },

          // ===================== НАГРАДЫ =====================

          unlockedTitles:
            Array.isArray(
              data.unlockedTitles
            )
              ? data.unlockedTitles
              : [],

          unlockedCardThemes:
            Array.isArray(
              data.unlockedCardThemes
            )
              ? data.unlockedCardThemes
              : [],

          selectedTitle:
            data.selectedTitle ||
            null,

          selectedCardTheme:
            data.selectedCardTheme ||
            null
        };


        renderProfile();
      },

      error => {

        console.error(
          'Ошибка синхронизации профиля:',
          error
        );

      }
    );
}


function stopProfileSync() {

  if (
    profileUnsubscribe
  ) {
    profileUnsubscribe();

    profileUnsubscribe =
      null;
  }
}
// ===================== ОКНО ВХОДА =====================

function openLoginModal() {
  const modal =
    document.getElementById(
      'student-profile-login-modal'
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    'hidden'
  );

  const nameInput =
    document.getElementById(
      'student-profile-name'
    );

  if (nameInput) {
    nameInput.focus();
  }
}


function closeLoginModal() {
  const modal =
    document.getElementById(
      'student-profile-login-modal'
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    'hidden'
  );

  const error =
    document.getElementById(
      'student-profile-login-error'
    );

  if (error) {
    error.textContent = '';

    error.classList.add(
      'hidden'
    );
  }
}


// ===================== ПРОФИЛЬ ПОСЛЕ ВХОДА =====================

function showLoggedInProfile() {
  document
    .getElementById(
      'student-profile-login-view'
    )
    ?.classList.add(
      'hidden'
    );

  document
    .getElementById(
      'student-profile-user-view'
    )
    ?.classList.remove(
      'hidden'
    );
}


// ===================== ВЫХОД =====================

function logoutStudent() {
  stopProfileSync();

  currentStudent = null;
  currentProfile = null;

  localStorage.removeItem(
    SESSION_KEY
  );

  document
    .getElementById(
      'student-profile-user-view'
    )
    ?.classList.add(
      'hidden'
    );

  document
    .getElementById(
      'student-profile-login-view'
    )
    ?.classList.remove(
      'hidden'
    );
}


// ===================== ОТКРЫТИЕ СТРАНИЦЫ =====================

export async function openStudentProfile() {

  const student =
    await loadCurrentStudent();

  if (!student) {
    openLoginModal();
    return;
  }

  currentStudent =
    student;

  currentProfile =
    await loadProfile(
      student
    );

  showLoggedInProfile();

  renderProfile();

  startProfileSync(
    student.id
  );
}


// ===================== ИНИЦИАЛИЗАЦИЯ =====================

export function initProfilePrototype() {

  const titleChest =
  document.querySelector(
    '.student-profile-chest'
  );


if (titleChest) {

  titleChest.addEventListener(
    'click',
    handleTitleChestClick
  );
}

  const profileLoginButton =
    document.getElementById(
      'profile-login-btn'
    );

  const loginClose =
    document.getElementById(
      'student-profile-login-close'
    );

  const loginBackdrop =
    document.getElementById(
      'student-profile-login-backdrop'
    );

  const loginForm =
    document.getElementById(
      'student-profile-login-form'
    );

  const saveButton =
    document.getElementById(
      'student-profile-save'
    );

  const logoutButton =
    document.getElementById(
      'student-profile-logout'
    );


  // Кнопка «Войти»
  if (profileLoginButton) {
    profileLoginButton.addEventListener(
      'click',
      openLoginModal
    );
  }


  // Закрытие окна
  if (loginClose) {
    loginClose.addEventListener(
      'click',
      closeLoginModal
    );
  }


  if (loginBackdrop) {
    loginBackdrop.addEventListener(
      'click',
      closeLoginModal
    );
  }


  // Авторизация
  if (loginForm) {

    loginForm.addEventListener(
      'submit',
      async event => {

        event.preventDefault();

        const name =
          document
            .getElementById(
              'student-profile-name'
            )
            .value
            .trim();

        const password =
          document
            .getElementById(
              'student-profile-password'
            )
            .value;

        const error =
          document.getElementById(
            'student-profile-login-error'
          );

        error.classList.add(
          'hidden'
        );

        try {

          const student =
            await loginStudent(
              name,
              password
            );

          currentStudent =
            student;

          currentProfile =
            await loadProfile(
              student
            );

          loginForm.reset();

          closeLoginModal();

          showLoggedInProfile();

          renderProfile();

          startProfileSync(
            student.id
          );

        } catch (err) {

          error.textContent =
            `❌ ${err.message}`;

          error.classList.remove(
            'hidden'
          );
        }
      }
    );
  }


  // Сохранение
  if (saveButton) {
    saveButton.addEventListener(
      'click',
      saveProfile
    );
  }


  // Выход
  if (logoutButton) {
    logoutButton.addEventListener(
      'click',
      logoutStudent
    );
  }


  // Если уже входил раньше —
  // сразу загружаем профиль.
  if (
    localStorage.getItem(
      SESSION_KEY
    )
  ) {
    openStudentProfile();
  }
}


// ===================== /ПРОФИЛЬ УЧЕНИКА =====================