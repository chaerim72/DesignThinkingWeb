// ====================================================
// Game 3 : 분리수거 실패 현장 (일단 올려 코어 엔진)
// ====================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const trashUpBgmUrl = "../assets/sounds/SellBuyMusic - 니아.mp3";

const screens = {
  start: document.getElementById("start-screen"),
  gameover: document.getElementById("game-over-screen"),
  pause: document.getElementById("pause-screen"),
  hud: document.getElementById("hud"),
};

let state = "START",
  score = 0,
  cameraY = 0,
  stack = [],
  currentTrash = null,
  animationId = null;
let isCollapsing = false,
  collapseAngle = 0,
  collapseSpeed = 0,
  collapseDir = 1;

const baseHeight = 90,
  baseY = 650 - baseHeight / 2,
  baseWidth = 140;
const trashDefs = [
  // {
  //   key: "tissue",
  //   id: "img-tissue",
  //   name: "휴지",
  //   w: 65,
  //   h: 65,
  //   weight: 0.6,
  //   color: "#e8e8e8",
  // },
  {
    key: "chopsticks",
    id: "img-chopsticks",
    name: "젓가락",
    w: 200,
    h: 35,
    weight: 0.5,
    // color: "#eadaa6",
  },
  {
    key: "butt",
    id: "img-butt",
    name: "꽁초",
    w: 24,
    h: 90,
    weight: 0.4,
    // color: "#ffb366",
  },
  {
    key: "card",
    id: "img-card",
    name: "명함",
    w: 90,
    h: 60,
    weight: 0.5,
    // color: "#444444",
  },
  {
    key: "snack",
    id: "img-snack",
    name: "라면땅",
    w: 85,
    h: 90,
    weight: 1.0,
    // color: "#ffcc66",
  },
  {
    key: "cundition",
    id: "img-cundition",
    name: "컨디션",
    w: 50,
    h: 110,
    weight: 1.2,
    // color: "#3366cc",
  },
  {
    key: "welchs",
    id: "img-welchs",
    name: "웰치스",
    w: 70,
    h: 115,
    weight: 1.3,
    // color: "#663399",
  },
  {
    key: "bottle",
    id: "img-bottle",
    name: "플라스틱병",
    w: 170,
    h: 75,
    weight: 0.8,
    // color: "#e6f7ff",
  },
];

// 이미지 로딩 체크 모니터링 센서
// function checkImages() {
//   let loaded = trashDefs.filter((d) => {
//     const img = document.getElementById(d.id);
//     return img && img.complete && img.naturalWidth !== 0;
//   }).length;

//   const loadingTextEl = document.getElementById("loading-text");
//   if (loadingTextEl) {
//     loadingTextEl.innerHTML =
//       loaded < trashDefs.length
//         ? `로딩 중... (${loaded}/${trashDefs.length})`
//         : "[ 클릭하여 게임 시작하기 ]";
//   }
//   if (loaded < trashDefs.length) setTimeout(checkImages, 200);
// }
// setTimeout(checkImages, 100);
// setTimeout(() => {
//   const loadingTextEl = document.getElementById("loading-text");
//   if (loadingTextEl) loadingTextEl.innerHTML = "[ 클릭하여 게임 시작하기 ]";
// }, 2500);

function init() {
  score = 0;
  cameraY = 0;
  isCollapsing = false;
  collapseAngle = 0;
  collapseSpeed = 0;
  updateScore();
  stack = [
    {
      x: canvas.width / 2,
      y: baseY,
      w: baseWidth,
      h: baseHeight,
      angle: 0,
      type: "base",
      weight: 25.0,
    },
  ];
  spawnTrash();
}

function spawnTrash() {
  if (isCollapsing) return;
  const def = trashDefs[Math.floor(Math.random() * trashDefs.length)];
  const scale = Math.max(0.45, 1 - score / 4500);
  currentTrash = {
    x: canvas.width / 2,
    y: stack[stack.length - 1].y - 200,
    w: def.w * scale,
    h: def.h * scale,
    angle: 0,
    type: def.key,
    name: def.name,
    imgId: def.id,
    color: def.color,
    weight: def.weight * scale,
    vx: 3.5 + score / 450,
    vy: 0,
    isFalling: false,
    direction: 1,
  };
}

function getTowerCOG() {
  let tw = 0,
    tx = 0;
  for (let i = 1; i < stack.length; i++) {
    tw += stack[i].weight;
    tx += stack[i].x * stack[i].weight;
  }
  return tw === 0 ? canvas.width / 2 : tx / tw;
}

function update() {
  if (state !== "PLAYING") return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cameraY +=
    ((stack[stack.length - 1].y < 350 ? 350 - stack[stack.length - 1].y : 0) -
      cameraY) *
    0.1;

  if (isCollapsing) {
    collapseSpeed += 0.004;
    collapseAngle += collapseSpeed * collapseDir;
    ctx.save();
    ctx.translate(stack[0].x, stack[0].y + cameraY);
    ctx.rotate(collapseAngle);
    ctx.translate(-stack[0].x, -(stack[0].y + cameraY));
    stack.forEach(drawTrash);
    ctx.restore();
    if (Math.abs(collapseAngle) > 1.1) return gameOver();
  } else {
    stack.forEach(drawTrash);
    if (currentTrash) {
      if (!currentTrash.isFalling) {
        currentTrash.x += currentTrash.vx * currentTrash.direction;
        if (
          currentTrash.x - currentTrash.w / 2 <= 0 ||
          currentTrash.x + currentTrash.w / 2 >= canvas.width
        )
          currentTrash.direction *= -1;
      } else {
        currentTrash.vy += 0.75;
        currentTrash.y += currentTrash.vy;
        const top = stack[stack.length - 1];
        if (currentTrash.y + currentTrash.h / 2 >= top.y - top.h / 2) {
          const diff =
            Math.min(currentTrash.x + currentTrash.w / 2, top.x + top.w / 2) -
            Math.max(currentTrash.x - currentTrash.w / 2, top.x - top.w / 2);
          if (diff > 12) {
            currentTrash.y = top.y - top.h / 2 - currentTrash.h / 2;
            currentTrash.isFalling = false;
            currentTrash.angle = (currentTrash.x - top.x) * 0.002;
            stack.push(currentTrash);

            if (window.AudioManager) {
              AudioManager.playSfx("stack");
            }

            score += 100;
            updateScore();
            
            const cog = getTowerCOG();
            if (
              cog < stack[0].x - stack[0].w / 3 ||
              cog > stack[0].x + stack[0].w / 3
            ) {
              isCollapsing = true;
              collapseDir = cog < stack[0].x ? -1 : 1;
              currentTrash = null;
            } else spawnTrash();
          }
        }
      }
      if (
        currentTrash &&
        currentTrash.y - currentTrash.h / 2 > canvas.height - cameraY
      )
        return gameOver();
      if (currentTrash) drawTrash(currentTrash);
    }
  }
  animationId = requestAnimationFrame(update);
}

function drawStartPreview() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stack.forEach(drawTrash);

  if (currentTrash) {
    drawTrash(currentTrash);
  }
}

function drawTrash(item) {
  ctx.save();
  ctx.translate(item.x, item.y + cameraY);
  ctx.rotate(item.angle);
  const x = -item.w / 2,
    y = -item.h / 2;
  if (item.type === "base") {
    ctx.fillStyle = "#9aa7b4";
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x + 22, y + item.h / 2);
    ctx.lineTo(x + item.w - 22, y + item.h / 2);
    ctx.lineTo(x + item.w - 10, y - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7a8694";
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 22, item.w + 10, 16, 4);
    ctx.fill();
    ctx.stroke();
  } else {
    const img = document.getElementById(item.imgId);
    if (img && img.complete && img.naturalWidth !== 0)
      ctx.drawImage(img, x, y, item.w, item.h);
    else {
      ctx.fillStyle = item.color;
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, item.w, item.h, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = item.color === "#444444" ? "#fff" : "#111";
      ctx.font = "bold 12px Noto Sans KR";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, 0, 0);
    }
  }
  ctx.restore();
}

function updateScore() {
  document.getElementById("score-text").innerText =
    `Score: ${String(score).padStart(6, "0")}`;
}

function switchState(s) {
  state = s;
  Object.keys(screens).forEach((k) => {
    if (screens[k]) screens[k].style.display = "none";
  });
}

function startGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  switchState("PLAYING");

  if (screens.hud) {
    screens.hud.style.display = "flex";
  }

  if (window.AudioManager) {
    AudioManager.playBgm(trashUpBgmUrl);
  }

  init();
  update();
}

function gameOver() {
  switchState("GAMEOVER");
  cancelAnimationFrame(animationId);

  if (window.AudioManager) {
    AudioManager.playSfx("gameover");
    AudioManager.pauseBgm();
  }

  document.getElementById("final-score").innerText =
    `Score: ${String(score).padStart(6, "0")}`;

  if (screens.gameover) {
    screens.gameover.style.display = "flex";
  }
}

function togglePause() {
  if (state === "PLAYING") {
    switchState("PAUSED");
    cancelAnimationFrame(animationId);

    if (window.AudioManager) {
      AudioManager.pauseBgm();
    }

    if (screens.pause) {
      screens.pause.style.display = "flex";
    }
  } else if (state === "PAUSED") {
    switchState("PLAYING");

    if (screens.hud) {
      screens.hud.style.display = "flex";
    }

    if (window.AudioManager) {
      AudioManager.playBgm(trashUpBgmUrl);
    }

    update();
  }
}

// document.getElementById("start-btn").addEventListener("click", (e) => {
//   e.stopPropagation();
//   startGame();
// });
const gameContainer = document.getElementById("game-container");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const pauseBtn = document.getElementById("pause-btn");
const soundBtn = document.getElementById("sound-btn");

function updateSoundIcon() {
  if (!soundBtn) return;

  soundBtn.textContent =
    window.AudioManager && AudioManager.isMuted()
      ? "🔇"
      : "🔊";
}

if (soundBtn) {
  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (window.AudioManager) {
      AudioManager.toggleMute();
      updateSoundIcon();
    }
  });
}

function restartGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  switchState("PLAYING");

  if (screens.hud) {
    screens.hud.style.display = "flex";
  }

  if (window.AudioManager) {
    AudioManager.playBgm(trashUpBgmUrl);
  }

  init();
  update();
}

function handleGameClick(e) {
  if (e.target.tagName && e.target.tagName.toLowerCase() === "button") return;
  if (e.target.id === "pause-btn") return;

  if (state === "START") {
    startGame();
    return;
  }

  if (
    state === "PLAYING" &&
    currentTrash &&
    !currentTrash.isFalling &&
    !isCollapsing
  ) {
    currentTrash.isFalling = true;
    return;
  }

  if (state === "GAMEOVER") {
    restartGame();
  }
}

if (gameContainer) {
  gameContainer.addEventListener("mousedown", handleGameClick);
}

if (screens.start) {
  screens.start.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    if (state === "START") {
      startGame();
    }
  });
}

if (screens.pause) {
  screens.pause.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    if (state === "PAUSED") {
      if (window.AudioManager) {
        AudioManager.playButtonSfx();
      }

      togglePause();
    }
  });
}

if (screens.gameover) {
  screens.gameover.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    if (state === "GAMEOVER") {
      restartGame();
    }
  });
}

if (resumeBtn) {
  resumeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePause();
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    restartGame();
  });
}

if (pauseBtn) {
  pauseBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (window.AudioManager) {
      AudioManager.playButtonSfx();
    }

    togglePause();
  });
}

// window.addEventListener("keydown", (e) => {
//   if (e.code === "Space" || e.key === " " || e.keyCode === 32) {
//     e.preventDefault();
//     if (state === "START") startGame();
//     else if (
//       state === "PLAYING" &&
//       currentTrash &&
//       !currentTrash.isFalling &&
//       !isCollapsing
//     )
//       currentTrash.isFalling = true;
//     else if (state === "GAMEOVER") {
//       switchState("PLAYING");
//       if (screens.hud) screens.hud.style.display = "flex";
//       init();
//       update();
//     }
//   }
//   if (
//     (e.code === "KeyP" || e.code === "Escape") &&
//     (state === "PLAYING" || state === "PAUSED")
//   )
//     togglePause();
// });
init();
drawStartPreview();
updateSoundIcon();

if (screens.start) {
  screens.start.style.display = "flex";
}

if (screens.pause) {
  screens.pause.style.display = "none";
}

if (screens.gameover) {
  screens.gameover.style.display = "none";
}

if (screens.hud) {
  screens.hud.style.display = "none";
}