// ===================== АВТОРИЗАЦИЯ УЧЕНИКА =====================

import {
  studentsCol,
  studentAuthCol,
  doc,
  getDoc,
  getDocs,
  setDoc
} from './firebase.js';


// ===================== НАСТРОЙКИ =====================

const HASH_ITERATIONS = 600000;
const HASH_LENGTH = 256;

const STUDENT_SESSION_KEY =
  'class_rating_student_id';


// ===================== BASE64 =====================

function bytesToBase64(bytes) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}


function base64ToBytes(base64) {
  const binary = atob(base64);

  const bytes =
    new Uint8Array(binary.length);

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

async function createPasswordHash(
  password,
  salt
) {
  const encoder =
    new TextEncoder();

  const passwordBytes =
    encoder.encode(password);

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

  const derivedBits =
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
    derivedBits
  );
}


// ===================== СРАВНЕНИЕ =====================

function compareBytes(a, b) {
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

export async function findStudentByName(
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

        const studentName =
          String(
            student.name || ''
          )
            .trim()
            .toLowerCase();

        return (
          studentName ===
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


// ===================== СОЗДАНИЕ ПАРОЛЯ =====================

export async function saveStudentPassword(
  studentId,
  password
) {
  if (!studentId) {
    throw new Error(
      'Не указан studentId.'
    );
  }

  if (!password) {
    throw new Error(
      'Пароль не указан.'
    );
  }

  if (
    password.length < 6
  ) {
    throw new Error(
      'Пароль должен содержать минимум 6 символов.'
    );
  }

  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );

  const hash =
    await createPasswordHash(
      password,
      salt
    );

  const authRef =
    doc(
      studentAuthCol,
      studentId
    );

  await setDoc(
    authRef,
    {
      studentId,
      passwordSalt:
        bytesToBase64(salt),
      passwordHash:
        bytesToBase64(hash)
    },
    {
      merge: true
    }
  );

  return true;
}


// ===================== ВХОД =====================

export async function loginStudent(
  name,
  password
) {
  if (
    !name?.trim() ||
    !password
  ) {
    return {
      success: false,
      error:
        'Введите имя и пароль.'
    };
  }

  try {

    // Находим ученика
    const student =
      await findStudentByName(
        name
      );

    if (!student) {
      return {
        success: false,
        error:
          'Ученик с таким именем не найден.'
      };
    }


    // Ищем его данные авторизации
    const authRef =
      doc(
        studentAuthCol,
        student.id
      );

    const authSnapshot =
      await getDoc(
        authRef
      );

    if (
      !authSnapshot.exists()
    ) {
      return {
        success: false,
        error:
          'Для этого ученика аккаунт ещё не создан.'
      };
    }


    const authData =
      authSnapshot.data();


    if (
      !authData.passwordSalt ||
      !authData.passwordHash
    ) {
      return {
        success: false,
        error:
          'Для этого аккаунта не установлен пароль.'
      };
    }


    // Создаём hash из введённого пароля
    const salt =
      base64ToBytes(
        authData.passwordSalt
      );

    const calculatedHash =
      await createPasswordHash(
        password,
        salt
      );


    // Получаем hash из Firebase
    const savedHash =
      base64ToBytes(
        authData.passwordHash
      );


    // Сравниваем
    const passwordCorrect =
      compareBytes(
        calculatedHash,
        savedHash
      );


    if (!passwordCorrect) {
      return {
        success: false,
        error:
          'Неверный пароль.'
      };
    }


    // Сохраняем ID ученика
    localStorage.setItem(
      STUDENT_SESSION_KEY,
      student.id
    );


    return {
      success: true,
      student
    };

  } catch (error) {

    console.error(
      'Ошибка входа ученика:',
      error
    );

    return {
      success: false,
      error:
        'Не удалось выполнить вход.'
    };
  }
}


// ===================== ТЕКУЩИЙ УЧЕНИК =====================

export async function getCurrentStudent() {
  const studentId =
    getCurrentStudentId();

  if (!studentId) {
    return null;
  }

  try {

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
      logoutStudent();
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };

  } catch (error) {

    console.error(
      'Ошибка загрузки ученика:',
      error
    );

    return null;
  }
}


// ===================== SESSION =====================

export function getCurrentStudentId() {
  return localStorage.getItem(
    STUDENT_SESSION_KEY
  );
}


export function isStudentLoggedIn() {
  return Boolean(
    getCurrentStudentId()
  );
}


export function logoutStudent() {
  localStorage.removeItem(
    STUDENT_SESSION_KEY
  );
}


// ===================== /АВТОРИЗАЦИЯ УЧЕНИКА =====================