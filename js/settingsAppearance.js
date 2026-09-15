// js/settingsAppearance.js

const STORAGE_KEY = 'class8a_appearance_settings';

const DEFAULT_SETTINGS = {
    seasonParticles: true,
    season: 'auto',
    birthdayParticles: true,
    holidayParticles: true
};

function loadAppearanceSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return { ...DEFAULT_SETTINGS };
        }

        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(saved)
        };
    } catch (error) {
        console.warn('Не удалось загрузить настройки оформления:', error);
        return { ...DEFAULT_SETTINGS };
    }
}

function saveAppearanceSettings(settings) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(settings)
        );
    } catch (error) {
        console.warn('Не удалось сохранить настройки оформления:', error);
    }
}

const appearanceSettings = loadAppearanceSettings();

function updateSeasonUI() {
    const toggle = document.getElementById('season-particles-toggle');
    const options = document.getElementById('season-particles-options');

    if (!toggle || !options) return;

    toggle.checked = appearanceSettings.seasonParticles;

    options.classList.toggle(
        'is-disabled',
        !appearanceSettings.seasonParticles
    );

    const seasonButtons = options.querySelectorAll('.season-option');

    seasonButtons.forEach(button => {
        button.classList.toggle(
            'is-active',
            button.dataset.season === appearanceSettings.season
        );

        button.disabled = !appearanceSettings.seasonParticles;
    });
}

function updateBirthdayUI() {
    const toggle = document.getElementById('birthday-particles-toggle');

    if (!toggle) return;

    toggle.checked = appearanceSettings.birthdayParticles;

    const card = toggle.closest('.birthday-setting-card');

    if (card) {
        card.classList.toggle(
            'is-disabled',
            !appearanceSettings.birthdayParticles
        );
    }
}

function updateHolidayUI() {
    const toggle = document.getElementById('holiday-particles-toggle');

    if (!toggle) return;

    toggle.checked = appearanceSettings.holidayParticles;

    const card = toggle.closest('.holiday-setting-card');

    if (card) {
        card.classList.toggle(
            'is-disabled',
            !appearanceSettings.holidayParticles
        );
    }
}

function applyAppearanceSettings() {
    updateSeasonUI();
    updateBirthdayUI();
    updateHolidayUI();

    window.dispatchEvent(
        new CustomEvent('appearanceSettingsChanged', {
            detail: { ...appearanceSettings }
        })
    );
}

function initAppearanceSettings() {

    const seasonToggle = document.getElementById(
        'season-particles-toggle'
    );

    const birthdayToggle = document.getElementById(
        'birthday-particles-toggle'
    );

    const holidayToggle = document.getElementById(
        'holiday-particles-toggle'
    );

    const seasonOptions = document.getElementById(
        'season-particles-options'
    );

    /*
     * Частицы времени года
     */
    if (seasonToggle) {

        seasonToggle.addEventListener('change', () => {

            appearanceSettings.seasonParticles =
                seasonToggle.checked;

            saveAppearanceSettings(appearanceSettings);
            applyAppearanceSettings();
        });
    }

    /*
     * Выбор времени года
     */
    if (seasonOptions) {

        seasonOptions
            .querySelectorAll('.season-option')
            .forEach(button => {

                button.addEventListener('click', () => {

                    if (!appearanceSettings.seasonParticles) {
                        return;
                    }

                    const season = button.dataset.season;

                    if (!season) return;

                    appearanceSettings.season = season;

                    saveAppearanceSettings(appearanceSettings);
                    applyAppearanceSettings();
                });
            });
    }

    /*
     * Частицы дней рождения
     */
    if (birthdayToggle) {

        birthdayToggle.addEventListener('change', () => {

            appearanceSettings.birthdayParticles =
                birthdayToggle.checked;

            saveAppearanceSettings(appearanceSettings);
            applyAppearanceSettings();
        });
    }

    /*
     * Частицы праздников
     */
    if (holidayToggle) {

        holidayToggle.addEventListener('change', () => {

            appearanceSettings.holidayParticles =
                holidayToggle.checked;

            saveAppearanceSettings(appearanceSettings);
            applyAppearanceSettings();
        });
    }

    applyAppearanceSettings();
}

/*
 * Если настройки открываются после загрузки страницы,
 * и HTML уже существует — запускаем сразу.
 */
if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        initAppearanceSettings
    );
} else {
    initAppearanceSettings();
}

/*
 * Доступ к настройкам для других модулей.
 */
window.appearanceSettings = appearanceSettings;

export {
    appearanceSettings,
    loadAppearanceSettings,
    saveAppearanceSettings,
    applyAppearanceSettings
};