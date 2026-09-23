// ===================== СИСТЕМА СУНДУКОВ =====================

import {
  profilesCol,
  doc,
  getDoc,
  setDoc
} from '../firebase.js';

import {
  TITLES
} from './titles.js';


// ===================== ВЫДАТЬ СУНДУК =====================

export async function giveTitleChest(
  studentId
) {

  if (!studentId) {
    return false;
  }


  const profileRef =
    doc(
      profilesCol,
      studentId
    );


  const snapshot =
    await getDoc(
      profileRef
    );


  if (!snapshot.exists()) {
    return false;
  }


  const data =
    snapshot.data();


  const currentCount =
    Number(
      data.chests?.titles
    ) || 0;


  const newCount =
    currentCount + 1;


  await setDoc(
    profileRef,
    {
      chests: {
        titles:
          newCount
      }
    },
    {
      merge: true
    }
  );


  return newCount;
}


// ===================== ОТКРЫТЬ СУНДУК =====================

export async function openTitleChest(
  studentId
) {

  if (!studentId) {
    return {
      success: false,
      reason: 'invalid_student'
    };
  }


  const profileRef =
    doc(
      profilesCol,
      studentId
    );


  const snapshot =
    await getDoc(
      profileRef
    );


  if (!snapshot.exists()) {
    return {
      success: false,
      reason: 'profile_not_found'
    };
  }


  const data =
    snapshot.data();


  const chestCount =
    Number(
      data.chests?.titles
    ) || 0;


  // Нет сундуков
  if (chestCount <= 0) {
    return {
      success: false,
      reason: 'no_chests'
    };
  }


  const unlockedTitles =
    Array.isArray(
      data.unlockedTitles
    )
      ? data.unlockedTitles
      : [];


  // Берём только ещё не полученные титулы
  const availableTitles =
    TITLES.filter(
      title =>
        !unlockedTitles.includes(
          title.id
        )
    );


  // Все титулы уже собраны
  if (
    availableTitles.length === 0
  ) {
    return {
      success: false,
      reason: 'all_titles_unlocked'
    };
  }


  // Случайный титул
  const randomIndex =
    Math.floor(
      Math.random() *
      availableTitles.length
    );


  const reward =
    availableTitles[
      randomIndex
    ];


  const newUnlockedTitles = [
    ...unlockedTitles,
    reward.id
  ];


  const newChestCount =
    chestCount - 1;


  // Сохраняем результат
  await setDoc(
    profileRef,
    {
      chests: {
        titles:
          newChestCount
      },

      unlockedTitles:
        newUnlockedTitles,

      selectedTitle:
        reward.id
    },
    {
      merge: true
    }
  );


  return {
    success: true,

    title: reward,

    chestCount:
      newChestCount
  };
}