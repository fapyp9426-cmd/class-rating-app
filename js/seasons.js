// ===================== СЕЗОНЫ (Зима, Весна, Лето, Осень) =====================
const seasonParticlesContainer = document.getElementById('season-particles');
const winterSnowdrifts = document.getElementById('winter-snowdrifts');
const seasonBadge = document.getElementById('season-badge');

export function initAutoSeason() {
  const month = new Date().getMonth() + 1; // 1-12

  if (!seasonParticlesContainer || !winterSnowdrifts) return;

  seasonParticlesContainer.innerHTML = '';
  winterSnowdrifts.classList.add('hidden');

  if (seasonBadge) seasonBadge.style.display = 'flex';

  // Зима (12, 1, 2)
  if (month === 12 || month === 1 || month === 2) {
    if (seasonBadge) seasonBadge.innerHTML = '❄️ Зима';
    createWinterFX();
  }
  // Весна (3, 4, 5)
  else if (month >= 3 && month <= 5) {
    if (seasonBadge) seasonBadge.innerHTML = '🌸 Весна';
    createSpringFX();
  }
  // Лето (6, 7, 8)
  else if (month >= 6 && month <= 8) {
    if (seasonBadge) seasonBadge.innerHTML = '☀️ Лето';
    createSummerFX();
  }
  // Осень (9, 10, 11)
  else if (month >= 9 && month <= 11) {
    if (seasonBadge) seasonBadge.innerHTML = '🍂 Осень';
    createAutumnFX();
  }
}

function createWinterFX() {
  winterSnowdrifts.classList.remove('hidden');
  const snowEmojis = ['❄️', '❅', '❆', '•'];

  for (let i = 0; i < 35; i++) {
    const flake = document.createElement('div');
    flake.className = 'falling-snow';
    flake.textContent = snowEmojis[Math.floor(Math.random() * snowEmojis.length)];
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.fontSize = `${10 + Math.random() * 18}px`;
    flake.style.animationDuration = `${4 + Math.random() * 6}s`;
    flake.style.animationDelay = `${Math.random() * 5}s`;
    flake.style.opacity = Math.random() * 0.8 + 0.2;
    seasonParticlesContainer.appendChild(flake);
  }
}

function createSpringFX() {
  const petals = ['🌸', '🌺', '🍃'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'falling-petal';
    p.textContent = petals[Math.floor(Math.random() * petals.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.fontSize = `${14 + Math.random() * 14}px`;
    p.style.animationDuration = `${5 + Math.random() * 5}s`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    seasonParticlesContainer.appendChild(p);
  }
}

function createSummerFX() {
  for (let i = 0; i < 25; i++) {
    const s = document.createElement('div');
    s.className = 'summer-sparkle';
    const size = 6 + Math.random() * 10;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDuration = `${3 + Math.random() * 4}s`;
    s.style.animationDelay = `${Math.random() * 3}s`;
    seasonParticlesContainer.appendChild(s);
  }
}

function createAutumnFX() {
  const leafEmojis = ['🍂', '🍁', '🍃'];

  for (let i = 0; i < 20; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.6 + Math.random() * 0.4}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    seasonParticlesContainer.appendChild(drop);
  }

  for (let i = 0; i < 15; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.fontSize = `${16 + Math.random() * 16}px`;
    leaf.style.animationDuration = `${5 + Math.random() * 5}s`;
    leaf.style.animationDelay = `${Math.random() * 5}s`;
    seasonParticlesContainer.appendChild(leaf);
  }
}
// ===================== /СЕЗОНЫ =====================
