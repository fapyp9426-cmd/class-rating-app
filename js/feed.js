/**
 * ============================================================
 * CLASS APP — FEED
 * Лента класса
 * ============================================================
 */

import {
    postsCol,
    onSnapshot
} from './firebase.js';

import {
    getStudents,
    isTeacherLoggedIn
} from './state.js';

import {
    escapeHtml
} from './utils.js';


let posts = [];


/**
 * ============================================================
 * INIT
 * ============================================================
 */

export function initFeed() {

    const feedContainer = document.getElementById('class-feed');

    if (!feedContainer) {
        console.warn('[Feed] Контейнер ленты не найден.');
        return;
    }

    // Сразу выставляем правильное состояние кнопки
    updateFeedTeacherUI();

    // Подписываемся на публикации
    subscribeToPosts();

    console.log('[Feed] Инициализация завершена.');
}


/**
 * ============================================================
 * TEACHER UI
 * ============================================================
 */

/**
 * Показывает/скрывает кнопку создания публикации
 * в зависимости от авторизации учителя.
 */
export function updateFeedTeacherUI(teacher = isTeacherLoggedIn()) {

    const createButton =
        document.getElementById('feed-create-button');

    if (!createButton) {
        return;
    }

    const isTeacher = Boolean(teacher);

    createButton.hidden = !isTeacher;

    createButton.setAttribute(
        'aria-hidden',
        isTeacher ? 'false' : 'true'
    );

    // На всякий случай блокируем кнопку,
    // если она скрыта.
    createButton.disabled = !isTeacher;
}


/**
 * ============================================================
 * FIREBASE
 * ============================================================
 */

function subscribeToPosts() {

    onSnapshot(
        postsCol,
        snapshot => {

            posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            posts.sort((a, b) => {

                const timeA = getPostTime(a);
                const timeB = getPostTime(b);

                return timeB - timeA;
            });

            renderFeed();

        },
        error => {

            console.error(
                '[Feed] Ошибка загрузки публикаций:',
                error
            );

            renderFeedError();

        }
    );
}


/**
 * ============================================================
 * TIME
 * ============================================================
 */

function getPostTime(post) {

    if (!post.createdAt) {
        return 0;
    }

    if (typeof post.createdAt.toMillis === 'function') {
        return post.createdAt.toMillis();
    }

    if (post.createdAt instanceof Date) {
        return post.createdAt.getTime();
    }

    if (typeof post.createdAt === 'number') {
        return post.createdAt;
    }

    return 0;
}


/**
 * ============================================================
 * RENDER
 * ============================================================
 */

function renderFeed() {

    const container =
        document.getElementById('class-feed');

    if (!container) return;


    if (!posts.length) {

        container.innerHTML = `
            <div class="feed-empty">

                <div class="feed-empty-icon">
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18.5z"/>
                        <path d="M8.5 8h7"/>
                        <path d="M8.5 12h7"/>
                        <path d="M8.5 16h4"/>
                    </svg>
                </div>

                <h3>Пока здесь пусто</h3>

                <p>
                    Новости и объявления класса
                    появятся здесь.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = posts
        .map(post => createPostHTML(post))
        .join('');
}


/**
 * ============================================================
 * POST
 * ============================================================
 */

function createPostHTML(post) {

    const type = post.type || 'news';

    const title = post.title || '';
    const text = post.text || '';

    const author = post.authorName || 'Класс';

    const time = formatPostDate(post.createdAt);

    const typeData = getPostTypeData(type);


    return `
        <article
            class="feed-post ${post.pinned ? 'is-pinned' : ''}"
            data-post-id="${escapeHtml(post.id)}"
        >

            <div class="feed-post-header">

                <div class="feed-post-type-icon ${typeData.className}">
                    ${typeData.icon}
                </div>

                <div class="feed-post-meta">

                    <div class="feed-post-title-row">

                        <h3 class="feed-post-title">
                            ${escapeHtml(title)}
                        </h3>

                        ${
                            post.pinned
                                ? `
                                    <span class="feed-post-pin">
                                        Закреплено
                                    </span>
                                `
                                : ''
                        }

                    </div>

                    <div class="feed-post-info">
                        <span>${escapeHtml(author)}</span>
                        <span>•</span>
                        <time>${escapeHtml(time)}</time>
                    </div>

                </div>

            </div>


            <div class="feed-post-body">

                ${
                    text
                        ? `
                            <p>
                                ${escapeHtml(text).replace(/\n/g, '<br>')}
                            </p>
                        `
                        : ''
                }

            </div>

        </article>
    `;
}


/**
 * ============================================================
 * POST TYPES
 * ============================================================
 */

function getPostTypeData(type) {

    switch (type) {

        case 'announcement':

            return {
                className: 'feed-type-announcement',
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 10v4h4l6 4V6l-6 4z"/>
                        <path d="M18 9.5a4 4 0 0 1 0 5"/>
                    </svg>
                `
            };


        case 'birthday':

            return {
                className: 'feed-type-birthday',
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 10h14v9H5z"/>
                        <path d="M3 10h18v3H3z"/>
                        <path d="M8 10V7.5A2.5 2.5 0 0 1 10.5 5c.8 0 1.5.4 2 1"/>
                        <path d="M16 10V7.5A2.5 2.5 0 0 0 13.5 5c-.8 0-1.5.4-2 1"/>
                    </svg>
                `
            };


        case 'wish':

            return {
                className: 'feed-type-wish',
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-4-.9L4 20l1.2-3.5A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7z"/>
                    </svg>
                `
            };


        default:

            return {
                className: 'feed-type-news',
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18.5z"/>
                        <path d="M8.5 8h7"/>
                        <path d="M8.5 12h7"/>
                        <path d="M8.5 16h4"/>
                    </svg>
                `
            };
    }
}


/**
 * ============================================================
 * DATE
 * ============================================================
 */

function formatPostDate(timestamp) {

    if (!timestamp) {
        return 'Недавно';
    }


    let date;


    if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();

    } else if (timestamp instanceof Date) {
        date = timestamp;

    } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);

    } else {
        return 'Недавно';
    }


    if (Number.isNaN(date.getTime())) {
        return 'Недавно';
    }


    const now = new Date();

    const sameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();


    if (sameDay) {

        return date.toLocaleTimeString(
            'ru-RU',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    }


    return date.toLocaleDateString(
        'ru-RU',
        {
            day: 'numeric',
            month: 'long'
        }
    );
}


/**
 * ============================================================
 * EMPTY / ERROR
 * ============================================================
 */

function renderFeedError() {

    const container =
        document.getElementById('class-feed');

    if (!container) return;


    container.innerHTML = `
        <div class="feed-empty feed-error">

            <div class="feed-empty-icon">
                !
            </div>

            <h3>Не удалось загрузить ленту</h3>

            <p>
                Попробуйте обновить страницу.
            </p>

        </div>
    `;
}


/**
 * ============================================================
 * PUBLIC API
 * ============================================================
 */

export function getPosts() {
    return posts;
}