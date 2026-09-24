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
  TITLES,
  getTitleName,
  getTitleById
} from './rewards/titles.js';

import {
  getCardThemeById
} from './rewards/themes.js';

import {
  openTitleChest,
  openThemeChest
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

let isTitleChestOpening = false;
let isThemeChestOpening = false;


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
    ) || 0,

  themes:
    Number(
      data.chests?.themes
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
  titles: 1,
  themes: 0
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
    ) || 0,

  themes:
    Number(
      currentProfile.chests?.themes
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

  const customInput =
    document.getElementById(
      'student-profile-custom-emoji-input'
    );

  const customButton =
    document.getElementById(
      'student-profile-custom-emoji-btn'
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

          if (customInput) {
            customInput.value =
              emoji;
          }

          renderEmojis();
          renderCard();
        }
      );

      container.appendChild(
        button
      );
    }
  );


  // =====================
  // СВОЙ ЭМОДЗИ
  // =====================

  if (
    customInput &&
    customButton
  ) {

    // Показываем текущий эмодзи
    customInput.value =
      currentProfile.emoji || '';


    // Чтобы обработчик не создавался
    // заново при каждом renderEmojis()
    customButton.onclick =
      () => {

        const value =
          customInput.value
            .trim();

        if (!value) {
          return;
        }


        // Берём только первый эмодзи
        // даже если пользователь вставил несколько
        const segments =
          typeof Intl.Segmenter === 'function'
            ? [
                ...new Intl.Segmenter(
                  undefined,
                  {
                    granularity: 'grapheme'
                  }
                ).segment(value)
              ]
            : Array.from(value);

        const emoji =
          segments[0]?.segment || '';

        if (!emoji) {
          return;
        }


        // Устанавливаем только один эмодзи
        currentProfile.emoji =
          emoji;

        renderEmojis();
        renderCard();

      };
  }
}


// ===================== РЕНДЕР ТИТУЛОВ =====================

function renderTitles() {

  const selector =
    document.getElementById(
      'student-profile-title'
    );

  const preview =
    document.getElementById(
      'student-profile-title-preview'
    );

  if (!selector || !preview) {
    return;
  }


  // ===================== ТЕКУЩИЙ ТИТУЛ =====================

  const selectedTitle =
    currentProfile.selectedTitle;

  if (!selectedTitle) {

    preview.textContent =
      'Без титула';

    preview.style.removeProperty(
      '--title-color'
    );

  } else {

    const title =
      getTitleById(
        selectedTitle
      );

    preview.textContent =
      title
        ? title.name
        : 'Без титула';

    if (title) {

      preview.style.setProperty(
        '--title-color',
        title.color
      );

    }
  }


  // ===================== ОТКРЫТИЕ ОКНА =====================

  selector.onclick = () => {

    openTitleSelectionModal();

  };

}

function renderThemes() {

  const inventory =
    document.getElementById(
      'student-profile-theme-inventory'
    );

  if (!inventory) {
    return;
  }


  inventory.innerHTML = '';


  const themes =
    currentProfile?.unlockedCardThemes || [];


  if (themes.length === 0) {

    inventory.innerHTML = `
      <div class="student-profile-theme-empty">
        <div class="student-profile-theme-empty-icon">
          🎨
        </div>

        <strong>
          Тем пока нет
        </strong>

        <span>
          Открывай сундуки тем, чтобы получить новые оформления.
        </span>
      </div>
    `;

    return;
  }


  themes.forEach(themeId => {

    const theme =
      getCardThemeById(
        themeId
      );

    if (!theme) {
      return;
    }


    const isSelected =
      currentProfile.selectedCardTheme ===
      theme.id;


    const item =
      document.createElement(
        'div'
      );

    item.className =
      'student-profile-theme-item';


    if (isSelected) {
      item.classList.add(
        'selected'
      );
    }


    item.dataset.theme =
      theme.id;


    item.innerHTML = `

      <div class="student-profile-theme-preview">

        <div class="student-profile-theme-preview-glow"></div>

        <div class="student-profile-theme-preview-content">

          <div class="student-profile-theme-preview-avatar">
            ${currentProfile.emoji || '😀'}
          </div>

          <div class="student-profile-theme-preview-name">
            ${theme.name}
          </div>

          <div class="student-profile-theme-preview-score">
            999 очков
          </div>

        </div>

      </div>


      <div class="student-profile-theme-item-info">

        <strong>
          ${theme.name}
        </strong>

        <span>
          ${theme.description}
        </span>

      </div>


      <button
        class="student-profile-theme-equip"
        type="button"
      >
        ${
          isSelected
            ? 'Надето'
            : 'Надеть'
        }
      </button>

    `;


    const equipButton =
      item.querySelector(
        '.student-profile-theme-equip'
      );


    equipButton.addEventListener(
      'click',
      () => {

        if (
          currentProfile.selectedCardTheme ===
          theme.id
        ) {
          return;
        }


        currentProfile.selectedCardTheme =
          theme.id;


        renderProfile();

      }
    );


    inventory.appendChild(
      item
    );

  });

}

// ===================== ОКНО ВЫБОРА ТИТУЛА =====================

function openTitleSelectionModal() {

  let modal =
    document.getElementById(
      'title-selection-modal'
    );

  if (!modal) {

    modal =
      document.createElement(
        'div'
      );

    modal.id =
      'title-selection-modal';

    modal.className =
      'modal-overlay hidden no-print';

    modal.innerHTML = `
      <div class="title-selection-modal">

        <div class="title-selection-header">

          <div>
            <h3>Выбор титула</h3>

            <span
              id="title-selection-count"
              class="title-selection-count"
            >
              0 из ${TITLES.length} открыто
            </span>
          </div>

          <button
            type="button"
            class="close-btn"
            id="close-title-selection"
          >
            &times;
          </button>

        </div>


        <div class="title-selection-search">

          <input
            id="title-selection-search"
            type="text"
            placeholder="Поиск титула..."
            autocomplete="off"
          >

        </div>


        <div
          id="title-selection-list"
          class="title-selection-list"
        ></div>

      </div>
    `;

    document.body.appendChild(
      modal
    );


    // Закрытие

    document
      .getElementById(
        'close-title-selection'
      )
      .onclick = () => {

        closeTitleSelectionModal();

      };


    modal.addEventListener(
      'click',
      event => {

        if (
          event.target ===
          modal
        ) {

          closeTitleSelectionModal();

        }

      }
    );


    document
      .getElementById(
        'title-selection-search'
      )
      .addEventListener(
        'input',
        renderTitleSelectionList
      );

  }


  renderTitleSelectionList();

  modal.classList.remove(
    'hidden'
  );

}


// ===================== СПИСОК ТИТУЛОВ =====================

function renderTitleSelectionList() {

  const list =
    document.getElementById(
      'title-selection-list'
    );

  const count =
    document.getElementById(
      'title-selection-count'
    );

  const search =
    document.getElementById(
      'title-selection-search'
    );

  if (
    !list ||
    !count
  ) {
    return;
  }


  const unlocked =
    currentProfile.unlockedTitles || [];


  count.textContent =
    `${unlocked.length} из ${TITLES.length} открыто`;


  const query =
    search
      ? search.value
          .trim()
          .toLowerCase()
      : '';


  list.innerHTML = '';


  // Без титула

  const none =
    document.createElement(
      'button'
    );

  none.className =
    'title-selection-item' +
    (
      !currentProfile.selectedTitle
        ? ' selected'
        : ''
    );

  none.innerHTML = `
    <span class="title-selection-name">
      Без титула
    </span>
  `;

  none.onclick = () => {

    currentProfile.selectedTitle =
      null;

    renderCard();
    renderTitles();

    closeTitleSelectionModal();

  };

  list.appendChild(
    none
  );


  // Все титулы

  TITLES
    .filter(title => {

      if (!query) {
        return true;
      }

      return title.name
        .toLowerCase()
        .includes(query);

    })
    .forEach(title => {

      const isUnlocked =
        unlocked.includes(
          title.id
        );

      const item =
        document.createElement(
          'button'
        );

      item.type = 'button';

      item.className =
        'title-selection-item' +
        (
          isUnlocked
            ? ''
            : ' locked'
        ) +
        (
          title.id ===
          currentProfile.selectedTitle
            ? ' selected'
            : ''
        );

      item.style.setProperty(
        '--title-color',
        title.color
      );


      item.innerHTML = `
        <span
          class="title-selection-name"
        >
          ${title.name}
        </span>

        ${
          !isUnlocked
            ? `
              <span class="title-selection-lock">
                🔒
              </span>
            `
            : ''
        }
      `;


      if (isUnlocked) {

        item.onclick = () => {

          currentProfile.selectedTitle =
            title.id;

          renderCard();
          renderTitles();

          closeTitleSelectionModal();

        };

      }


      list.appendChild(
        item
      );

    });

}


// ===================== ЗАКРЫТИЕ =====================

function closeTitleSelectionModal() {

  const modal =
    document.getElementById(
      'title-selection-modal'
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    'hidden'
  );

}

// ===================== РЕНДЕР СУНДУКОВ =====================

function renderChests() {

  const titleCountElement =
    document.getElementById(
      'student-profile-title-chest-count'
    );

  const themeCountElement =
    document.getElementById(
      'student-profile-theme-chest-count'
    );


  // ===================== СУНДУК ТИТУЛОВ =====================

  if (titleCountElement) {

    const titleCount =
      Number(
        currentProfile?.chests?.titles
      ) || 0;

    titleCountElement.textContent =
      formatChestCount(
        titleCount
      );
  }


  // ===================== СУНДУК ТЕМ =====================

  if (themeCountElement) {

    const themeCount =
      Number(
        currentProfile?.chests?.themes
      ) || 0;

    themeCountElement.textContent =
      formatChestCount(
        themeCount
      );
  }

}


// ===================== ФОРМАТ СЧЁТЧИКА =====================

function formatChestCount(
  count
) {

  if (count === 1) {
    return '1 сундук';
  }

  if (
    count >= 2 &&
    count <= 4
  ) {
    return `${count} сундука`;
  }

  return `${count} сундуков`;
}

// ===================== ОТКРЫТИЕ СУНДУКА ТИТУЛОВ =====================
// ===================== СУНДУК ТИТУЛОВ =====================

async function handleTitleChestClick() {

  // Защита от двойного тапа
  if (isTitleChestOpening) {
    return;
  }

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

  const chestButton =
    document.getElementById(
      'student-profile-title-chest'
    );

  if (
    !modal ||
    !animation ||
    !info ||
    !reward ||
    !rewardTitle ||
    !closeButton
  ) {

    console.error(
      'Элементы сундука титулов не найдены.'
    );

    return;
  }


  // =====================================================
  // БЛОКИРУЕМ ПОВТОРНЫЙ ЗАПУСК
  // =====================================================

  isTitleChestOpening = true;

  if (chestButton) {
    chestButton.style.pointerEvents = 'none';
    chestButton.setAttribute(
      'aria-disabled',
      'true'
    );
  }


  // =====================================================
  // ФУНКЦИЯ ПОЛНОГО СБРОСА
  // =====================================================

  const resetChestState = () => {

    isTitleChestOpening = false;

    if (chestButton) {
      chestButton.style.pointerEvents = '';
      chestButton.removeAttribute(
        'aria-disabled'
      );
    }
  };


  // =====================================================
  // ФУНКЦИЯ ЗАКРЫТИЯ
  // =====================================================

  const closeChest = () => {

    modal.classList.add(
      'hidden'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    animation.classList.remove(
      'is-shaking'
    );

    reward.classList.add(
      'hidden'
    );

    info.classList.add(
      'hidden'
    );

    closeButton.classList.add(
      'hidden'
    );

    closeButton.onclick = null;

    resetChestState();
  };


  // =====================================================
  // НАЧАЛЬНОЕ СОСТОЯНИЕ
  // =====================================================

  modal.classList.remove(
    'hidden'
  );

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  animation.classList.remove(
    'is-shaking'
  );

  animation.textContent =
    '🎁';

  reward.classList.add(
    'hidden'
  );

  info.classList.add(
    'hidden'
  );

  closeButton.classList.add(
    'hidden'
  );

  closeButton.textContent =
    'Забрать награду';

  closeButton.onclick = null;


  // =====================================================
  // НЕБОЛЬШАЯ ПАУЗА
  // =====================================================

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        250
      )
  );


  // =====================================================
  // ЗАПУСК АНИМАЦИИ
  // =====================================================

  animation.classList.add(
    'is-shaking'
  );


  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        700
      )
  );


  // =====================================================
  // ОТКРЫТИЕ СУНДУКА В FIREBASE
  // =====================================================

  try {

    const result =
      await openTitleChest(
        currentStudent.id
      );


    // ===================================================
    // НЕ УДАЛОСЬ ОТКРЫТЬ
    // ===================================================

    if (!result?.success) {

      animation.classList.remove(
        'is-shaking'
      );


      // -----------------------------------------------
      // ВСЕ ТИТУЛЫ УЖЕ СОБРАНЫ
      // -----------------------------------------------

      if (
        result?.reason ===
        'all_titles_unlocked'
      ) {

        animation.textContent =
          '🏆';

        info.classList.remove(
          'hidden'
        );

        closeButton.textContent =
          'Понятно';

        closeButton.classList.remove(
          'hidden'
        );

        closeButton.onclick =
          closeChest;

        return;
      }


      // -----------------------------------------------
      // ДРУГАЯ ОШИБКА
      // -----------------------------------------------

      closeButton.textContent =
        'Закрыть';

      closeButton.classList.remove(
        'hidden'
      );

      closeButton.onclick =
        closeChest;

      return;
    }


    // ===================================================
    // ОБНОВЛЯЕМ ДАННЫЕ ПРОФИЛЯ
    // ===================================================

    currentProfile.chests = {
      ...currentProfile.chests,

      titles:
        Number(
          result.chestCount
        ) || 0
    };


    currentProfile.unlockedTitles =
      Array.isArray(
        currentProfile.unlockedTitles
      )
        ? currentProfile.unlockedTitles
        : [];


    if (
      result.title?.id &&
      !currentProfile.unlockedTitles.includes(
        result.title.id
      )
    ) {

      currentProfile.unlockedTitles.push(
        result.title.id
      );
    }


    if (result.title?.id) {

      currentProfile.selectedTitle =
        result.title.id;
    }


    // ===================================================
    // ОБНОВЛЯЕМ ИНТЕРФЕЙС
    // ===================================================

    renderProfile();


    // ===================================================
    // ПОКАЗЫВАЕМ НАГРАДУ
    // ===================================================

    animation.classList.remove(
      'is-shaking'
    );

    animation.textContent =
      '✨';

    rewardTitle.textContent =
      result.title?.name ||
      'Новый титул';

    reward.classList.remove(
      'hidden'
    );

    closeButton.textContent =
      'Забрать награду';

    closeButton.classList.remove(
      'hidden'
    );

    closeButton.onclick =
      closeChest;


  } catch (error) {

    console.error(
      'Ошибка открытия сундука титулов:',
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

    closeButton.onclick =
      closeChest;
  }
}


// ===================== СУНДУК ТЕМ =====================

async function handleThemeChestClick() {

  // Защита от двойного тапа
  if (isThemeChestOpening) {
    return;
  }

  if (!currentStudent) {
    return;
  }


  const themeCount =
    Number(
      currentProfile?.chests?.themes
    ) || 0;

  if (themeCount <= 0) {
    return;
  }


  const modal =
    document.getElementById(
      'student-profile-theme-chest-modal'
    );

  const dialog =
    modal?.querySelector(
      '.student-profile-theme-chest-dialog'
    );

  const animation =
    document.getElementById(
      'student-profile-theme-chest-animation'
    );

  const reward =
    document.getElementById(
      'student-profile-theme-chest-reward'
    );

  const rewardTitle =
    document.getElementById(
      'student-profile-theme-chest-reward-title'
    );

  const rewardDescription =
    document.getElementById(
      'student-profile-theme-chest-reward-description'
    );

  const rewardPreview =
    document.getElementById(
      'student-profile-theme-preview'
    );

  const info =
    document.getElementById(
      'student-profile-theme-chest-info'
    );

  const closeButton =
    document.getElementById(
      'student-profile-theme-chest-close'
    );

  const backdrop =
    document.getElementById(
      'student-profile-theme-chest-modal-backdrop'
    );

  const chestButton =
    document.getElementById(
      'student-profile-theme-chest'
    );


  if (
    !modal ||
    !dialog ||
    !animation ||
    !reward ||
    !rewardTitle ||
    !rewardDescription ||
    !closeButton
  ) {

    console.error(
      'Элементы сундука тем не найдены.'
    );

    return;
  }


  // =====================================================
  // БЛОКИРУЕМ ПОВТОРНЫЙ ЗАПУСК
  // =====================================================

  isThemeChestOpening = true;

  if (chestButton) {
    chestButton.style.pointerEvents = 'none';
    chestButton.setAttribute(
      'aria-disabled',
      'true'
    );
  }


  // =====================================================
  // СБРОС СОСТОЯНИЯ
  // =====================================================

  const resetChestState = () => {

    isThemeChestOpening = false;

    if (chestButton) {
      chestButton.style.pointerEvents = '';
      chestButton.removeAttribute(
        'aria-disabled'
      );
    }
  };


  // =====================================================
  // ЗАКРЫТИЕ
  // =====================================================

  const closeChest = () => {

    modal.classList.add(
      'hidden'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    dialog.classList.remove(
      'is-opening'
    );

    animation.classList.remove(
      'hidden'
    );

    reward.classList.add(
      'hidden'
    );

    info?.classList.add(
      'hidden'
    );

    closeButton.classList.add(
      'hidden'
    );

    closeButton.onclick = null;

    if (backdrop) {
      backdrop.onclick = null;
    }

    renderProfile();

    resetChestState();
  };


  // =====================================================
  // НАЧАЛЬНЫЙ СБРОС
  // =====================================================

  dialog.classList.remove(
    'is-opening'
  );

  animation.classList.remove(
    'hidden'
  );

  reward.classList.add(
    'hidden'
  );

  info?.classList.add(
    'hidden'
  );

  closeButton.classList.add(
    'hidden'
  );

  closeButton.onclick = null;

  if (backdrop) {
    backdrop.onclick = null;
  }


  // =====================================================
  // ОТКРЫВАЕМ МОДАЛКУ
  // =====================================================

  modal.classList.remove(
    'hidden'
  );

  modal.setAttribute(
    'aria-hidden',
    'false'
  );


  // =====================================================
  // ДАЁМ БРАУЗЕРУ ПРИМЕНИТЬ НАЧАЛЬНОЕ СОСТОЯНИЕ
  // =====================================================

  await new Promise(
    resolve =>
      requestAnimationFrame(
        resolve
      )
  );


  // =====================================================
  // ПОЛУЧАЕМ НАГРАДУ
  // =====================================================

  let result;

  try {

    result =
      await openThemeChest(
        currentStudent.id
      );

  } catch (error) {

    console.error(
      'Ошибка открытия сундука тем:',
      error
    );

    closeButton.textContent =
      'Закрыть';

    closeButton.classList.remove(
      'hidden'
    );

    closeButton.onclick =
      closeChest;

    return;
  }


  // =====================================================
  // НЕ УДАЛОСЬ ОТКРЫТЬ
  // =====================================================

  if (!result?.success) {

    modal.classList.add(
      'hidden'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );


    if (
      result?.reason ===
      'all_themes_unlocked'
    ) {

      info?.classList.remove(
        'hidden'
      );

      animation.classList.add(
        'hidden'
      );

      modal.classList.remove(
        'hidden'
      );

      modal.setAttribute(
        'aria-hidden',
        'false'
      );

      closeButton.textContent =
        'Продолжить';

      closeButton.classList.remove(
        'hidden'
      );

      closeButton.onclick =
        closeChest;

      if (backdrop) {
        backdrop.onclick =
          closeChest;
      }

      return;
    }


    // Другая ошибка
    closeButton.textContent =
      'Закрыть';

    closeButton.classList.remove(
      'hidden'
    );

    modal.classList.remove(
      'hidden'
    );

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    closeButton.onclick =
      closeChest;

    if (backdrop) {
      backdrop.onclick =
        closeChest;
    }

    return;
  }


  // =====================================================
  // НАГРАДА
  // =====================================================

  const theme =
    result.theme;


  if (!theme) {

    console.error(
      'Firebase вернул сундук без темы.'
    );

    closeButton.textContent =
      'Закрыть';

    closeButton.classList.remove(
      'hidden'
    );

    closeButton.onclick =
      closeChest;

    return;
  }


  // =====================================================
  // ОБНОВЛЯЕМ ПРОФИЛЬ
  // =====================================================

  currentProfile.chests = {
    ...currentProfile.chests,

    themes:
      Number(
        result.chestCount
      ) || 0
  };


  currentProfile.unlockedCardThemes =
    Array.isArray(
      currentProfile.unlockedCardThemes
    )
      ? currentProfile.unlockedCardThemes
      : [];


  if (
    theme.id &&
    !currentProfile.unlockedCardThemes.includes(
      theme.id
    )
  ) {

    currentProfile.unlockedCardThemes.push(
      theme.id
    );
  }


  currentProfile.selectedCardTheme =
    theme.id;


  // =====================================================
  // ЗАПОЛНЯЕМ НАГРАДУ
  // =====================================================

  rewardTitle.textContent =
    theme.name || 'Новая тема';

  rewardDescription.textContent =
    theme.description || 'Новая тема профиля';


  // =====================================================
  // ПРЕВЬЮ ТЕМЫ
  // =====================================================

  if (rewardPreview) {

    rewardPreview.dataset.theme =
      theme.id;

    rewardPreview.innerHTML = `
      <div class="student-profile-chest-theme-preview-glow"></div>

      <div class="student-profile-chest-theme-preview-content">

        <div class="student-profile-chest-theme-preview-avatar">
          ${currentProfile.emoji || '😀'}
        </div>

        <div class="student-profile-chest-theme-preview-name">
          ${currentStudent.name || 'Твой профиль'}
        </div>

        <div class="student-profile-chest-theme-preview-title">
          ${
            getTitleName(
              currentProfile.selectedTitle
            ) || 'Без титула'
          }
        </div>

        <div class="student-profile-chest-theme-preview-score">
          🏆 ${Number(currentStudent.score) || 0} баллов
        </div>

      </div>
    `;
  }


  // =====================================================
  // ПОКАЗЫВАЕМ АНИМАЦИЮ
  // =====================================================

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        250
      )
  );


  dialog.classList.add(
    'is-opening'
  );


  // Ждём завершения открытия.
  // Используем timeout, а не animationend,
  // чтобы Safari/iOS и Android не зависели
  // от события CSS-анимации.

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        1000
      )
  );


  // =====================================================
  // ПОКАЗЫВАЕМ НАГРАДУ
  // =====================================================

  animation.classList.add(
    'hidden'
  );

  reward.classList.remove(
    'hidden'
  );

  closeButton.textContent =
    'Продолжить';

  closeButton.classList.remove(
    'hidden'
  );


  // =====================================================
  // ЗАКРЫТИЕ
  // =====================================================

  closeButton.onclick =
    closeChest;

  if (backdrop) {
    backdrop.onclick =
      closeChest;
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
    ) || 0,

  themes:
    Number(
      data.chests?.themes
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
  document.getElementById(
    'student-profile-title-chest'
  );

if (titleChest) {
  titleChest.addEventListener(
    'click',
    handleTitleChestClick
  );
}


const themeChest =
  document.getElementById(
    'student-profile-theme-chest'
  );

if (themeChest) {
  themeChest.addEventListener(
    'click',
    handleThemeChestClick
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