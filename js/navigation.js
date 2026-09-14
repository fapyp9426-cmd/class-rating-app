
/**
 * ============================================================
 * APP NAVIGATION
 * Навигация между разделами приложения
 * ============================================================
 */

export function initNavigation() {

    const navItems = document.querySelectorAll('.app-nav-item');
    const pages = document.querySelectorAll('.app-page');

    if (!navItems.length || !pages.length) {
        console.warn('[Navigation] Навигация или страницы не найдены.');
        return;
    }

    /**
     * Переключение страницы
     */
    function switchPage(pageName) {

        // Переключаем кнопки навигации
        navItems.forEach(item => {
            const isActive = item.dataset.page === pageName;

            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Переключаем сами страницы
        pages.forEach(page => {
            const isActive = page.dataset.page === pageName;

            page.classList.toggle('active', isActive);
            page.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        // Старый рейтинг является отдельным рабочим модулем.
        // Показываем его только на странице "Рейтинг".
        const ratingApp = document.getElementById('rating-app-content');

        if (ratingApp) {
            const isRatingPage = pageName === 'rating';

            ratingApp.classList.toggle('app-rating-visible', isRatingPage);
            ratingApp.setAttribute(
                'aria-hidden',
                isRatingPage ? 'false' : 'true'
            );
        }



        // Запоминаем открытую страницу
        try {
            localStorage.setItem('class_app_current_page', pageName);
        } catch (error) {
            console.warn('[Navigation] Не удалось сохранить страницу.', error);
        }
    }

    /**
     * Обработчики кнопок
     */
    navItems.forEach(item => {

        item.addEventListener('click', () => {

            const pageName = item.dataset.page;

            if (!pageName) {
                return;
            }

            switchPage(pageName);
        });

    });

    /**
     * Восстанавливаем последнюю открытую страницу
     */
    let savedPage = 'rating';

    try {
        savedPage =
            localStorage.getItem('class_app_current_page') || 'rating';
    } catch (error) {
        console.warn('[Navigation] Не удалось прочитать сохранённую страницу.');
    }

    /**
     * Проверяем, что сохранённая страница действительно существует.
     */
    const pageExists = [...pages].some(
        page => page.dataset.page === savedPage
    );

    if (!pageExists) {
        savedPage = 'rating';
    }

    switchPage(savedPage);

    /**
     * Даём возможность другим модулям
     * переключать страницы программно.
     */
    window.classAppNavigation = {
        switchPage
    };

    console.log('[Navigation] Инициализация завершена.');
}

