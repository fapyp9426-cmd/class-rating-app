// ===================== ЭКРАН ЗАГРУЗКИ =====================
const loadingOverlay = document.getElementById('loading-overlay');

let alreadyHidden = false;

function hideLoading() {
  if (alreadyHidden || !loadingOverlay) return;
  alreadyHidden = true;

  loadingOverlay.classList.add('fade-out');
  // Ждём окончания CSS-перехода (0.6s), потом полностью убираем из потока,
  // чтобы он не перехватывал клики после того как стал прозрачным.
  setTimeout(() => {
    loadingOverlay.classList.add('hidden');
  }, 600);
}

export function initLoading() {
  // Подстраховка: если данные почему-то не пришли (плохая сеть, ошибка),
  // экран загрузки всё равно уйдёт через 7 секунд, а не зависнет навсегда.
  setTimeout(hideLoading, 7000);
}

// Вызывается из main.js, как только пришли первые данные из Firestore —
// тогда лоадер уходит сразу, не дожидаясь семи секунд впустую.
export function markDataReady() {
  hideLoading();
}
// ===================== /ЭКРАН ЗАГРУЗКИ =====================