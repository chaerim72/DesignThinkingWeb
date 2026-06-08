const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

const trashCatchBgmUrl = "../assets/sounds/SellBuyMusic - 푸드 파이터.mp3";

const uiAreaHeight = 90;

// UI 아이콘 이미지 불러오기
const soundIconOnImage = new Image();
soundIconOnImage.src = "../assets/images/사운드 아이콘on.png";

const soundIconOffImage = new Image();
soundIconOffImage.src = "../assets/images/사운드 아이콘off.png";

const pauseIconImage = new Image();
pauseIconImage.src = "../assets/images/정지 아이콘.png";

const playIconImage = new Image();
playIconImage.src = "../assets/images/재생 아이콘.png";

let gameScore = 0;

let gameLives = 3;
const maxLives = 3;

function updateHeartsDisplay() {
  // 이제 목숨 표시는 캔버스의 drawTopGameUI()에서 직접 그림
}

let gameLevel = 1;

let isGameOver = false;
let isGamePaused = false;
let gameElapsedTime = 0;
let levelUpTimer = 0;
let gameItems = [];

let isFirstClickToStart = false;

let highScores = JSON.parse(localStorage.getItem("trashGameScores")) || [
  0, 0, 0, 0,
];

function checkHighScore() {
  highScores.push(gameScore);
  highScores.sort((a, b) => b - a);
  highScores = highScores.slice(0, 4);
  localStorage.setItem("trashGameScores", JSON.stringify(highScores));
}

const gamePlayer = {
  x: gameCanvas.width / 2 - 25,
  y: gameCanvas.height - 35,
  width: 50,
  height: 30,
};

/* 쓰레기 이미지 6개 직접 불러오기 */
const trashImage1 = new Image();
trashImage1.src = "../assets/images/trash-catch-01.png";

const trashImage2 = new Image();
trashImage2.src = "../assets/images/trash-catch-02.png";

const trashImage3 = new Image();
trashImage3.src = "../assets/images/trash-catch-03.png";

const trashImage4 = new Image();
trashImage4.src = "../assets/images/trash-catch-04.png";

const trashImage5 = new Image();
trashImage5.src = "../assets/images/trash-catch-05.png";

const trashImage6 = new Image();
trashImage6.src = "../assets/images/trash-catch-06.png";

// 여기서 랜덤으로 이미지 불러올거
const trashImages = [
  trashImage1,
  trashImage2,
  trashImage3,
  trashImage4,
  trashImage5,
  trashImage6,
];

let gameInterval1 = null;
let gameInterval2 = null;

function initAndStartGame() {
  gameScore = 0;
  gameLives = 3;
  gameLevel = 1;
  gameElapsedTime = 0;
  levelUpTimer = 0;
  gameItems = [];
  isGameOver = false;
  isGamePaused = false;

  updateHeartsDisplay();

  clearInterval(gameInterval1);
  clearInterval(gameInterval2);

  gameInterval1 = setInterval(() => {
    if (isGameOver || isGamePaused || !isFirstClickToStart) return;

    const baseWidth = 35;
    const randomX = Math.random() * (gameCanvas.width - baseWidth);
    const randomType = Math.floor(Math.random() * trashImages.length);
    const baseSpeed = 4 + gameLevel * 4.5;
    const randomBonus = Math.random() * 5;

    gameItems.push({
      x: randomX,
      y: -50,
      width: baseWidth,
      height: 35,
      speed: baseSpeed + randomBonus,
      type: randomType,
    });
  }, 500);

  gameInterval2 = setInterval(() => {
    if (isGameOver || isGamePaused || !isFirstClickToStart) return;

    gameElapsedTime++;

    if (gameElapsedTime % 15 === 0) {
      gameLevel++;
      levelUpTimer = 60;

      if (window.AudioManager) {
        AudioManager.playSfx("levelup");
      }
    }
  }, 1000);
}

window.addEventListener("mousemove", (event) => {
  if (isGameOver || isGamePaused || !isFirstClickToStart) return;

  const rect = gameCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;

  const scaleX = gameCanvas.width / rect.width;
  gamePlayer.x = mouseX * scaleX - gamePlayer.width / 2;

  if (gamePlayer.x < 0) gamePlayer.x = 0;

  if (gamePlayer.x > gameCanvas.width - gamePlayer.width) {
    gamePlayer.x = gameCanvas.width - gamePlayer.width;
  }
});

// window.addEventListener("keydown", (event) => {
//   if (!isFirstClickToStart) return;

//   if (!isGameOver) {
//     if (event.key === "Escape" || event.key === "Esc") {
//       isGamePaused = !isGamePaused;
//     }
//   }
// });

gameCanvas.addEventListener("click", (event) => {
  const rect = gameCanvas.getBoundingClientRect();
  const clickX = (event.clientX - rect.left) * (gameCanvas.width / rect.width);
  const clickY = (event.clientY - rect.top) * (gameCanvas.height / rect.height);

  // 소리 아이콘 클릭
  if (
    clickX >= gameCanvas.width - 82 &&
    clickX <= gameCanvas.width - 52 &&
    clickY >= 54 &&
    clickY <= 86
  ) {
    if (window.AudioManager) {
      AudioManager.toggleMute();
    }
    return;
  }

  // 일시정지 버튼 클릭
  if (
    clickX >= gameCanvas.width - 49 &&
    clickX <= gameCanvas.width - 18 &&
    clickY >= 54 &&
    clickY <= 86
  ) {
    if (!isFirstClickToStart || isGameOver) return;

    if (window.AudioManager) {
      AudioManager.playButtonSfx();
    }

    isGamePaused = !isGamePaused;

    if (window.AudioManager) {
      if (isGamePaused) {
        AudioManager.pauseBgm();
      } else {
        AudioManager.playBgm(trashCatchBgmUrl);
      }
    }

    return;
  }

  // 시작 전 클릭
  if (!isFirstClickToStart) {
    isFirstClickToStart = true;
    initAndStartGame();

    if (window.AudioManager) {
      AudioManager.playBgm(trashCatchBgmUrl);
    }

    return;
  }

  // 게임오버 후 클릭
  if (isGameOver) {
    initAndStartGame();

    if (window.AudioManager) {
      AudioManager.playBgm(trashCatchBgmUrl);
    }

    return;
  }

  // 일시정지 상태에서는 화면 아무 곳 클릭하면 계속하기
  if (isGamePaused) {
    if (window.AudioManager) {
      AudioManager.playButtonSfx();
    }

    isGamePaused = false;

    if (window.AudioManager) {
      AudioManager.playBgm(trashCatchBgmUrl);
    }

    return;
  }
});

function drawGridBackground() {
  const gridSize = 40;

  gameCtx.fillStyle = "#ffffff";
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gameCtx.strokeStyle = "#e5e5e5";
  gameCtx.lineWidth = 1;

  for (let x = 0; x <= gameCanvas.width; x += gridSize) {
    gameCtx.beginPath();
    gameCtx.moveTo(x, 0);
    gameCtx.lineTo(x, gameCanvas.height);
    gameCtx.stroke();
  }

  for (let y = 0; y <= gameCanvas.height; y += gridSize) {
    gameCtx.beginPath();
    gameCtx.moveTo(0, y);
    gameCtx.lineTo(gameCanvas.width, y);
    gameCtx.stroke();
  }
}

function drawInGameLeaderboard() {
  gameCtx.save();

  gameCtx.fillStyle = "#000000";
  gameCtx.font = "700 14px 'Pretendard', sans-serif";
  gameCtx.textBaseline = "top";
  gameCtx.textAlign = "left";

  const startX = 20;
  const startY = gameCanvas.height / 2 - 50;

  gameCtx.fillText("최고기록", startX, startY);
  gameCtx.fillText(highScores[0], startX, startY + 22);
  gameCtx.fillText("--------", startX, startY + 38);
  gameCtx.fillText(highScores[1], startX, startY + 58);

  if (highScores[2] !== undefined) {
    gameCtx.fillText(highScores[2], startX, startY + 76);
  }

  if (highScores[3] !== undefined) {
    gameCtx.fillText(highScores[3], startX, startY + 94);
  }

  gameCtx.restore();
}

// 상단 ui
function drawTopGameUI() {
  gameCtx.save();

  const uiTextY = 28;

  gameCtx.fillStyle = "#000000";
  gameCtx.font = '700 16px "Pretendard", sans-serif';
  gameCtx.textBaseline = "middle";

  gameCtx.textAlign = "left";
  gameCtx.fillText(`레벨: ${gameLevel}`, 25, uiTextY);

  const paddedScore = String(gameScore).padStart(6, "0");

  gameCtx.textAlign = "center";
  gameCtx.fillText(`점수: ${paddedScore}`, gameCanvas.width / 2.2, uiTextY);

  let heartString = "";

  for (let i = 1; i <= maxLives; i++) {
    if (i <= gameLives) {
      heartString += "♥ ";
    } else {
      heartString += "♡ ";
    }
  }

  gameCtx.textAlign = "right";
  gameCtx.fillText(
    `목숨: ${heartString.trim()}`,
    gameCanvas.width - 25,
    uiTextY,
  );

  gameCtx.restore();
}

function drawControlIcons() {
  gameCtx.save();

  const iconSize = 22;

  // 상단 UI 바로 아래 오른쪽 아이콘 위치
  const soundX = gameCanvas.width - 78;
  const soundY = 50;

  const pauseX = gameCanvas.width - 45;
  const pauseY = 50;

  const currentSoundIcon =
    window.AudioManager && AudioManager.isMuted()
      ? soundIconOffImage
      : soundIconOnImage;

  const currentPauseIcon = isGamePaused ? playIconImage : pauseIconImage;

  if (
    currentSoundIcon &&
    currentSoundIcon.complete &&
    currentSoundIcon.naturalWidth > 0
  ) {
    gameCtx.drawImage(currentSoundIcon, soundX, soundY, iconSize, iconSize);
  }

  if (
    currentPauseIcon &&
    currentPauseIcon.complete &&
    currentPauseIcon.naturalWidth > 0
  ) {
    gameCtx.drawImage(currentPauseIcon, pauseX, pauseY, iconSize, iconSize);
  }

  gameCtx.restore();
}

function drawPlayerBasket() {
  gameCtx.save();

  gameCtx.beginPath();
  gameCtx.fillStyle = "#000000";

  gameCtx.fillRect(gamePlayer.x + 2, gamePlayer.y + 4, 3, 8);
  gameCtx.fillRect(gamePlayer.x + gamePlayer.width - 5, gamePlayer.y + 4, 3, 8);

  gameCtx.moveTo(gamePlayer.x + 5, gamePlayer.y);
  gameCtx.lineTo(gamePlayer.x + gamePlayer.width - 5, gamePlayer.y);
  gameCtx.lineTo(
    gamePlayer.x + gamePlayer.width - 12,
    gamePlayer.y + gamePlayer.height,
  );
  gameCtx.lineTo(gamePlayer.x + 12, gamePlayer.y + gamePlayer.height);
  gameCtx.closePath();
  gameCtx.fill();

  gameCtx.beginPath();
  gameCtx.strokeStyle = "#ffffff";
  gameCtx.lineWidth = 1;

  gameCtx.moveTo(gamePlayer.x + 16, gamePlayer.y + 4);
  gameCtx.lineTo(gamePlayer.x + 19, gamePlayer.y + gamePlayer.height - 4);

  gameCtx.moveTo(gamePlayer.x + 25, gamePlayer.y + 4);
  gameCtx.lineTo(gamePlayer.x + 25, gamePlayer.y + gamePlayer.height - 4);

  gameCtx.moveTo(gamePlayer.x + 34, gamePlayer.y + 4);
  gameCtx.lineTo(gamePlayer.x + 31, gamePlayer.y + gamePlayer.height - 4);

  gameCtx.stroke();
  gameCtx.restore();
}

function updateAndDrawTrashItems(shouldUpdate = true) {
  for (let i = 0; i < gameItems.length; i++) {
    const item = gameItems[i];

    if (shouldUpdate) {
      item.y += item.speed;
    }

    const img = trashImages[item.type];

    if (img && img.complete && img.naturalWidth > 0) {
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      item.height = item.width * aspectRatio;
      gameCtx.drawImage(img, item.x, item.y, item.width, item.height);
    }

    if (!shouldUpdate) {
      continue;
    }

    const isColliding =
      item.x < gamePlayer.x + gamePlayer.width &&
      item.x + item.width > gamePlayer.x &&
      item.y < gamePlayer.y + gamePlayer.height &&
      item.y + item.height > gamePlayer.y;

    if (isColliding) {
      gameItems.splice(i, 1);
      i--;

      gameScore += 10;

      if (window.AudioManager) {
        AudioManager.playSfx("catch");
      }

      continue;
    }

    if (item.y > gameCanvas.height) {
      gameItems.splice(i, 1);
      i--;

      gameLives--;
      updateHeartsDisplay();

      if (gameLives <= 0) {
        isGameOver = true;
        checkHighScore();

        if (window.AudioManager) {
          AudioManager.playSfx("gameover");
          AudioManager.pauseBgm();
        }
      }
    }
  }
}

function drawStartOverlay() {
  gameCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gameCtx.fillStyle = "#000000";
  gameCtx.font = '700 14px "Pretendard", sans-serif';
  gameCtx.textAlign = "center";

  gameCtx.fillText(
    "마우스로 움직여 쓰레기를 담으세요",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 14,
  );

  gameCtx.font = '800 16px "Pretendard", sans-serif';
  gameCtx.fillText(
    "[ 클릭하여 게임 시작하기 ]",
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 18,
  );
}

function drawGameOverScreen() {
  gameCtx.fillStyle = "#000000";
  gameCtx.font = "800 20px 'Pretendard', sans-serif";
  gameCtx.textAlign = "center";
  gameCtx.fillText(
    "게임 오버",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 20,
  );

  gameCtx.font = "800 16px 'Pretendard', sans-serif";
  gameCtx.fillText(
    "[ 클릭하여 게임 재시작하기 ]",
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 20,
  );
}

function drawPausedScreen() {
  gameCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gameCtx.fillStyle = "#000000";
  gameCtx.font = "800 20px 'Pretendard', sans-serif";
  gameCtx.textAlign = "center";
  gameCtx.fillText(
    "일시 정지",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 10,
  );

  gameCtx.font = "800 16px 'Pretendard', sans-serif";
  gameCtx.fillText(
    "[ 클릭하여 계속하기 ]",
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 20,
  );
}

function drawLevelUpText() {
  if (levelUpTimer > 0) {
    gameCtx.fillStyle = "#000000";
    gameCtx.font = "700 22px 'Pretendard', sans-serif";
    gameCtx.textAlign = "center";

    if (levelUpTimer % 10 > 3) {
      gameCtx.fillText(
        `레벨 :${gameLevel}`,
        gameCanvas.width / 2,
        gameCanvas.height / 2 - 80,
      );
    }

    levelUpTimer--;
  }
}

function runGameLoop() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  drawGridBackground();

  drawTopGameUI();
  drawControlIcons();
  drawInGameLeaderboard();
  drawPlayerBasket();

  if (!isFirstClickToStart) {
    drawStartOverlay();
  } else if (isGameOver) {
    drawGameOverScreen();
  } else if (isGamePaused) {
    updateAndDrawTrashItems(false);
    drawPausedScreen();
  } else {
    updateAndDrawTrashItems(true);
    drawLevelUpText();
  }

  requestAnimationFrame(runGameLoop);
}

updateHeartsDisplay();
runGameLoop();
