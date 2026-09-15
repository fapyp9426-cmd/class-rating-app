
// ===============================
// EASTER EGG
// ===============================

const SECRET_CODE = "ChickenGun228Top!!!";

const VIDEO_SRC = "./assets/easter-egg.mp4";
const ENTER_SOUND_SRC = "./assets/easter-enter.mp3";
const FLASH_SOUND_SRC = "./assets/easter-flash.mp3";

let easterEggOpen = false;


// ===============================
// CSS
// ===============================

function injectStyles() {

    if (document.getElementById("easter-egg-styles")) return;

    const style = document.createElement("style");

    style.id = "easter-egg-styles";

    style.textContent = `

        /* ===============================
           OVERLAY
           =============================== */

        #easter-egg-overlay {
            position: fixed;
            inset: 0;

            background: #000;

            z-index: 999999;

            overflow: hidden;
        }


        /* ===============================
           VIDEO
           =============================== */

        #easter-egg-video {
            position: absolute;
            inset: 0;

            width: 100%;
            height: 100%;

            object-fit: contain;

            opacity: 0;

            transform: scale(1.025);

            transition:
                opacity 1.7s ease,
                transform 2s ease;

            pointer-events: none;

            z-index: 1;
        }

        #easter-egg-video.video-visible {
            opacity: 1;
            transform: scale(1);
        }


        /* ===============================
           EXIT BUTTON
           =============================== */

        #easter-egg-exit {

            position: absolute;

            top: 28px;
            right: 30px;

            width: 44px;
            height: 44px;

            border: none;
            border-radius: 50%;

            background: rgba(255,255,255,.92);

            color: #111;

            font-size: 23px;
            font-weight: 700;

            cursor: pointer;

            opacity: 0;

            transform: scale(.8);

            transition:
                opacity .45s ease,
                transform .45s ease;

            z-index: 20;
        }

        #easter-egg-exit:hover {
            background: #fff;
            transform: scale(1.08);
        }

        #easter-egg-overlay.controls-visible
        #easter-egg-exit {

            opacity: 1;

            transform: scale(1);
        }


        /* ===============================
           FIRE BUTTON
           =============================== */

        #easter-egg-fire {

            position: absolute;

            left: 65px;
            bottom: 75px;

            width: 82px;
            height: 82px;

            border: none;
            border-radius: 50%;

            background: #fff;

            color: #111;

            font-size: 34px;

            cursor: pointer;

            opacity: 0;

            transform:
                rotate(-7deg)
                scale(.75);

            transition:
                opacity .45s ease,
                transform .25s ease;

            box-shadow:
                0 10px 35px rgba(0,0,0,.35);

            user-select: none;

            z-index: 20;
        }

        #easter-egg-overlay.controls-visible
        #easter-egg-fire {

            opacity: 1;

            transform:
                rotate(-7deg)
                scale(1);
        }

        #easter-egg-fire:hover {

            transform:
                rotate(-7deg)
                scale(1.08);
        }

        #easter-egg-fire.fire-click {

            animation:
                easterFireButton
                .35s ease;
        }

        @keyframes easterFireButton {

            0% {
                transform:
                    rotate(-7deg)
                    scale(1);
            }

            40% {
                transform:
                    rotate(-7deg)
                    scale(.82);
            }

            70% {
                transform:
                    rotate(-7deg)
                    scale(1.13);
            }

            100% {
                transform:
                    rotate(-7deg)
                    scale(1);
            }
        }


        /* ===============================
           FIRE PARTICLES
           =============================== */

        .easter-fire-particle {

            position: fixed;

            left: 0;
            top: 0;

            width: auto;
            height: auto;

            pointer-events: none;

            font-size: 20px;

            line-height: 1;

            z-index: 100;

            transform:
                translate(-50%, -50%);

            animation:
                easterParticleFly
                var(--particle-duration)
                cubic-bezier(.18,.72,.32,1)
                forwards;
        }

        @keyframes easterParticleFly {

            0% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    translate(0, 0)
                    scale(1)
                    rotate(0deg);
            }

            25% {

                opacity: 1;
            }

            100% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    translate(
                        var(--particle-x),
                        var(--particle-y)
                    )
                    scale(.25)
                    rotate(var(--particle-rotate));
            }
        }


        /* ===============================
           WHITE FLASH
           =============================== */

        #easter-egg-flash {

            position: fixed;

            inset: 0;

            background: #fff;

            z-index: 2000000;

            opacity: 0;

            pointer-events: none;
        }

        /*
            ВАЖНО:

            0%   = моментально белый экран
            8%   = всё ещё белый
            100% = полностью исчез
        */

        #easter-egg-flash.flash-active {

            animation:
                easterWhiteFlash
                2.7s
                ease-out
                forwards;
        }

        @keyframes easterWhiteFlash {

            0% {
                opacity: 1;
            }

            8% {
                opacity: 1;
            }

            100% {
                opacity: 0;
            }
        }

    `;

    document.head.appendChild(style);
}


// ===============================
// SOUND
// ===============================

function playSound(src, volume = 1) {

    try {

        const audio = new Audio(src);

        audio.volume = volume;

        audio.currentTime = 0;

        /*
            Запускаем сразу.
        */

        const promise = audio.play();

        if (promise) {

            promise.catch(err => {

                console.warn(
                    "Не удалось воспроизвести звук:",
                    err
                );

            });
        }

        return audio;

    } catch (err) {

        console.warn(
            "Ошибка звука:",
            err
        );

        return null;
    }
}


// ===============================
// FIRE PARTICLES
// ===============================

function createFireParticles(button) {

    const rect =
        button.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;


    /*
        Делаем частицы внутри overlay,
        чтобы они гарантированно были
        поверх видео.
    */

    const overlay =
        document.getElementById(
            "easter-egg-overlay"
        );

    if (!overlay) return;


    const particleCount = 16;


    for (let i = 0; i < particleCount; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "easter-fire-particle";


        /*
            Немного разнообразия.
        */

        particle.textContent =
            Math.random() > .3
                ? "🔥"
                : "✨";


        /*
            Полный круг разлёта.
        */

        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            100 +
            Math.random() * 190;


        const x =
            Math.cos(angle) *
            distance;


        const y =
            Math.sin(angle) *
            distance;


        particle.style.left =
            `${centerX}px`;

        particle.style.top =
            `${centerY}px`;


        particle.style.setProperty(
            "--particle-x",
            `${x}px`
        );

        particle.style.setProperty(
            "--particle-y",
            `${y}px`
        );

        particle.style.setProperty(
            "--particle-rotate",
            `${-180 + Math.random() * 360}deg`
        );

        particle.style.setProperty(
            "--particle-duration",
            `${700 + Math.random() * 500}ms`
        );


        /*
            Теперь частица находится
            ВНУТРИ overlay и имеет z-index 100.
        */

        overlay.appendChild(
            particle
        );


        particle.addEventListener(
            "animationend",
            () => {

                particle.remove();

            },
            { once: true }
        );
    }
}


// ===============================
// FIRE BUTTON
// ===============================

function fireButtonEffect(button) {

    button.classList.remove(
        "fire-click"
    );

    /*
        Перезапускаем CSS animation.
    */

    void button.offsetWidth;

    button.classList.add(
        "fire-click"
    );


    createFireParticles(
        button
    );
}


// ===============================
// WHITE FLASH
// ===============================

function playWhiteFlash() {

    let flash =
        document.getElementById(
            "easter-egg-flash"
        );


    if (!flash) {

        flash =
            document.createElement("div");

        flash.id =
            "easter-egg-flash";

        document.body.appendChild(
            flash
        );
    }


    flash.classList.remove(
        "flash-active"
    );

    void flash.offsetWidth;


    /*
        БАХ!

        Моментально белый экран.
    */

    flash.classList.add(
        "flash-active"
    );


    /*
        После завершения анимации
        удаляем сам flash.
    */

    flash.addEventListener(
        "animationend",
        () => {

            flash.remove();

        },
        { once: true }
    );
}


// ===============================
// CLOSE
// ===============================

function closeEasterEgg() {

    if (!easterEggOpen) return;

    easterEggOpen = false;


    const overlay =
        document.getElementById(
            "easter-egg-overlay"
        );


    if (!overlay) return;


    const video =
        document.getElementById(
            "easter-egg-video"
        );


    /*
        Сначала останавливаем видео.
    */

    if (video) {

        video.pause();

        video.removeAttribute(
            "src"
        );

        video.load();
    }


    /*
        Звук завершения.
    */

    playSound(
        FLASH_SOUND_SRC,
        1
    );


    /*
        КРИТИЧЕСКИЙ ФИКС:

        УДАЛЯЕМ ЧЁРНЫЙ OVERLAY
        СРАЗУ.

        Поэтому после белой вспышки
        уже НЕ может появиться обратно
        чёрный экран и кнопки.
    */

    overlay.remove();


    /*
        И только теперь —
        белая вспышка поверх сайта.
    */

    playWhiteFlash();
}


// ===============================
// OPEN
// ===============================

function openEasterEgg() {

    if (easterEggOpen) return;

    easterEggOpen = true;


    injectStyles();


    /*
        Создаём затемнение СРАЗУ.
    */

    const overlay =
        document.createElement("div");

    overlay.id =
        "easter-egg-overlay";


    // ===============================
    // VIDEO
    // ===============================

    const video =
        document.createElement("video");

    video.id =
        "easter-egg-video";

    video.src =
        VIDEO_SRC;

    video.autoplay = true;

    video.playsInline = true;

    video.controls = false;

    video.disablePictureInPicture = true;

    video.setAttribute(
        "controlsList",
        "nodownload noplaybackrate"
    );


    video.addEventListener(
        "contextmenu",
        event => {
            event.preventDefault();
        }
    );


    video.addEventListener(
        "dblclick",
        event => {
            event.preventDefault();
        }
    );


    // ===============================
    // EXIT
    // ===============================

    const exitButton =
        document.createElement("button");

    exitButton.id =
        "easter-egg-exit";

    exitButton.type =
        "button";

    exitButton.textContent =
        "×";


    exitButton.addEventListener(
        "click",
        () => {

            closeEasterEgg();

        }
    );


    // ===============================
    // FIRE
    // ===============================

    const fireButton =
        document.createElement("button");

    fireButton.id =
        "easter-egg-fire";

    fireButton.type =
        "button";

    fireButton.textContent =
        "🔥";


    fireButton.addEventListener(
        "click",
        () => {

            fireButtonEffect(
                fireButton
            );

        }
    );


    // ===============================
    // BUILD
    // ===============================

    overlay.appendChild(
        video
    );

    overlay.appendChild(
        exitButton
    );

    overlay.appendChild(
        fireButton
    );


    document.body.appendChild(
        overlay
    );


    /*
        ВАЖНО:

        Звук запускается прямо здесь,
        сразу после появления чёрного экрана.
    */

    playSound(
        ENTER_SOUND_SRC,
        1
    );


    /*
        Запускаем видео.
    */

    video.play().catch(() => {});


    /*
        Первые 2 секунды —
        чистая темнота.
    */

    setTimeout(() => {

        if (!easterEggOpen) return;

        video.classList.add(
            "video-visible"
        );

    }, 2000);


    /*
        Кнопки появляются после
        появления видео.
    */

    setTimeout(() => {

        if (!easterEggOpen) return;

        overlay.classList.add(
            "controls-visible"
        );

    }, 2900);


    /*
        Видео закончилось.
    */

    video.addEventListener(
        "ended",
        () => {

            closeEasterEgg();

        },
        { once: true }
    );
}


// ===============================
// SECRET INPUT
// ===============================

function checkSecretInput(input) {

    if (!input) return;


    const value =
        input.value.trim();


    if (value !== SECRET_CODE) {
        return;
    }


    /*
        Сразу очищаем пароль.
    */

    input.value = "";


    /*
        И сразу запускаем пасхалку.
        Никакого Firebase.
    */

    openEasterEgg();
}


// ===============================
// INPUT LISTENERS
// ===============================

function initEasterEgg() {

    document.addEventListener(
        "input",
        event => {

            const target =
                event.target;


            if (
                !(target instanceof HTMLInputElement)
            ) {
                return;
            }


            checkSecretInput(
                target
            );
        }
    );


    /*
        Вставка пароля.
    */

    document.addEventListener(
        "paste",
        event => {

            const target =
                event.target;


            if (
                !(target instanceof HTMLInputElement)
            ) {
                return;
            }


            setTimeout(() => {

                checkSecretInput(
                    target
                );

            }, 0);
        }
    );
}


// ===============================
// START
// ===============================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initEasterEgg,
        { once: true }
    );

} else {

    initEasterEgg();
}