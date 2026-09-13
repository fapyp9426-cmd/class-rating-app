// ===================== ЭКРАН ЗАГРУЗКИ =====================
// Просто показывается 5 секунд и плавно исчезает — без привязки к тому,
// пришли ли уже данные из Firestore.
const loadingOverlay = document.getElementById('loading-overlay');

export function initLoading() {
  if (!loadingOverlay) return;

  setTimeout(() => {
    loadingOverlay.classList.add('fade-out');
    // Ждём окончания CSS-перехода (0.6s), потом полностью убираем из потока,
    // чтобы он не перехватывал клики после того как стал прозрачным.
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 600);
  }, 5000);
}
// ===================== /ЭКРАН ЗАГРУЗКИ =====================