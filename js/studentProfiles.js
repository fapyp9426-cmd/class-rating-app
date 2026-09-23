// ===================== ПРОФИЛИ УЧЕНИКОВ =====================

import {
  profilesCol,
  onSnapshot
} from './firebase.js';

import {
  getTitleName,
  getTitleById
} from './rewards/titles.js';
const profilesCache = new Map();

let initialized = false;
let unsubscribeProfiles = null;

const listeners = new Set();


// ===================== FALLBACK =====================

function createFallbackProfile(student) {
  return {
    studentId: student.id,

    // Если профиль ещё не существует,
    // используем avatar из students.
    emoji:
      student.avatar ||
      '🙂',

    // Будущая система наград
    unlockedTitles: [],
    unlockedCardThemes: [],

    selectedTitle: null,
    selectedCardTheme: null
  };
}


// ===================== ПОЛУЧЕНИЕ ПРОФИЛЯ =====================

export function getStudentProfile(student) {
  if (!student?.id) {
    return createFallbackProfile({
      id: '',
      avatar: '🙂'
    });
  }

  const profile =
    profilesCache.get(student.id);

  if (!profile) {
    return createFallbackProfile(
      student
    );
  }

  return {
    ...createFallbackProfile(student),
    ...profile
  };
}


// ===================== ЭМОДЗИ =====================

export function getStudentEmoji(student) {
  return getStudentProfile(
    student
  ).emoji;
}

// ===================== ТИТУЛ =====================

export function getStudentTitle(
  student
) {
  const profile =
    getStudentProfile(
      student
    );

  return getTitleName(
    profile.selectedTitle
  );
}


// ===================== ЦВЕТ ТИТУЛА =====================

export function getStudentTitleColor(
  student
) {
  const profile =
    getStudentProfile(
      student
    );

  const titleId =
    profile.selectedTitle;

  if (!titleId) {
    return null;
  }

  const title =
    getTitleById(
      titleId
    );

  return title
    ? title.color
    : null;
}


// ===================== СИНХРОНИЗАЦИЯ =====================

export function initStudentProfilesSync(
  onUpdate = null
) {
  if (
    typeof onUpdate === 'function'
  ) {
    listeners.add(onUpdate);
  }

  if (initialized) {
    return;
  }

  initialized = true;

  unsubscribeProfiles =
    onSnapshot(
      profilesCol,
snapshot => {

  profilesCache.clear();

  snapshot.docs.forEach(
    profileDoc => {

      const data =
        profileDoc.data();

      profilesCache.set(
        profileDoc.id,
        {
          studentId:
            profileDoc.id,

          emoji:
            data.emoji ||
            '😀',

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
        }
      );
    }
  );


        // Все части приложения,
        // которые подписались,
        // перерисовываются.
        listeners.forEach(
          callback => {

            try {
              callback();
            } catch (error) {
              console.error(
                'Ошибка обновления профилей:',
                error
              );
            }

          }
        );
      },

      error => {
        console.error(
          'Ошибка синхронизации profiles:',
          error
        );
      }
    );
}


// ===================== ОТКЛЮЧЕНИЕ =====================

export function stopStudentProfilesSync() {

  if (
    unsubscribeProfiles
  ) {
    unsubscribeProfiles();

    unsubscribeProfiles =
      null;
  }

  initialized = false;

  profilesCache.clear();

  listeners.clear();
}


// ===================== /ПРОФИЛИ УЧЕНИКОВ =====================