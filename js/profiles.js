// ===================== ПРОФИЛИ УЧЕНИКОВ =====================

import {
  db,
  doc,
  getDoc,
  setDoc
} from './firebase.js';


// Значения профиля по умолчанию
const DEFAULT_PROFILE = {
  title: 'Новичок',
  cardTheme: 'default',
  emoji: '😀'
};


// ===================== ПОЛУЧИТЬ ПРОФИЛЬ =====================

export async function getStudentProfile(studentId) {

  if (!studentId) {
    return {
      ...DEFAULT_PROFILE
    };
  }

  try {

    const profileRef =
      doc(db, 'profiles', studentId);

    const snapshot =
      await getDoc(profileRef);

    if (snapshot.exists()) {

      return {
        ...DEFAULT_PROFILE,
        ...snapshot.data()
      };

    }

    return {
      ...DEFAULT_PROFILE
    };

  } catch (error) {

    console.error(
      'Ошибка загрузки профиля:',
      error
    );

    return {
      ...DEFAULT_PROFILE
    };

  }
}


// ===================== СОЗДАТЬ ПРОФИЛЬ =====================

export async function createStudentProfile(student) {

  if (!student?.id) {
    return;
  }

  try {

    const profileRef =
      doc(db, 'profiles', student.id);

    const snapshot =
      await getDoc(profileRef);

    // Если профиль уже существует —
    // ничего не меняем.
    if (snapshot.exists()) {
      return;
    }

    await setDoc(profileRef, {

      studentId: student.id,

      name: student.name || '',

      ...DEFAULT_PROFILE

    });

    console.log(
      `Профиль создан: ${student.name || student.id}`
    );

  } catch (error) {

    console.error(
      'Ошибка создания профиля:',
      error
    );

  }
}


// ===================== СОХРАНИТЬ НАСТРОЙКИ =====================

export async function saveStudentProfile(
  studentId,
  settings
) {

  if (!studentId) {
    return;
  }

  try {

    const profileRef =
      doc(db, 'profiles', studentId);

    await setDoc(
      profileRef,
      settings,
      {
        merge: true
      }
    );

  } catch (error) {

    console.error(
      'Ошибка сохранения профиля:',
      error
    );

    throw error;

  }
}


// ===================== /ПРОФИЛИ УЧЕНИКОВ =====================