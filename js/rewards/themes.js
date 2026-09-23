// ===================== ТЕМЫ КАРТОЧЕК =====================

export const CARD_THEMES = [

  {
    id: 'default',
    name: 'Стандарт',
    description: 'Классический стиль карточки',
    type: 'default'
  },

  {
    id: 'gold',
    name: 'Золото',
    description: 'Премиальная золотая карточка',
    type: 'gold'
  },

  {
    id: 'leaves',
    name: 'Листочки',
    description: 'Спокойный природный стиль',
    type: 'leaves'
  },

  {
    id: 'ice',
    name: 'Лёд',
    description: 'Холодное ледяное свечение',
    type: 'ice'
  },

  {
    id: 'aurora',
    name: 'Аврора',
    description: 'Переливы северного сияния',
    type: 'aurora'
  },

  {
    id: 'void',
    name: 'Пустота',
    description: 'Тёмная энергия и фиолетовое свечение',
    type: 'void'
  },

  {
    id: 'flame',
    name: 'Пламя',
    description: 'Горящая карточка с тёплым свечением',
    type: 'flame'
  },

  {
    id: 'ocean',
    name: 'Океан',
    description: 'Глубокий сине-бирюзовый стиль',
    type: 'ocean'
  }

];


// ===================== ПОЛУЧИТЬ ТЕМУ =====================

export function getCardThemeById(
  themeId
) {

  if (!themeId) {
    return null;
  }

  return (
    CARD_THEMES.find(
      theme =>
        theme.id === themeId
    ) || null
  );

}


// ===================== НАЗВАНИЕ ТЕМЫ =====================

export function getCardThemeName(
  themeId
) {

  const theme =
    getCardThemeById(
      themeId
    );

  return theme
    ? theme.name
    : null;

}


// ===================== ПРОВЕРКА ТЕМЫ =====================

export function isValidCardTheme(
  themeId
) {

  return Boolean(
    getCardThemeById(
      themeId
    )
  );

}