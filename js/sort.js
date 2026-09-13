// ===================== СОРТИРОВКА СПИСКА =====================
import { getSortMode, setSortMode } from './state.js';

const sortBtn = document.getElementById('sort-btn');
const sortMenu = document.getElementById('sort-menu');
const sortOptions = document.querySelectorAll('.sort-option');

// Сортирует переданный список согласно текущему режиму.
// Подиум ТОП-3 эту функцию не использует — он всегда по баллам.
export function applySortMode(list) {
  const mode = getSortMode();
  const sorted = [...list];
  switch (mode) {
    case 'score_desc':
      sorted.sort((a, b) => b.score - a.score);
      break;
    case 'score_asc':
      sorted.sort((a, b) => a.score - b.score);
      break;
    case 'name_asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      break;
    case 'name_desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
      break;
  }
  return sorted;
}

function updateSortUI() {
  const mode = getSortMode();
  sortOptions.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === mode);
  });
  const isDefault = mode === 'score_desc';
  if (sortBtn) sortBtn.classList.toggle('active', !isDefault);
}

// onListChanged вызывается после смены режима — обычно это renderStudentsList
export function initSort(onListChanged) {
  if (sortBtn) {
    sortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sortMenu.classList.toggle('hidden');
    });
  }

  sortOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      setSortMode(btn.dataset.sort);
      updateSortUI();
      sortMenu.classList.add('hidden');
      onListChanged();
    });
  });

  document.addEventListener('click', (e) => {
    if (sortMenu && !sortMenu.classList.contains('hidden') && !sortMenu.contains(e.target) && e.target !== sortBtn) {
      sortMenu.classList.add('hidden');
    }
  });

  updateSortUI();
}
// ===================== /СОРТИРОВКА СПИСКА =====================
