// ===================== ТИТУЛЫ =====================

export const TITLES = [
  { id: 'chickenguner', name: 'чикенганер' },
  { id: 'strong', name: 'мощь' },
  { id: 'krutoy', name: 'крутой' },
  { id: 'zdrot', name: 'zдрот' },
  { id: 'eggcurly', name: 'яйкодрявый' },
  { id: 'oak_grove', name: 'дубовая роща' },
  { id: 'again_25', name: 'опять 25' },
  { id: 'studied_forgot', name: 'я учил,но забыл' },
  { id: 'cafeteria_boss', name: 'босс столовой' },
  { id: 'two_plus_two', name: '2+2=5' },
  { id: 'petrosyan', name: 'Петросян' },
  { id: 'pitrosyan', name: 'Питросян' },
  { id: 'rooster', name: 'петушок' },
  { id: 'forest_of_hands', name: 'лес рук' },
  { id: 'okak', name: 'окак' },
  { id: 'otak', name: 'отак' },
  { id: '67', name: '67' },
  { id: '20_0', name: '20-0' }
];


// ===================== ПОЛУЧЕНИЕ ТИТУЛА =====================

export function getTitleById(
  titleId
) {
  if (!titleId) {
    return null;
  }

  return (
    TITLES.find(
      title =>
        title.id === titleId
    ) || null
  );
}


// ===================== НАЗВАНИЕ ТИТУЛА =====================

export function getTitleName(
  titleId
) {
  const title =
    getTitleById(titleId);

  return title
    ? title.name
    : null;
}


// ===================== ПРОВЕРКА =====================

export function isValidTitle(
  titleId
) {
  return Boolean(
    getTitleById(titleId)
  );
}


// ===================== /ТИТУЛЫ =====================