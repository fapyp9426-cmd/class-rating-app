// ===================== ТЕХНИЧЕСКИЙ ПЕРЕРЫВ =====================
// Чтобы включить: поменяй значение на true, закоммить и задеплой.
// Чтобы выключить: обратно на false, закоммить и задеплой.
export const MAINTENANCE_MODE = false;

export function initMaintenance() {
  if (!MAINTENANCE_MODE) return;

  const overlay = document.getElementById('maintenance-overlay');
  if (overlay) overlay.classList.remove('hidden');
}
// ===================== /ТЕХНИЧЕСКИЙ ПЕРЕРЫВ =====================
