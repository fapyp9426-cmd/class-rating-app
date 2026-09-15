// ===================== BIRTHDAY EFFECTS =====================

import { studentsCol, onSnapshot } from "./firebase.js";

let birthdayStudents = [];
let birthdayMode = false;
let confettiContainer = null;

// ---------------------------------------------------------
// DATE
// ---------------------------------------------------------

function getTodayBirthdayStudents(students) {
    const today = new Date();

    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return students.filter(student => {
        if (!student.birthday) return false;

        const parts = String(student.birthday).split("-");

        if (parts.length !== 3) return false;

        return (
            parts[1] === month &&
            parts[2] === day
        );
    });
}

// ---------------------------------------------------------
// NORMALIZE NAME
// ---------------------------------------------------------

function normalizeName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("ё", "е")
        .replace(/\s+/g, " ");
}

// ---------------------------------------------------------
// CSS
// ---------------------------------------------------------

function injectStyles() {
    if (document.getElementById("birthday-effects-css")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "birthday-effects-css";

    style.textContent = `

#birthday-confetti {
    position: fixed;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    overflow: hidden;

    /* Конфетти между фоном и интерфейсом */
    z-index: 1;

    contain: strict;
}

        .birthday-confetti-piece {
            position: absolute;

            top: -24px;

            width: var(--size);
            height: calc(var(--size) * 1.7);

            border-radius: 2px;

            background: var(--color);

            opacity: 0;

            will-change: transform, opacity;

            animation:
                birthday-confetti-fall
                var(--duration)
                var(--delay)
                linear
                infinite;
        }

        @keyframes birthday-confetti-fall {

            0% {
                opacity: 0;

                transform:
                    translate3d(0, -30px, 0)
                    rotate(0deg);
            }

            8% {
                opacity: .85;
            }

            88% {
                opacity: .75;
            }

            100% {
                opacity: 0;

                transform:
                    translate3d(
                        var(--drift),
                        110vh,
                        0
                    )
                    rotate(var(--rotation));
            }
        }


        /* =========================================
           BIRTHDAY MODE
           ========================================= */

        body.birthday-mode {
            /* маркер режима */
        }


        /* =========================================
           BIRTHDAY CARD HIGHLIGHT
           ========================================= */

        .birthday-student-highlight {
            position: relative;

            border-color:
                rgba(139, 92, 246, .55) !important;

            background:
                linear-gradient(
                    135deg,
                    rgba(59, 130, 246, .13),
                    rgba(139, 92, 246, .15)
                ) !important;

            box-shadow:
                0 0 0 1px
                    rgba(139, 92, 246, .12),
                0 8px 28px
                    rgba(99, 102, 241, .13) !important;

            transition:
                background .25s ease,
                border-color .25s ease,
                box-shadow .25s ease;
        }


        /* =========================================
           PARTY HAT
           ========================================= */

        .birthday-avatar-with-hat {
            position: relative !important;
            overflow: visible !important;
        }

        .birthday-party-hat {
            position: absolute;

            left: 50%;
            top: -18px;

            width: 27px;
            height: 27px;

            transform:
                translateX(-50%)
                rotate(-8deg);

            pointer-events: none;

            z-index: 20;
        }

        .birthday-party-hat::before {
            content: "";

            position: absolute;

            left: 4px;
            bottom: 1px;

            width: 20px;
            height: 21px;

            background:
                linear-gradient(
                    145deg,
                    #8b5cf6,
                    #6366f1 55%,
                    #3b82f6
                );

            clip-path:
                polygon(
                    50% 0,
                    100% 100%,
                    0 100%
                );

            filter:
                drop-shadow(
                    0 3px 5px
                    rgba(79, 70, 229, .25)
                );
        }

        .birthday-party-hat::after {
            content: "";

            position: absolute;

            left: 50%;
            top: -1px;

            width: 6px;
            height: 6px;

            transform:
                translateX(-50%);

            border-radius: 50%;

            background: #fff;

            box-shadow:
                0 0 5px
                rgba(255,255,255,.8);
        }


        /* =========================================
           ACCESSIBILITY / WEAK PC
           ========================================= */

        @media (prefers-reduced-motion: reduce) {

            .birthday-confetti-piece {
                animation: none !important;
                display: none;
            }

        }
    `;

    document.head.appendChild(style);
}

// ---------------------------------------------------------
// CONFETTI
// ---------------------------------------------------------

function createConfetti() {
    if (confettiContainer) {
        return;
    }

    confettiContainer =
        document.createElement("div");

    confettiContainer.id =
        "birthday-confetti";

    confettiContainer.setAttribute(
        "aria-hidden",
        "true"
    );

    const colors = [
        "#3b82f6",
        "#6366f1",
        "#8b5cf6",
        "#a855f7",
        "#f59e0b",
        "#22c55e",
        "#ec4899"
    ];

    /*
        Всего 36 элементов.

        Это специально мало:
        - никаких canvas;
        - никаких JS-циклов;
        - только CSS animation;
        - GPU-friendly transform;
        - практически не грузит CPU.
    */

    for (let i = 0; i < 36; i++) {

        const piece =
            document.createElement("span");

        piece.className =
            "birthday-confetti-piece";

        const size =
            4 + Math.random() * 4;

        const duration =
            7 + Math.random() * 4;

        const delay =
            -(Math.random() * duration);

        const drift =
            -100 + Math.random() * 200;

        const rotation =
            360 + Math.random() * 720;

        piece.style.left =
            `${Math.random() * 100}%`;

        piece.style.setProperty(
            "--size",
            `${size}px`
        );

        piece.style.setProperty(
            "--duration",
            `${duration}s`
        );

        piece.style.setProperty(
            "--delay",
            `${delay}s`
        );

        piece.style.setProperty(
            "--drift",
            `${drift}px`
        );

        piece.style.setProperty(
            "--rotation",
            `${rotation}deg`
        );

        piece.style.setProperty(
            "--color",
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ]
        );

        confettiContainer.appendChild(piece);
    }

    document.body.appendChild(
        confettiContainer
    );
}

function removeConfetti() {
    if (!confettiContainer) {
        return;
    }

    confettiContainer.remove();

    confettiContainer = null;
}

// ---------------------------------------------------------
// DISABLE OLD RAIN / LEAVES
// ---------------------------------------------------------

function updateSeasonEffect() {

    /*
        Здесь мы не удаляем seasons.js.
        Просто прячем его визуальный слой,
        когда включён день рождения.

        Используем несколько распространённых
        вариантов названий контейнера.
    */

    const selectors = [
        "#season-effects",
        "#season-effect",
        ".season-effects",
        ".season-effect",
        ".rain-container",
        ".rain",
        ".leaves-container",
        ".season-particles"
    ];

    selectors.forEach(selector => {

        document
            .querySelectorAll(selector)
            .forEach(element => {

                element.classList.toggle(
                    "birthday-season-hidden",
                    birthdayMode
                );
            });
    });

    if (
        document.getElementById(
            "birthday-season-hide-style"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "birthday-season-hide-style";

    style.textContent = `
        body.birthday-mode
        .birthday-season-hidden {
            display: none !important;
        }
    `;

    document.head.appendChild(style);
}

// ---------------------------------------------------------
// PARTY HAT
// ---------------------------------------------------------

function addPartyHat(avatar) {

    if (!avatar) {
        return;
    }

    avatar.classList.add(
        "birthday-avatar-with-hat"
    );

    if (
        avatar.querySelector(
            ".birthday-party-hat"
        )
    ) {
        return;
    }

    const hat =
        document.createElement("span");

    hat.className =
        "birthday-party-hat";

    hat.setAttribute(
        "aria-hidden",
        "true"
    );

    avatar.appendChild(hat);
}

function removePartyHats() {

    document
        .querySelectorAll(
            ".birthday-party-hat"
        )
        .forEach(hat => hat.remove());

    document
        .querySelectorAll(
            ".birthday-avatar-with-hat"
        )
        .forEach(element => {

            element.classList.remove(
                "birthday-avatar-with-hat"
            );
        });
}

// ---------------------------------------------------------
// FIND STUDENT CARD
// ---------------------------------------------------------

function isStudentCard(element) {

    const tag =
        element.tagName;

    if (
        tag === "BODY" ||
        tag === "HTML" ||
        tag === "MAIN" ||
        tag === "SECTION"
    ) {
        return false;
    }

    const rect =
        element.getBoundingClientRect();

    /*
        Не рассматриваем огромные контейнеры.
        Это помогает не подсветить весь список.
    */

    if (
        rect.width > 700 ||
        rect.height > 500
    ) {
        return false;
    }

    return true;
}

function findStudentCard(name) {

    const normalized =
        normalizeName(name);

    if (!normalized) {
        return null;
    }

    /*
        Сначала ищем элементы с типичными
        классами карточек рейтинга.
    */

    const selectors = [
        ".student-card",
        ".student-item",
        ".student-row",
        ".rating-card",
        ".rating-item",
        ".students-card",
        ".student"
    ];

    for (const selector of selectors) {

        const elements =
            document.querySelectorAll(selector);

        for (const element of elements) {

            if (
                normalizeName(
                    element.textContent
                ).includes(normalized)
            ) {
                return element;
            }
        }
    }

    /*
        Запасной вариант:
        ищем текст имени и поднимаемся
        максимум на 4 уровня вверх.
    */

    const all =
        document.querySelectorAll(
            "#students-list *"
        );

    for (const element of all) {

        if (
            element.children.length > 3
        ) {
            continue;
        }

        if (
            !normalizeName(
                element.textContent
            ).includes(normalized)
        ) {
            continue;
        }

        let card = element;

        for (let i = 0; i < 4; i++) {

            if (!card.parentElement) {
                break;
            }

            card = card.parentElement;

            if (
                isStudentCard(card)
            ) {
                return card;
            }
        }
    }

    return null;
}

// ---------------------------------------------------------
// UPDATE RATING
// ---------------------------------------------------------

function updateRatingHighlights() {

    /*
        Сначала убираем старые подсветки.
    */

    document
        .querySelectorAll(
            ".birthday-student-highlight"
        )
        .forEach(element => {

            element.classList.remove(
                "birthday-student-highlight"
            );
        });

    removePartyHats();

    if (!birthdayMode) {
        return;
    }

    birthdayStudents.forEach(student => {

        const card =
            findStudentCard(
                student.name
            );

        if (!card) {
            return;
        }

        card.classList.add(
            "birthday-student-highlight"
        );

        /*
            Ищем аватар внутри карточки.
        */

        const avatar =
            card.querySelector(`
                .student-avatar,
                .avatar,
                .student-card-avatar,
                .rating-avatar,
                [class*="avatar"]
            `);

        if (avatar) {
            addPartyHat(avatar);
        }
    });
}

// ---------------------------------------------------------
// MAIN MODE
// ---------------------------------------------------------

function updateBirthdayMode(students) {

    birthdayStudents =
        getTodayBirthdayStudents(
            students
        );

    const active =
        birthdayStudents.length > 0;

    birthdayMode = active;

    document.body.classList.toggle(
        "birthday-mode",
        active
    );

    if (active) {
        createConfetti();
    } else {
        removeConfetti();
    }

    updateSeasonEffect();
    updateRatingHighlights();

    /*
        render.js может перерисовать рейтинг
        после этого момента.
        Поэтому проверяем карточки ещё раз
        после отрисовки.
    */

    setTimeout(() => {
        updateRatingHighlights();
    }, 300);
}



// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------

function initBirthdayEffects() {

    injectStyles();

   

    onSnapshot(
        studentsCol,
        snapshot => {

            const students =
                snapshot.docs.map(
                    doc => ({
                        id: doc.id,
                        ...doc.data()
                    })
                );

            updateBirthdayMode(
                students
            );
        },
        error => {
            console.error(
                "Birthday effects Firebase error:",
                error
            );
        }
    );

    /*
        При переключении вкладок
        повторно проверяем рейтинг.
    */

    document.addEventListener(
        "click",
        () => {

            if (!birthdayMode) {
                return;
            }

            setTimeout(
                updateRatingHighlights,
                100
            );
        }
    );
}

// ---------------------------------------------------------

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initBirthdayEffects
    );
} else {
    initBirthdayEffects();
}

// ===================== /BIRTHDAY EFFECTS =====================