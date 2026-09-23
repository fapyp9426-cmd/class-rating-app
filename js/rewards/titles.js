// ===================== ТИТУЛЫ =====================

export const TITLES = [
  { id: 'chickenguner', name: 'чикенганер', color: '#ef4444' },
  { id: 'strong', name: 'мощь', color: '#f59e0b' },
  { id: 'krutoy', name: 'крутой', color: '#8b5cf6' },
  { id: 'zdrot', name: 'zдрот', color: '#22c55e' },
  { id: 'eggcurly', name: 'яйкодрявый', color: '#facc15' },
  { id: 'oak_grove', name: 'дубовая роща', color: '#16a34a' },
  { id: 'again_25', name: 'опять 25', color: '#3b82f6' },
  { id: 'studied_forgot', name: 'я учил,но забыл', color: '#94a3b8' },
  { id: 'cafeteria_boss', name: 'босс столовой', color: '#f97316' },
  { id: 'two_plus_two', name: '2+2=5', color: '#ec4899' },
  { id: 'petrosyan', name: 'Петросян', color: '#a855f7' },
  { id: 'pitrosyan', name: 'Питросян', color: '#06b6d4' },
  { id: 'rooster', name: 'петушок', color: '#dc2626' },
  { id: 'forest_of_hands', name: 'лес рук', color: '#10b981' },
  { id: 'okak', name: 'окак', color: '#6366f1' },
  { id: 'otak', name: 'отак', color: '#14b8a6' },
  { id: '67', name: '67', color: '#fbbf24' },
  { id: 'airhead', name: 'воздухан', color: '#38bdf8' },
  { id: 'skill_issue', name: 'skill issue', color: '#ef4444' },
  { id: 'w', name: 'W', color: '#22c55e' },
  { id: 'l', name: 'L', color: '#f43f5e' },
  { id: 'tuff', name: 'tuff', color: '#a78bfa' },
  { id: 'bro', name: 'бро', color: '#60a5fa' },
  { id: '404', name: '404', color: '#64748b' },
  { id: 'connection', name: 'связь', color: '#2dd4bf' },
  { id: '20_0', name: '20-0', color: '#fbbf24' }
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