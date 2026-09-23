// ===================== ОЧИСТКА СТАРЫХ ПРОФИЛЕЙ =====================

import {
  profilesCol,
  getDocs,
  updateDoc,
  deleteField
} from './firebase.js';

const MIGRATION_KEY = 'class8a_profiles_cleanup_v1';

export async function cleanupOldProfiles() {
  // Уже выполняли очистку на этом браузере
  if (localStorage.getItem(MIGRATION_KEY) === 'done') {
    return;
  }

  try {
    console.log('Начинаем очистку старых профилей...');

    const snapshot = await getDocs(profilesCol);

    let cleaned = 0;

    for (const profileDoc of snapshot.docs) {
      const data = profileDoc.data();

      const updates = {};

      // Удаляем старые тестовые поля
      if ('title' in data) {
        updates.title = deleteField();
      }

      if ('cardTheme' in data) {
        updates.cardTheme = deleteField();
      }

      // Удаляем возможные будущие/тестовые поля,
      // если они вдруг уже появились в базе.
      if ('unlockedTitles' in data) {
        updates.unlockedTitles = deleteField();
      }

      if ('unlockedCardThemes' in data) {
        updates.unlockedCardThemes = deleteField();
      }

      if ('selectedTitle' in data) {
        updates.selectedTitle = deleteField();
      }

      if ('selectedCardTheme' in data) {
        updates.selectedCardTheme = deleteField();
      }

      if (Object.keys(updates).length === 0) {
        continue;
      }

      await updateDoc(
        profileDoc.ref,
        updates
      );

      cleaned++;
    }

    localStorage.setItem(
      MIGRATION_KEY,
      'done'
    );

    console.log(
      `Очистка профилей завершена. Обработано: ${cleaned}`
    );

  } catch (error) {
    console.error(
      'Ошибка очистки старых профилей:',
      error
    );
  }
}