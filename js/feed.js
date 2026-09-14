/**
 * ============================================================
 * CLASS APP — FEED
 * Лента класса
 * ============================================================
 */

import {
    postsCol,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from './firebase.js';

import {
    getStudents,
    isTeacherLoggedIn
} from './state.js';

import {
    escapeHtml
} from './utils.js';


let posts = [];

let editingPostId = null;

let feedCreateModal = null;
let feedCreateForm = null;
let feedCreateButton = null;
let feedCreateClose = null;
let feedCreateCancel = null;
let feedCreateBackdrop = null;
let feedPostText = null;
let feedTextCounter = null;


/**
 * ============================================================
 * INIT
 * ============================================================
 */

export function initFeed() {

    const feedContainer =
        document.getElementById('class-feed');

    if (!feedContainer) {
        console.warn('[Feed] Контейнер ленты не найден.');
        return;
    }

    updateFeedTeacherUI();

    initCreatePostModal();

    subscribeToPosts();

    console.log('[Feed] Инициализация завершена.');
}


/**
 * ============================================================
 * TEACHER UI
 * ============================================================
 */

export function updateFeedTeacherUI(
    teacher = isTeacherLoggedIn()
) {

    const createButton =
        document.getElementById('feed-create-button');

    if (!createButton) {
        return;
    }

    const isTeacher = Boolean(teacher);

    createButton.hidden = !isTeacher;

    createButton.disabled = !isTeacher;

    createButton.setAttribute(
        'aria-hidden',
        isTeacher ? 'false' : 'true'
    );
}


/**
 * ============================================================
 * CREATE POST MODAL
 * ============================================================
 */

function initCreatePostModal() {

    feedCreateModal =
        document.getElementById('feed-create-modal');

    feedCreateForm =
        document.getElementById('feed-create-form');

    feedCreateButton =
        document.getElementById('feed-create-button');

    feedCreateClose =
        document.getElementById('feed-create-close');

    feedCreateCancel =
        document.getElementById('feed-create-cancel');

    feedCreateBackdrop =
        document.querySelector(
            '[data-feed-modal-close]'
        );

    feedPostText =
        document.getElementById('feed-post-text');

    feedTextCounter =
        document.getElementById('feed-text-counter');


    if (!feedCreateModal) {
        console.warn(
            '[Feed] Модалка создания публикации не найдена.'
        );

        return;
    }


    /**
     * Открытие через +
     */
    if (feedCreateButton) {

        feedCreateButton.addEventListener(
            'click',
            () => {

                if (!isTeacherLoggedIn()) {
                    return;
                }

                openCreatePostModal();

            }
        );

    }


    /**
     * Закрытие через крестик
     */
    if (feedCreateClose) {

        feedCreateClose.addEventListener(
            'click',
            closeCreatePostModal
        );

    }


    /**
     * Закрытие через Отмена
     */
    if (feedCreateCancel) {

        feedCreateCancel.addEventListener(
            'click',
            closeCreatePostModal
        );

    }


    /**
     * Закрытие через затемнение
     */
    if (feedCreateBackdrop) {

        feedCreateBackdrop.addEventListener(
            'click',
            closeCreatePostModal
        );

    }


    /**
     * Счётчик символов
     */
    if (feedPostText && feedTextCounter) {

        feedPostText.addEventListener(
            'input',
            updateFeedTextCounter
        );

    }


    /**
     * Пока Firebase-создание ещё не подключаем.
     */
if (feedCreateForm) {

    feedCreateForm.addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            // Создавать публикации может только учитель
            if (!isTeacherLoggedIn()) {
                return;
            }


            const type =
                document.getElementById(
                    'feed-post-type'
                )?.value || 'news';


            const title =
                document.getElementById(
                    'feed-post-title'
                )?.value.trim() || '';


            const text =
                document.getElementById(
                    'feed-post-text'
                )?.value.trim() || '';


            // Защита от пустой публикации
            if (!title || !text) {
                return;
            }


            const submitButton =
                document.getElementById(
                    'feed-create-submit'
                );


            const submitText =
                submitButton?.querySelector('span');


            // Блокируем повторные нажатия
            if (submitButton) {
                submitButton.disabled = true;
            }


            if (submitText) {
                submitText.textContent =
                    'Публикация...';
            }


            try {

if (editingPostId) {

    // ========================================================
    // РЕДАКТИРОВАНИЕ СУЩЕСТВУЮЩЕГО ПОСТА
    // ========================================================

    await updateDoc(
        doc(
            postsCol,
            editingPostId
        ),
        {
            title,
            text,
            type
        }
    );


    console.log(
        '[Feed] Публикация обновлена:',
        editingPostId
    );


} else {

    // ========================================================
    // СОЗДАНИЕ НОВОГО ПОСТА
    // ========================================================

    const post = {

        title,

        text,

        type,

        authorName: 'Учитель',

        pinned: false,

        createdAt:
            serverTimestamp()

    };


    const docRef =
        await addDoc(
            postsCol,
            post
        );


    console.log(
        '[Feed] Публикация создана:',
        docRef.id
    );

}


                // Очищаем форму
feedCreateForm.reset();

editingPostId = null;

updateFeedTextCounter();
const modalTitle =
    document.getElementById(
        'feed-create-title'
    );

if (modalTitle) {
    modalTitle.textContent =
        'Новая публикация';
}


const submitText =
    document
        .getElementById('feed-create-submit')
        ?.querySelector('span');

if (submitText) {
    submitText.textContent =
        'Опубликовать';
}


                // Закрываем модалку
                closeCreatePostModal();


            } catch (error) {

                console.error(
                    '[Feed] Не удалось создать публикацию:',
                    error
                );


                alert(
                    'Не удалось опубликовать запись. Проверь подключение к Firebase.'
                );


            } finally {

                if (submitButton) {
                    submitButton.disabled = false;
                }


                if (submitText) {
                    submitText.textContent =
                        'Опубликовать';
                }

            }

        }
    );

}


    /**
     * Закрытие через Escape
     */
    document.addEventListener(
        'keydown',
        event => {

            if (event.key !== 'Escape') {
                return;
            }

            if (
                feedCreateModal &&
                !feedCreateModal.classList.contains('hidden')
            ) {
                closeCreatePostModal();
            }

        }
    );

}


/**
 * ============================================================
 * POST MENU
 * ============================================================
 */

document.addEventListener('click', async event => {

    const menuButton =
        event.target.closest('.feed-post-menu');

    const existingMenu =
        document.querySelector('.feed-post-actions');


    // ========================================================
    // ОТКРЫТИЕ МЕНЮ
    // ========================================================

    if (menuButton) {

        event.stopPropagation();

        const postId =
            menuButton.dataset.postMenu;

        if (!postId) {
            return;
        }


        // Если меню уже открыто — закрываем
        if (
            existingMenu &&
            existingMenu.dataset.postId === postId
        ) {
            existingMenu.remove();
            return;
        }


        // Закрываем старое меню
        if (existingMenu) {
            existingMenu.remove();
        }


        const post =
            menuButton.closest('.feed-post');

        if (!post) {
            return;
        }


        const actions =
            document.createElement('div');

        actions.className =
            'feed-post-actions';

        actions.dataset.postId =
            postId;


        actions.innerHTML = `
            <button
                type="button"
                class="feed-post-action"
                data-action="edit"
            >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M4 20h4L19 9l-4-4L4 16v4z"/>
                    <path d="M13.5 6.5l4 4"/>
                </svg>

                <span>Редактировать</span>
            </button>

            <button
                type="button"
                class="feed-post-action feed-post-action-danger"
                data-action="delete"
            >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M4 7h16"/>
                    <path d="M9 7V4h6v3"/>
                    <path d="M7 7l1 13h8l1-13"/>
                    <path d="M10 11v5"/>
                    <path d="M14 11v5"/>
                </svg>

                <span>Удалить</span>
            </button>
        `;


        post.appendChild(actions);

        return;
    }


    // ========================================================
    // ДЕЙСТВИЯ МЕНЮ
    // ========================================================

    if (event.target.closest('.feed-post-actions')) {

        const actionButton =
            event.target.closest('.feed-post-action');

        if (!actionButton) {
            return;
        }


        const action =
            actionButton.dataset.action;

        const actions =
            actionButton.closest(
                '.feed-post-actions'
            );

        const postId =
            actions?.dataset.postId;

        if (!postId) {
            return;
        }


        // ====================================================
        // УДАЛЕНИЕ
        // ====================================================

        if (action === 'delete') {

            const confirmed =
                confirm(
                    'Удалить эту публикацию?\n\nЭто действие нельзя отменить.'
                );

            if (!confirmed) {
                return;
            }


            try {

                await deleteDoc(
                    doc(
                        postsCol,
                        postId
                    )
                );


                console.log(
                    '[Feed] Публикация удалена:',
                    postId
                );


                actions.remove();


            } catch (error) {

                console.error(
                    '[Feed] Не удалось удалить публикацию:',
                    error
                );


                alert(
                    'Не удалось удалить публикацию. Проверь подключение к Firebase.'
                );

            }

            return;
        }


        // ====================================================
        // РЕДАКТИРОВАНИЕ — ПОКА НЕ ПОДКЛЮЧЕНО
        // ====================================================
if (action === 'edit') {

    actions.remove();


    const post =
        posts.find(
            item => item.id === postId
        );


    if (!post) {

        console.warn(
            '[Feed] Пост для редактирования не найден:',
            postId
        );

        return;
    }


    editingPostId = postId;


    // Заполняем существующую форму
    const typeInput =
        document.getElementById(
            'feed-post-type'
        );

    const titleInput =
        document.getElementById(
            'feed-post-title'
        );

    const textInput =
        document.getElementById(
            'feed-post-text'
        );


    if (typeInput) {
        typeInput.value =
            post.type || 'news';
    }


    if (titleInput) {
        titleInput.value =
            post.title || '';
    }


    if (textInput) {
        textInput.value =
            post.text || '';
    }


    updateFeedTextCounter();


    // Меняем заголовок модалки
    const modalTitle =
        document.getElementById(
            'feed-create-title'
        );

    if (modalTitle) {
        modalTitle.textContent =
            'Редактирование публикации';
    }


    // Меняем текст кнопки
    const submitButton =
        document.getElementById(
            'feed-create-submit'
        );

    const submitText =
        submitButton?.querySelector('span');

    if (submitText) {
        submitText.textContent =
            'Сохранить изменения';
    }


    openCreatePostModal();

    return;
}

    }


    // ========================================================
    // КЛИК ВНЕ МЕНЮ
    // ========================================================

    if (existingMenu) {
        existingMenu.remove();
    }

});
/**
 * ============================================================
 * OPEN
 * ============================================================
 */

function openCreatePostModal() {

    if (!feedCreateModal) {
        return;
    }


    if (!isTeacherLoggedIn()) {
        return;
    }


    if (feedCreateForm) {
        feedCreateForm.reset();
    }


    updateFeedTextCounter();


    feedCreateModal.classList.remove('hidden');

    feedCreateModal.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.classList.add(
        'feed-modal-open'
    );


    const titleInput =
        document.getElementById(
            'feed-post-title'
        );

    if (titleInput) {

        setTimeout(() => {
            titleInput.focus();
        }, 50);

    }

}


/**
 * ============================================================
 * CLOSE
 * ============================================================
 */

function closeCreatePostModal() {

    if (!feedCreateModal) {
        return;
    }


    feedCreateModal.classList.add('hidden');

    feedCreateModal.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.classList.remove(
        'feed-modal-open'
    );

}


/**
 * ============================================================
 * TEXT COUNTER
 * ============================================================
 */

function updateFeedTextCounter() {

    if (!feedPostText || !feedTextCounter) {
        return;
    }


    const length =
        feedPostText.value.length;


    feedTextCounter.textContent =
        `${length} / 2000`;


    if (length >= 1900) {

        feedTextCounter.classList.add(
            'is-warning'
        );

    } else {

        feedTextCounter.classList.remove(
            'is-warning'
        );

    }

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

                const timeA =
                    getPostTime(a);

                const timeB =
                    getPostTime(b);

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


    if (
        typeof post.createdAt.toMillis ===
        'function'
    ) {
        return post.createdAt.toMillis();
    }


    if (
        post.createdAt instanceof Date
    ) {
        return post.createdAt.getTime();
    }


    if (
        typeof post.createdAt === 'number'
    ) {
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
        document.getElementById(
            'class-feed'
        );

    if (!container) {
        return;
    }


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

    const type =
        post.type || 'news';

    const title =
        post.title || '';

    const text =
        post.text || '';

    const author =
        post.authorName || 'Класс';

    const time =
        formatPostDate(
            post.createdAt
        );

    const typeData =
        getPostTypeData(type);


return `
    <article
        class="feed-post ${post.pinned ? 'is-pinned' : ''}"
        data-post-id="${escapeHtml(post.id)}"
    >

        ${
            isTeacherLoggedIn()
                ? `
                    <button
                        class="feed-post-menu"
                        type="button"
                        data-post-menu="${escapeHtml(post.id)}"
                        aria-label="Управление публикацией"
                        title="Управление публикацией"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="5"
                                cy="12"
                                r="1.5"
                            />

                            <circle
                                cx="12"
                                cy="12"
                                r="1.5"
                            />

                            <circle
                                cx="19"
                                cy="12"
                                r="1.5"
                            />
                        </svg>
                    </button>
                `
                : ''
        }
            <div class="feed-post-header">

                <div
                    class="feed-post-type-icon ${typeData.className}"
                >
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

                        <span>
                            ${escapeHtml(author)}
                        </span>

                        <span>•</span>

                        <time>
                            ${escapeHtml(time)}
                        </time>

                    </div>

                </div>

            </div>


            <div class="feed-post-body">

                ${
                    text
                        ? `
                            <p>
                                ${escapeHtml(text)
                                    .replace(/\n/g, '<br>')}
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

                className:
                    'feed-type-announcement',

                icon: `
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M4 10v4h4l6 4V6l-6 4z"/>
                        <path d="M18 9.5a4 4 0 0 1 0 5"/>
                    </svg>
                `

            };


        case 'event':

            return {

                className:
                    'feed-type-event',

                icon: `
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <rect
                            x="4"
                            y="5"
                            width="16"
                            height="15"
                            rx="2"
                        />

                        <path d="M8 3v4"/>
                        <path d="M16 3v4"/>
                        <path d="M4 10h16"/>
                        <path d="M8 14h3"/>
                    </svg>
                `

            };


        case 'wish':

            return {

                className:
                    'feed-type-wish',

                icon: `
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-4-.9L4 20l1.2-3.5A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7z"/>
                    </svg>
                `

            };


        default:

            return {

                className:
                    'feed-type-news',

                icon: `
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
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


    if (
        typeof timestamp.toDate ===
        'function'
    ) {

        date =
            timestamp.toDate();

    } else if (
        timestamp instanceof Date
    ) {

        date =
            timestamp;

    } else if (
        typeof timestamp === 'number'
    ) {

        date =
            new Date(timestamp);

    } else {

        return 'Недавно';

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 'Недавно';

    }


    const now =
        new Date();


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
        document.getElementById(
            'class-feed'
        );

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="feed-empty feed-error">

            <div class="feed-empty-icon">
                !
            </div>

            <h3>
                Не удалось загрузить ленту
            </h3>

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