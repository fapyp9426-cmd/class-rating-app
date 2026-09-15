// ===================== СЕЗОННЫЕ ЧАСТИЦЫ =====================

const seasonParticlesContainer =
    document.getElementById('season-particles');

const winterSnowdrifts =
    document.getElementById('winter-snowdrifts');

const seasonBadge =
    document.getElementById('season-badge');


// ---------------------------------------------------------
// ОПРЕДЕЛЕНИЕ АВТОМАТИЧЕСКОГО СЕЗОНА
// ---------------------------------------------------------

function getCurrentSeason() {
    const month = new Date().getMonth() + 1;

    if (month === 12 || month === 1 || month === 2) {
        return 'winter';
    }

    if (month >= 3 && month <= 5) {
        return 'spring';
    }

    if (month >= 6 && month <= 8) {
        return 'summer';
    }

    return 'autumn';
}


// ---------------------------------------------------------
// ОЧИСТКА
// ---------------------------------------------------------

function clearSeasonFX() {

    if (seasonParticlesContainer) {
        seasonParticlesContainer.innerHTML = '';
    }

    if (winterSnowdrifts) {
        winterSnowdrifts.classList.add('hidden');
    }
}


// ---------------------------------------------------------
// ЗАПУСК СЕЗОНА
// ---------------------------------------------------------

function applySeason(season) {

    if (!seasonParticlesContainer) {
        return;
    }

    clearSeasonFX();

    if (seasonBadge) {
        seasonBadge.style.display = 'flex';
    }


    // ЗИМА
    if (season === 'winter') {

        if (seasonBadge) {
            seasonBadge.innerHTML = '❄️ Зима';
        }

        createWinterFX();
        return;
    }


    // ВЕСНА
    if (season === 'spring') {

        if (seasonBadge) {
            seasonBadge.innerHTML = '🌸 Весна';
        }

        createSpringFX();
        return;
    }


    // ЛЕТО
    if (season === 'summer') {

        if (seasonBadge) {
            seasonBadge.innerHTML = '☀️ Лето';
        }

        createSummerFX();
        return;
    }


    // ОСЕНЬ
    if (season === 'autumn') {

        if (seasonBadge) {
            seasonBadge.innerHTML = '🍂 Осень';
        }

        createAutumnFX();
        return;
    }
}


// ---------------------------------------------------------
// ГЛАВНАЯ ФУНКЦИЯ
// ---------------------------------------------------------

export function initAutoSeason() {

    if (!seasonParticlesContainer) {
        return;
    }

    const settings =
        window.appearanceSettings || {};

    const particlesEnabled =
        settings.seasonParticles !== false;

    if (!particlesEnabled) {

        clearSeasonFX();

        if (seasonBadge) {
            seasonBadge.style.display = 'none';
        }

        return;
    }


    let selectedSeason =
        settings.season || 'auto';


    // Автоматический режим
    if (selectedSeason === 'auto') {
        selectedSeason = getCurrentSeason();
    }


    applySeason(selectedSeason);
}


// ---------------------------------------------------------
// РЕАКЦИЯ НА НАСТРОЙКИ
// ---------------------------------------------------------

window.addEventListener(
    'appearanceSettingsChanged',
    event => {

        const settings =
            event.detail || {};

        if (settings.seasonParticles === false) {

            clearSeasonFX();

            if (seasonBadge) {
                seasonBadge.style.display = 'none';
            }

            return;
        }


        let selectedSeason =
            settings.season || 'auto';


        if (selectedSeason === 'auto') {
            selectedSeason = getCurrentSeason();
        }


        applySeason(selectedSeason);
    }
);


// ---------------------------------------------------------
// ЗИМА
// ---------------------------------------------------------

function createWinterFX() {

    if (!seasonParticlesContainer) {
        return;
    }

    if (winterSnowdrifts) {
        winterSnowdrifts.classList.remove('hidden');
    }

    const snowSymbols = [
        '❄',
        '❅',
        '❆',
        '·'
    ];


    for (let i = 0; i < 24; i++) {

        const flake =
            document.createElement('div');

        flake.className =
            'falling-snow';

        flake.textContent =
            snowSymbols[
                Math.floor(
                    Math.random() *
                    snowSymbols.length
                )
            ];

        flake.style.left =
            `${Math.random() * 100}%`;

        flake.style.fontSize =
            `${7 + Math.random() * 13}px`;

        flake.style.animationDuration =
            `${7 + Math.random() * 6}s`;

        flake.style.animationDelay =
            `${Math.random() * 8}s`;

        flake.style.opacity =
            `${0.25 + Math.random() * 0.55}`;

        flake.style.setProperty(
            '--snow-drift',
            `${-35 + Math.random() * 70}px`
        );

        seasonParticlesContainer.appendChild(
            flake
        );
    }
}


// ---------------------------------------------------------
// ВЕСНА
// ---------------------------------------------------------

function createSpringFX() {

    const petals = [
        '🌸',
        '🌺',
        '🍃'
    ];


    for (let i = 0; i < 20; i++) {

        const p =
            document.createElement('div');

        p.className =
            'falling-petal';

        p.textContent =
            petals[
                Math.floor(
                    Math.random() *
                    petals.length
                )
            ];

        p.style.left =
            `${Math.random() * 100}%`;

        p.style.fontSize =
            `${14 + Math.random() * 14}px`;

        p.style.animationDuration =
            `${5 + Math.random() * 5}s`;

        p.style.animationDelay =
            `${Math.random() * 4}s`;

        seasonParticlesContainer.appendChild(p);
    }
}


// ---------------------------------------------------------
// ЛЕТО
// ---------------------------------------------------------

function createSummerFX() {

    for (let i = 0; i < 25; i++) {

        const s =
            document.createElement('div');

        s.className =
            'summer-sparkle';

        const size =
            6 + Math.random() * 10;

        s.style.width =
            `${size}px`;

        s.style.height =
            `${size}px`;

        s.style.left =
            `${Math.random() * 100}%`;

        s.style.animationDuration =
            `${3 + Math.random() * 4}s`;

        s.style.animationDelay =
            `${Math.random() * 3}s`;

        seasonParticlesContainer.appendChild(s);
    }
}


// ---------------------------------------------------------
// ОСЕНЬ
// ---------------------------------------------------------

function createAutumnFX() {

    const leafEmojis = [
        '🍂',
        '🍁',
        '🍃'
    ];


    // Дождь

    for (let i = 0; i < 20; i++) {

        const drop =
            document.createElement('div');

        drop.className =
            'rain-drop';

        drop.style.left =
            `${Math.random() * 100}%`;

        drop.style.animationDuration =
            `${0.6 + Math.random() * 0.4}s`;

        drop.style.animationDelay =
            `${Math.random() * 2}s`;

        seasonParticlesContainer.appendChild(
            drop
        );
    }


    // Листья

    for (let i = 0; i < 15; i++) {

        const leaf =
            document.createElement('div');

        leaf.className =
            'falling-leaf';

        leaf.textContent =
            leafEmojis[
                Math.floor(
                    Math.random() *
                    leafEmojis.length
                )
            ];

        leaf.style.left =
            `${Math.random() * 100}%`;

        leaf.style.fontSize =
            `${16 + Math.random() * 16}px`;

        leaf.style.animationDuration =
            `${5 + Math.random() * 5}s`;

        leaf.style.animationDelay =
            `${Math.random() * 5}s`;

        seasonParticlesContainer.appendChild(
            leaf
        );
    }
}


// ===================== /СЕЗОННЫЕ ЧАСТИЦЫ =====================