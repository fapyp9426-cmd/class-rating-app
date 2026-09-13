// ===================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====================
// Все модули читают/пишут данные только через эти функции,
// чтобы не было путаницы, кто и где меняет общие переменные.

export const SORT_KEY = 'class_rating_sort_mode';

let students = [];
let globalHistory = [];
let isTeacher = false;
let sortMode = localStorage.getItem(SORT_KEY) || 'score_desc';

export function getStudents() {
  return students;
}
export function setStudents(list) {
  students = list;
}

export function getGlobalHistory() {
  return globalHistory;
}
export function setGlobalHistory(list) {
  globalHistory = list;
}

export function isTeacherLoggedIn() {
  return isTeacher;
}
export function setIsTeacher(value) {
  isTeacher = value;
}

export function getSortMode() {
  return sortMode;
}
export function setSortMode(mode) {
  sortMode = mode;
  localStorage.setItem(SORT_KEY, mode);
}
// ===================== /СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====================
