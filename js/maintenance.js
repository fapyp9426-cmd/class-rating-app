// ===================== ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ =====================

export const MAINTENANCE_MODE = true;

// Только: '1H', '2H', '3H'
export const MAINTENANCE_DURATION = '2H';


// ===================== СОЗДАНИЕ ЭКРАНА =====================

function createMaintenanceScreen() {

  if (document.getElementById('maintenance-screen')) {
    return;
  }

  const screen = document.createElement('div');

  screen.id = 'maintenance-screen';

  screen.innerHTML = `

    <div class="maintenance-stripes"></div>
    <div class="maintenance-overlay"></div>

    <div class="maintenance-content">

      <div class="maintenance-icon">
        ⚠
      </div>

      <div class="maintenance-title">
        Техническое обслуживание
      </div>

      <div class="maintenance-description">
        Сайт временно недоступен.
        <br>
        На сайте очень большая ошибка, которая ломает профили,
        поэтому сайт временно недоступен!
      </div>

      <div class="maintenance-time-label">
        Примерное время окончания
      </div>

      <div class="maintenance-countdown">
        ${getDurationText()}
      </div>

      <div class="maintenance-actions">

        <button
          id="maintenance-dino"
          class="maintenance-dino"
          type="button"
        >
          🦖 Dino
        </button>

        <button
          id="maintenance-reload"
          class="maintenance-reload"
          type="button"
        >
          ↻ Перезагрузить сайт
        </button>

      </div>

    </div>

    <!-- ===================== DINO GAME ===================== -->

    <div
      id="maintenance-dino-screen"
      class="maintenance-dino-screen"
    >

      <div class="dino-game-background"></div>

      <div class="dino-game-header">

        <div>
          <div class="dino-game-label">
            ТЕХНИЧЕСКИЙ ПЕРЕРЫВ
          </div>

          <div class="dino-game-title">
            Dino Run
          </div>
        </div>

        <button
          id="maintenance-dino-close"
          class="dino-close"
          type="button"
        >
          ×
        </button>

      </div>

      <div class="dino-hud">

        <div class="dino-score-box">
          SCORE
          <strong id="dino-score">00000</strong>
        </div>

        <div class="dino-score-box">
          BEST
          <strong id="dino-best">00000</strong>
        </div>

        <div class="dino-score-box">
          COMBO
          <strong id="dino-combo">x0</strong>
        </div>

      </div>

      <div class="dino-game-area">

        <canvas
          id="dino-canvas"
          width="1100"
          height="420"
        ></canvas>

        <div
          id="dino-start-message"
          class="dino-start-message"
        >
          <div class="dino-start-icon">🦖</div>
          <div>Нажми ПРОБЕЛ, чтобы начать</div>
          <span>Прыжок · двойной прыжок · монетки</span>
        </div>

        <div
          id="dino-game-over"
          class="dino-game-over hidden"
        >
          <div>ИГРА ОКОНЧЕНА</div>

          <strong id="dino-final-score">
            00000
          </strong>

          <button
            id="dino-restart"
            type="button"
          >
            Играть ещё
          </button>
        </div>

      </div>

      <div class="dino-controls">

        <button
          id="dino-jump"
          type="button"
        >
          ↑ ПРЫЖОК
        </button>

        <button
          id="dino-shield"
          type="button"
        >
          🛡 ЩИТ
        </button>

      </div>

      <div class="dino-help">
        SPACE / ↑ — прыжок · второй раз — двойной прыжок
        · собирай монетки · избегай кактусов и птиц
      </div>

    </div>

  `;

  document.body.appendChild(screen);

  document.body.style.overflow = 'hidden';

  setupMaintenanceButtons();
  setupDinoGame();
}


// ===================== КНОПКИ =====================

function setupMaintenanceButtons() {

  const reloadButton =
    document.getElementById(
      'maintenance-reload'
    );

  reloadButton?.addEventListener(
    'click',
    () => {
      window.location.reload();
    }
  );


  const dinoButton =
    document.getElementById(
      'maintenance-dino'
    );

  const dinoScreen =
    document.getElementById(
      'maintenance-dino-screen'
    );


  dinoButton?.addEventListener(
    'click',
    () => {

      dinoScreen.classList.add(
        'is-open'
      );

      document.body.style.overflow =
        'hidden';

      window.setTimeout(() => {
        startDinoGame();
      }, 350);

    }
  );


  const closeButton =
    document.getElementById(
      'maintenance-dino-close'
    );

  closeButton?.addEventListener(
    'click',
    () => {

      dinoScreen.classList.remove(
        'is-open'
      );

      stopDinoGame();

    }
  );
}


// ===================== ВРЕМЯ =====================

function getDurationText() {

  switch (MAINTENANCE_DURATION) {

    case '1H':
      return '≈ 1 час';

    case '2H':
      return '≈ 2 часа';

    case '3H':
      return '≈ 3 часа';

    default:
      return '≈ 2 часа';

  }

}


// =====================================================
// DINO GAME
// =====================================================

let dinoAnimationFrame = null;
let dinoRunning = false;
let dinoStarted = false;

let dinoLastTime = 0;
let dinoScore = 0;
let dinoBest = 0;
let dinoCombo = 0;

let dinoSpeed = 430;
let dinoObstacleTimer = 0;
let dinoCoinTimer = 0;

let dinoObstacles = [];
let dinoCoins = [];
let dinoParticles = [];

let dino = {
  x: 120,
  y: 0,
  width: 54,
  height: 58,
  velocityY: 0,
  jumps: 0,
  shield: false
};


function setupDinoGame() {

  const canvas =
    document.getElementById(
      'dino-canvas'
    );

  if (!canvas) return;

  const jumpButton =
    document.getElementById(
      'dino-jump'
    );

  const shieldButton =
    document.getElementById(
      'dino-shield'
    );

  const restartButton =
    document.getElementById(
      'dino-restart'
    );


  jumpButton?.addEventListener(
    'click',
    dinoJump
  );

  shieldButton?.addEventListener(
    'click',
    activateDinoShield
  );

  restartButton?.addEventListener(
    'click',
    () => {
      startDinoGame();
    }
  );


  window.addEventListener(
    'keydown',
    handleDinoKeyboard
  );

  canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  dinoJump();
});


  const context =
    canvas.getContext('2d');

  if (!context) return;

  drawDinoScene(
    context,
    canvas
  );
}


function handleDinoKeyboard(event) {

  const screen =
    document.getElementById(
      'maintenance-dino-screen'
    );

  if (
    !screen ||
    !screen.classList.contains('is-open')
  ) {
    return;
  }

  if (
    event.code === 'Space' ||
    event.code === 'ArrowUp'
  ) {

    event.preventDefault();

    dinoJump();

  }


  if (
    event.code === 'KeyS'
  ) {

    activateDinoShield();

  }
}


function startDinoGame() {

  const canvas =
    document.getElementById(
      'dino-canvas'
    );

  if (!canvas) return;

  const gameOver =
    document.getElementById(
      'dino-game-over'
    );

  const startMessage =
    document.getElementById(
      'dino-start-message'
    );


  dinoRunning = true;
  dinoStarted = true;

  dinoScore = 0;
  dinoCombo = 0;

  dinoSpeed = 430;

  dinoObstacleTimer = 0.8;
  dinoCoinTimer = 1.2;

  dinoObstacles = [];
  dinoCoins = [];
  dinoParticles = [];


  dino.y =
    canvas.height - 82;

  dino.velocityY = 0;
  dino.jumps = 0;
  dino.shield = false;


  gameOver?.classList.add(
    'hidden'
  );

  startMessage?.classList.add(
    'hidden'
  );


  updateDinoHUD();


  dinoLastTime =
    performance.now();

  cancelAnimationFrame(
    dinoAnimationFrame
  );

  dinoAnimationFrame =
    requestAnimationFrame(
      dinoLoop
    );
}


function stopDinoGame() {

  dinoRunning = false;

  cancelAnimationFrame(
    dinoAnimationFrame
  );

  dinoAnimationFrame = null;
}


function dinoJump() {

  if (!dinoStarted) {

    startDinoGame();

    return;

  }

  if (!dinoRunning) {

    startDinoGame();

    return;

  }


  if (dino.jumps >= 2) {
    return;
  }


  dino.velocityY =
    dino.jumps === 0
      ? -760
      : -640;

  dino.jumps++;

  createDinoParticles(
    dino.x + 20,
    dino.y + dino.height,
    5
  );
}


function activateDinoShield() {

  if (!dinoRunning) return;

  dino.shield = true;

  updateDinoHUD();

}


function dinoLoop(time) {

  if (!dinoRunning) {
    return;
  }

  const delta =
    Math.min(
      0.032,
      (time - dinoLastTime) / 1000
    );

  dinoLastTime = time;


  updateDino(delta);

  drawDino();


  dinoAnimationFrame =
    requestAnimationFrame(
      dinoLoop
    );
}


function updateDino(delta) {

  const canvas =
    document.getElementById(
      'dino-canvas'
    );

  if (!canvas) return;


  dinoScore +=
    delta * dinoSpeed * 0.045;

  dinoSpeed +=
    delta * 5;


  dino.velocityY +=
    1900 * delta;

  dino.y +=
    dino.velocityY * delta;


  const ground =
    canvas.height - 82;


  if (dino.y >= ground) {

    dino.y = ground;

    dino.velocityY = 0;

    dino.jumps = 0;

  }


  dinoObstacleTimer -=
    delta;

  if (dinoObstacleTimer <= 0) {

    createDinoObstacle();

    dinoObstacleTimer =
      0.85 +
      Math.random() * 0.8 -
      Math.min(
        0.25,
        dinoScore / 3000
      );

  }


  dinoCoinTimer -=
    delta;

  if (dinoCoinTimer <= 0) {

    createDinoCoin();

    dinoCoinTimer =
      0.9 +
      Math.random() * 1.3;

  }


  for (
    const obstacle of dinoObstacles
  ) {

    obstacle.x -=
      dinoSpeed * delta;

  }


  for (
    const coin of dinoCoins
  ) {

    coin.x -=
      dinoSpeed * delta;

  }


  checkDinoCollisions();


  dinoObstacles =
    dinoObstacles.filter(
      obstacle =>
        obstacle.x > -100
    );


  dinoCoins =
    dinoCoins.filter(
      coin =>
        coin.x > -50
    );


  for (
    const particle of dinoParticles
  ) {

    particle.x +=
      particle.velocityX * delta;

    particle.y +=
      particle.velocityY * delta;

    particle.life -=
      delta;

  }


  dinoParticles =
    dinoParticles.filter(
      particle =>
        particle.life > 0
    );


  updateDinoHUD();

}


function createDinoObstacle() {

  const canvas =
    document.getElementById(
      'dino-canvas'
    );

  if (!canvas) return;


  const flying =
    dinoScore > 180 &&
    Math.random() < 0.25;


  dinoObstacles.push({

    x: canvas.width + 40,

    y:
      flying
        ? canvas.height - 190
        : canvas.height - 105,

    width:
      flying
        ? 58
        : 38,

    height:
      flying
        ? 30
        : 55,

    type:
      flying
        ? 'bird'
        : 'cactus'

  });

}


function createDinoCoin() {

  const canvas =
    document.getElementById(
      'dino-canvas'
    );

  if (!canvas) return;


  dinoCoins.push({

    x: canvas.width + 30,

    y:
      canvas.height -
      150 -
      Math.random() * 100,

    radius: 11

  });

}


function checkDinoCollisions() {

  const player = {

    x:
      dino.x + 8,

    y:
      dino.y + 7,

    width:
      dino.width - 16,

    height:
      dino.height - 10

  };


  for (
    const obstacle of dinoObstacles
  ) {

    if (
      isDinoCollision(
        player,
        obstacle
      )
    ) {

      if (dino.shield) {

        dino.shield = false;

        dinoCombo = 0;

        createDinoParticles(
          obstacle.x,
          obstacle.y,
          18
        );

        obstacle.x = -200;

      } else {

        finishDinoGame();

        return;

      }

    }

  }


  for (
    const coin of dinoCoins
  ) {

    const dx =
      player.x +
      player.width / 2 -
      coin.x;

    const dy =
      player.y +
      player.height / 2 -
      coin.y;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (distance < 32) {

      dinoScore += 50;

      dinoCombo++;

      createDinoParticles(
        coin.x,
        coin.y,
        10
      );

      coin.x = -100;

    }

  }

}


function isDinoCollision(
  a,
  b
) {

  return (
    a.x <
      b.x + b.width &&
    a.x + a.width >
      b.x &&
    a.y <
      b.y + b.height &&
    a.y + a.height >
      b.y
  );

}


function finishDinoGame() {

  dinoRunning = false;

  dinoBest =
    Math.max(
      dinoBest,
      Math.floor(dinoScore)
    );


  const finalScore =
    document.getElementById(
      'dino-final-score'
    );

  const gameOver =
    document.getElementById(
      'dino-game-over'
    );


  if (finalScore) {

    finalScore.textContent =
      String(
        Math.floor(dinoScore)
      ).padStart(
        5,
        '0'
      );

  }


  gameOver?.classList.remove(
    'hidden'
  );

  updateDinoHUD();

}


function updateDinoHUD() {

  const score =
    document.getElementById(
      'dino-score'
    );

  const best =
    document.getElementById(
      'dino-best'
    );

  const combo =
    document.getElementById(
      'dino-combo'
    );


  if (score) {

    score.textContent =
      String(
        Math.floor(dinoScore)
      ).padStart(
        5,
        '0'
      );

  }


  if (best) {

    best.textContent =
      String(
        Math.floor(dinoBest)
      ).padStart(
        5,
        '0'
      );

  }


  if (combo) {

    combo.textContent =
      `x${dinoCombo}`;

  }

}


function createDinoParticles(
  x,
  y,
  amount
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    dinoParticles.push({

      x,

      y,

      velocityX:
        (Math.random() - 0.5) *
        260,

      velocityY:
        (Math.random() - 0.5) *
        260,

      life:
        0.5 +
        Math.random() * 0.5

    });

  }

}


function drawDino() {

  const canvas =
    document.getElementById(
      'dino-canvas'
    );

  const context =
    canvas?.getContext(
      '2d'
    );

  if (
    !canvas ||
    !context
  ) {
    return;
  }


  drawDinoScene(
    context,
    canvas
  );


  // Земля
  context.fillStyle =
    '#fbbf24';

  context.fillRect(
    0,
    canvas.height - 25,
    canvas.width,
    2
  );


  // Динозавр
  context.save();

  context.translate(
    dino.x,
    dino.y
  );


  if (dino.shield) {

    context.beginPath();

    context.arc(
      dino.width / 2,
      dino.height / 2,
      42,
      0,
      Math.PI * 2
    );

    context.strokeStyle =
      '#38bdf8';

    context.lineWidth = 4;

    context.shadowBlur = 25;
    context.shadowColor =
      '#38bdf8';

    context.stroke();

  }


  context.fillStyle =
    '#22c55e';

  context.fillRect(
    8,
    20,
    35,
    32
  );

  context.fillRect(
    30,
    5,
    24,
    28
  );


  context.fillStyle =
    '#0f172a';

  context.fillRect(
    45,
    11,
    5,
    5
  );


  context.fillStyle =
    '#16a34a';

  context.fillRect(
    12,
    49,
    8,
    15
  );

  context.fillRect(
    32,
    49,
    8,
    15
  );


  context.restore();


  // Препятствия
  for (
    const obstacle of dinoObstacles
  ) {

    if (
      obstacle.type === 'cactus'
    ) {

      context.fillStyle =
        '#ef4444';

      context.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      context.fillRect(
        obstacle.x - 10,
        obstacle.y + 20,
        12,
        8
      );

      context.fillRect(
        obstacle.x +
          obstacle.width -
          2,
        obstacle.y + 30,
        12,
        8
      );

    } else {

      context.fillStyle =
        '#a78bfa';

      context.fillRect(
        obstacle.x,
        obstacle.y + 8,
        45,
        15
      );

      context.fillRect(
        obstacle.x + 30,
        obstacle.y,
        20,
        10
      );

    }

  }


  // Монетки
  for (
    const coin of dinoCoins
  ) {

    context.beginPath();

    context.arc(
      coin.x,
      coin.y,
      coin.radius,
      0,
      Math.PI * 2
    );

    context.fillStyle =
      '#fbbf24';

    context.shadowBlur = 18;

    context.shadowColor =
      '#fbbf24';

    context.fill();

    context.shadowBlur = 0;

  }


  // Частицы
  for (
    const particle of dinoParticles
  ) {

    context.globalAlpha =
      Math.max(
        0,
        particle.life
      );

    context.fillStyle =
      '#fbbf24';

    context.fillRect(
      particle.x,
      particle.y,
      4,
      4
    );

  }

  context.globalAlpha = 1;

}


function drawDinoScene(
  context,
  canvas
) {

  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

  gradient.addColorStop(
    0,
    '#111827'
  );

  gradient.addColorStop(
    1,
    '#070b12'
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // Луна
  context.beginPath();

  context.arc(
    canvas.width - 120,
    75,
    34,
    0,
    Math.PI * 2
  );

  context.fillStyle =
    '#fbbf24';

  context.globalAlpha =
    0.85;

  context.fill();

  context.globalAlpha =
    1;


  // Звёзды
  context.fillStyle =
    'rgba(255,255,255,.55)';

  for (
    let i = 0;
    i < 40;
    i++
  ) {

    const sx =
      (i * 137) %
      canvas.width;

    const sy =
      (i * 71) %
      180;

    context.fillRect(
      sx,
      sy,
      2,
      2
    );

  }

}


// ===================== ГЛАВНАЯ ФУНКЦИЯ =====================

export function initMaintenance() {

  if (!MAINTENANCE_MODE) {
    return;
  }

  if (document.body) {

    createMaintenanceScreen();

    return;

  }

  document.addEventListener(
    'DOMContentLoaded',
    createMaintenanceScreen,
    { once: true }
  );

}