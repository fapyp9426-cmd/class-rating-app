const SECOND_EASTER_VIDEO = './assets/easter-egg-2.mp4';

const REQUIRED_TAPS = 10;

let logoTaps = 0;
let isPlaying = false;
let resetTimer = null;


// =====================================================
// STYLES
// =====================================================

function injectStyles() {

    if (document.getElementById('easter-egg-2-styles')) {
        return;
    }

    const style = document.createElement('style');

    style.id = 'easter-egg-2-styles';

    style.textContent = `

        /* =================================================
           OVERLAY
        ================================================= */

        #easter-egg-2-overlay {

            position: fixed;
            inset: 0;

            z-index: 2000000;

            background: #000;

            opacity: 0;

            pointer-events: none;

            overflow: hidden;

            transition:
                opacity 1.1s ease;
        }

        #easter-egg-2-overlay.is-visible {

            opacity: 1;

            pointer-events: auto;
        }

        #easter-egg-2-overlay.is-closing {

            opacity: 0;
        }


        /* =================================================
           VIDEO
        ================================================= */

        #easter-egg-2-video {

            position: absolute;

            inset: 0;

            width: 100%;
            height: 100%;

            object-fit: contain;

            background: #000;

            opacity: 0;

            transform: scale(0.985);

            transition:
                opacity 1.4s ease,
                transform 1.6s ease;

            pointer-events: none;
        }

        #easter-egg-2-video.is-visible {

            opacity: 1;

            transform: scale(1);
        }

        #easter-egg-2-video.is-hiding {

            opacity: 0;

            transform: scale(1.01);

            transition:
                opacity 1.15s ease,
                transform 1.15s ease;
        }


        /* =================================================
           CRT
        ================================================= */

        .easter-egg-2-crt {

            position: absolute;

            inset: 0;

            background:
                repeating-linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.055) 0px,
                    rgba(255,255,255,0.055) 1px,
                    rgba(0,0,0,0.055) 2px,
                    rgba(0,0,0,0.055) 4px
                );

            opacity: 0;

            pointer-events: none;

            transition:
                opacity 2s ease;
        }

        .easter-egg-2-crt.is-active {

            opacity: 1;
        }

        .easter-egg-2-crt.is-fading {

            opacity: 0;
        }


        /* =================================================
           VIGNETTE
        ================================================= */

        .easter-egg-2-vignette {

            position: absolute;

            inset: -10%;

            background:
                radial-gradient(
                    ellipse at center,
                    transparent 45%,
                    rgba(0,0,0,0.35) 72%,
                    rgba(0,0,0,0.82) 100%
                );

            opacity: 0;

            pointer-events: none;

            transition:
                opacity 1.8s ease;
        }

        .easter-egg-2-vignette.is-active {

            opacity: 1;
        }

        .easter-egg-2-vignette.is-fading {

            opacity: 0;
        }


        /* =================================================
           TV LINE
        ================================================= */

        .easter-egg-2-line {

            position: absolute;

            left: 0;
            right: 0;

            top: 50%;

            height: 2px;

            background: rgba(255,255,255,0.75);

            box-shadow:
                0 0 8px rgba(255,255,255,0.6),
                0 0 22px rgba(255,255,255,0.35);

            opacity: 0;

            transform:
                scaleX(0)
                scaleY(1);

            transition:
                opacity 0.35s ease,
                transform 0.9s cubic-bezier(.22,.61,.36,1);
        }

        .easter-egg-2-line.is-active {

            opacity: 0.8;

            transform:
                scaleX(1)
                scaleY(1);
        }

        .easter-egg-2-line.is-fading {

            opacity: 0;

            transform:
                scaleX(1)
                scaleY(0.2);
        }


        /* =================================================
           CONTROLS
        ================================================= */

        .easter-egg-2-controls {

            position: absolute;

            left: 0;
            right: 0;
            bottom: 32px;

            display: flex;

            justify-content: center;

            align-items: center;

            gap: 12px;

            z-index: 20;

            opacity: 0;

            transform: translateY(14px);

            pointer-events: none;

            transition:
                opacity 0.8s ease,
                transform 0.8s ease;
        }

        .easter-egg-2-controls.is-visible {

            opacity: 1;

            transform: translateY(0);

            pointer-events: auto;
        }


        /* =================================================
           CHICKEN GUN BUTTON
        ================================================= */

        .easter-egg-2-top {

            border: 0;

            padding: 13px 22px;

            border-radius: 14px;

            background:
                linear-gradient(
                    135deg,
                    #3b82f6,
                    #8b5cf6
                );

            color: white;

            font-family: inherit;

            font-size: 14px;

            font-weight: 800;

            letter-spacing: 0.3px;

            cursor: pointer;

            box-shadow:
                0 8px 30px rgba(59,130,246,0.25);

            transition:
                transform 0.18s ease,
                box-shadow 0.18s ease,
                filter 0.18s ease;

            -webkit-tap-highlight-color: transparent;

            user-select: none;
        }

        .easter-egg-2-top:hover {

            transform: translateY(-2px) scale(1.025);

            box-shadow:
                0 12px 35px rgba(59,130,246,0.35);
        }

        .easter-egg-2-top:active {

            transform: scale(0.94);
        }


        /* =================================================
           CLOSE BUTTON
        ================================================= */

        .easter-egg-2-close {

            width: 45px;
            height: 45px;

            border: 1px solid rgba(255,255,255,0.15);

            border-radius: 50%;

            background: rgba(10,10,15,0.72);

            color: rgba(255,255,255,0.85);

            font-family: Arial, sans-serif;

            font-size: 22px;

            line-height: 1;

            cursor: pointer;

            backdrop-filter: blur(8px);

            -webkit-backdrop-filter: blur(8px);

            transition:
                transform 0.18s ease,
                background 0.18s ease;

            -webkit-tap-highlight-color: transparent;
        }

        .easter-egg-2-close:hover {

            transform: rotate(90deg) scale(1.05);

            background: rgba(255,255,255,0.12);
        }

        .easter-egg-2-close:active {

            transform: scale(0.9);
        }


        /* =================================================
           PARTICLES
        ================================================= */

        .easter-egg-2-particle {

            position: absolute;

            left: 50%;
            top: 50%;

            z-index: 30;

            font-size: 20px;

            pointer-events: none;

            opacity: 0;

            animation:
                easterEgg2Particle 900ms ease-out forwards;
        }

        @keyframes easterEgg2Particle {

            0% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    scale(0.5);
            }

            15% {

                opacity: 1;
            }

            100% {

                opacity: 0;

                transform:
                    translate(
                        calc(-50% + var(--x)),
                        calc(-50% + var(--y))
                    )
                    rotate(var(--rotate))
                    scale(1.15);
            }
        }




        /* =================================================
           SHAKE
        ================================================= */

        #easter-egg-2-overlay.is-shaking {

            animation:
                easterEgg2Shake 380ms ease;
        }

        @keyframes easterEgg2Shake {

            0% {
                transform: translate3d(0,0,0);
            }

            20% {
                transform: translate3d(-5px,2px,0);
            }

            40% {
                transform: translate3d(5px,-2px,0);
            }

            60% {
                transform: translate3d(-3px,1px,0);
            }

            80% {
                transform: translate3d(3px,-1px,0);
            }

            100% {
                transform: translate3d(0,0,0);
            }
        }


        /* =================================================
           BLACKOUT
        ================================================= */

        .easter-egg-2-blackout {

            position: absolute;

            inset: 0;

            z-index: 40;

            background: #000;

            opacity: 0;

            pointer-events: none;

            transition:
                opacity 1.2s ease;
        }

        .easter-egg-2-blackout.is-active {

            opacity: 1;
        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {

            .easter-egg-2-controls {

                bottom: 24px;

                padding:
                    0 16px;
            }

            .easter-egg-2-top {

                padding:
                    12px 18px;

                font-size: 13px;
            }

            .easter-egg-2-close {

                width: 42px;
                height: 42px;
            }
        }
    `;

    document.head.appendChild(style);
}


// =====================================================
// CHECK RATING
// =====================================================

function isRatingPage() {

    const activePage = document.querySelector(
        '.app-page.active[data-page="rating"]'
    );

    if (activePage) {
        return true;
    }

    const ratingContent = document.querySelector(
        '#rating-app-content.app-rating-visible'
    );

    if (ratingContent) {
        return true;
    }

    return false;
}


// =====================================================
// RESET COUNTER
// =====================================================

function resetTapCounter() {

    logoTaps = 0;

    if (resetTimer) {

        clearTimeout(resetTimer);

        resetTimer = null;
    }
}


// =====================================================
// LOGO TAP
// =====================================================

function handleLogoTap() {

    if (isPlaying) {
        return;
    }

    if (!isRatingPage()) {

        resetTapCounter();

        return;
    }

    logoTaps++;

    if (resetTimer) {
        clearTimeout(resetTimer);
    }

    resetTimer = setTimeout(() => {

        logoTaps = 0;

    }, 3500);


    if (logoTaps >= REQUIRED_TAPS) {

        resetTapCounter();

        playSecondEasterEgg();
    }
}


// =====================================================
// CREATE OVERLAY
// =====================================================

function createOverlay() {

    const old = document.getElementById(
        'easter-egg-2-overlay'
    );

    if (old) {
        old.remove();
    }


    const overlay = document.createElement('div');

    overlay.id = 'easter-egg-2-overlay';


    overlay.innerHTML = `

        <video
            id="easter-egg-2-video"
            src="${SECOND_EASTER_VIDEO}"
            playsinline
            webkit-playsinline
            preload="auto"
        ></video>

        <div class="easter-egg-2-crt"></div>

        <div class="easter-egg-2-vignette"></div>

        <div class="easter-egg-2-line"></div>

        <div class="easter-egg-2-hit"></div>

        <div class="easter-egg-2-controls">

            <button
                class="easter-egg-2-top"
                type="button"
            >
                🔥 ЧИКЕН ГАН ТОП!
            </button>

            <button
                class="easter-egg-2-close"
                type="button"
                aria-label="Закрыть"
            >
                ×
            </button>

        </div>

        <div class="easter-egg-2-blackout"></div>
    `;


    document.body.appendChild(overlay);


    return {

        overlay,

        video:
            overlay.querySelector(
                '#easter-egg-2-video'
            ),

        crt:
            overlay.querySelector(
                '.easter-egg-2-crt'
            ),

        vignette:
            overlay.querySelector(
                '.easter-egg-2-vignette'
            ),

        line:
            overlay.querySelector(
                '.easter-egg-2-line'
            ),

        hit:
            overlay.querySelector(
                '.easter-egg-2-hit'
            ),

        controls:
            overlay.querySelector(
                '.easter-egg-2-controls'
            ),

        topButton:
            overlay.querySelector(
                '.easter-egg-2-top'
            ),

        closeButton:
            overlay.querySelector(
                '.easter-egg-2-close'
            ),

        blackout:
            overlay.querySelector(
                '.easter-egg-2-blackout'
            )
    };
}


// =====================================================
// CHICKEN GUN BUTTON EFFECT
// =====================================================

function chickenGunEffect(
    overlay,
    hit
) {

    // Встряска
    overlay.classList.remove(
        'is-shaking'
    );

    void overlay.offsetWidth;

    overlay.classList.add(
        'is-shaking'
    );


    // Лёгкая вспышка
    hit.classList.add(
        'is-active'
    );

    setTimeout(() => {

        hit.classList.remove(
            'is-active'
        );

    }, 120);


    // Частицы
    const particles = [
        '🔥',
        '⚡',
        '✨',
        '💥',
        '🔥',
        '⭐',
        '💫',
        '⚡'
    ];


    particles.forEach((emoji, index) => {

        const particle =
            document.createElement('span');

        particle.className =
            'easter-egg-2-particle';

        particle.textContent = emoji;


        const angle =
            (Math.PI * 2 / particles.length) *
            index;

        const distance =
            90 + Math.random() * 130;


        const x =
            Math.cos(angle) * distance;

        const y =
            Math.sin(angle) * distance;


        particle.style.setProperty(
            '--x',
            `${x}px`
        );

        particle.style.setProperty(
            '--y',
            `${y}px`
        );

        particle.style.setProperty(
            '--rotate',
            `${Math.random() * 360 - 180}deg`
        );


        overlay.appendChild(
            particle
        );


        setTimeout(() => {

            particle.remove();

        }, 1000);
    });
}


// =====================================================
// PLAY EASTER EGG
// =====================================================

async function playSecondEasterEgg() {

    if (isPlaying) {
        return;
    }

    isPlaying = true;

    injectStyles();


    const {
        overlay,
        video,
        crt,
        vignette,
        line,
        controls,
        topButton,
        closeButton,
        hit,
        blackout
    } = createOverlay();


    // =================================================
    // 1. ПЛАВНОЕ ЗАТЕМНЕНИЕ
    // =================================================

    requestAnimationFrame(() => {

        overlay.classList.add(
            'is-visible'
        );
    });


    // =================================================
    // 2. ВИДЕО СТАРТУЕТ СРАЗУ
    //
    // Звук НЕ muted.
    // Оно проигрывается под CRT.
    // =================================================

    try {

        video.currentTime = 0;

        await video.play();

    } catch (error) {

        console.warn(
            'Easter Egg 2 video play error:',
            error
        );

        cleanup();

        return;
    }


    // =================================================
    // 3. CRT
    // =================================================

    setTimeout(() => {

        crt.classList.add(
            'is-active'
        );

        vignette.classList.add(
            'is-active'
        );

    }, 250);


    // =================================================
    // 4. TV LINE
    // =================================================

    setTimeout(() => {

        line.classList.add(
            'is-active'
        );

    }, 600);


    // =================================================
    // 5. CRT УХОДИТ
    //
    // Видео уже проигрывается.
    // Поэтому начало не тормозит.
    // =================================================

    setTimeout(() => {

        line.classList.remove(
            'is-active'
        );

        line.classList.add(
            'is-fading'
        );


        crt.classList.remove(
            'is-active'
        );

        crt.classList.add(
            'is-fading'
        );


        vignette.classList.remove(
            'is-active'
        );

        vignette.classList.add(
            'is-fading'
        );


        video.classList.add(
            'is-visible'
        );


        // Кнопки появляются немного позже,
        // чтобы не мешать самому началу видео.

        setTimeout(() => {

            controls.classList.add(
                'is-visible'
            );

        }, 1000);

    }, 1800);


    // =================================================
    // 6. CHICKEN GUN TOP
    // =================================================

    topButton.addEventListener(
        'click',
        () => {

            chickenGunEffect(
                overlay,
                hit
            );

        }
    );


    // =================================================
    // 7. CLOSE
    // =================================================

    closeButton.addEventListener(
        'click',
        () => {

            closeSecondEasterEgg(
                overlay,
                video,
                blackout
            );

        }
    );


    // =================================================
    // 8. VIDEO ENDED
    // =================================================

    video.addEventListener(
        'ended',
        () => {

            closeSecondEasterEgg(
                overlay,
                video,
                blackout
            );

        },
        { once: true }
    );


    // =================================================
    // 9. VIDEO ERROR
    // =================================================

    video.addEventListener(
        'error',
        () => {

            console.error(
                'Easter Egg 2: ошибка загрузки видео.'
            );

            closeSecondEasterEgg(
                overlay,
                video,
                blackout
            );

        },
        { once: true }
    );
}


// =====================================================
// CLOSE
// =====================================================

function closeSecondEasterEgg(
    overlay,
    video,
    blackout
) {

    if (
        !overlay ||
        !document.body.contains(overlay)
    ) {

        cleanup();

        return;
    }


    // =================================================
    // 1. Скрываем кнопки
    // =================================================

    const controls =
        overlay.querySelector(
            '.easter-egg-2-controls'
        );

    if (controls) {

        controls.classList.remove(
            'is-visible'
        );
    }


    // =================================================
    // 2. Видео плавно исчезает
    // =================================================

    video.classList.remove(
        'is-visible'
    );

    video.classList.add(
        'is-hiding'
    );


    // =================================================
    // 3. Переходим в полный чёрный
    // =================================================

    setTimeout(() => {

        blackout.classList.add(
            'is-active'
        );

    }, 400);


    // =================================================
    // 4. Чёрный экран исчезает
    // =================================================

    setTimeout(() => {

        overlay.classList.remove(
            'is-visible'
        );


        setTimeout(() => {

            cleanup();

        }, 1250);

    }, 1800);
}


// =====================================================
// CLEANUP
// =====================================================

function cleanup() {

    const overlay =
        document.getElementById(
            'easter-egg-2-overlay'
        );


    if (overlay) {

        const video =
            overlay.querySelector(
                '#easter-egg-2-video'
            );


        if (video) {

            video.pause();

            video.removeAttribute(
                'src'
            );

            video.load();
        }


        overlay.remove();
    }


    isPlaying = false;

    logoTaps = 0;
}


// =====================================================
// NAVIGATION RESET
// =====================================================

function initNavigationReset() {

    const navItems =
        document.querySelectorAll(
            '[data-page], .app-nav-item, .app-bottom-nav button'
        );


    navItems.forEach(item => {

        item.addEventListener(
            'click',
            () => {

                resetTapCounter();

            }
        );

    });
}


// =====================================================
// INIT
// =====================================================

function initSecondEasterEgg() {

    injectStyles();


    const logo =
        document.querySelector(
            '.logo'
        );


    if (!logo) {

        console.warn(
            'Easter Egg 2: .logo не найден.'
        );

        return;
    }


    logo.addEventListener(
        'click',
        handleLogoTap
    );


    initNavigationReset();


    console.log(
        'Easter Egg 2 активирован.'
    );
}


// =====================================================
// START
// =====================================================

if (
    document.readyState === 'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initSecondEasterEgg
    );

} else {

    initSecondEasterEgg();
}