const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

const trashCatchBgmUrl = "../assets/sounds/SellBuyMusic - 푸드 파이터.mp3";

let gameScore = 0;
const scoreDisplay = document.getElementById("score");

let gameLives = 3;
const maxLives = 3;
const lifeHeartsDisplay = document.getElementById("life-hearts");

function updateHeartsDisplay() {
  let heartString = "";

  for (let i = 1; i <= maxLives; i++) {
    if (i <= gameLives) {
      heartString += "♥ ";
    } else {
      heartString += "♡ ";
    }
  }

  lifeHeartsDisplay.textContent = heartString.trim();
}

let gameLevel = 1;
const levelDisplay = document.getElementById("level");

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

  scoreDisplay.textContent = gameScore;
  updateHeartsDisplay();
  levelDisplay.textContent = gameLevel;

  clearInterval(gameInterval1);
  clearInterval(gameInterval2);

  gameInterval1 = setInterval(() => {
    if (isGameOver || isGamePaused || !isFirstClickToStart) return;

    const baseWidth = 35;
    const randomX = Math.random() * (gameCanvas.width - baseWidth);
    const randomType = Math.floor(Math.random() * trashImages.length);
    const baseSpeed = 2.5 + gameLevel * 1.2;
    const randomBonus = Math.random() * 2.5;

    gameItems.push({
      x: randomX,
      y: -50,
      width: baseWidth,
      height: 35,
      speed: baseSpeed + randomBonus,
      type: randomType,
    });
  }, 1000);

  gameInterval2 = setInterval(() => {
    if (isGameOver || isGamePaused || !isFirstClickToStart) return;

    gameElapsedTime++;

    if (gameElapsedTime % 15 === 0) {
      gameLevel++;
      levelDisplay.textContent = gameLevel;
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

  if (!isFirstClickToStart) {
  isFirstClickToStart = true;
  initAndStartGame();

  if (window.AudioManager) {
    AudioManager.playBgm(trashCatchBgmUrl);
  }

  return;
}

  if (isGameOver) {
  initAndStartGame();

  if (window.AudioManager) {
    AudioManager.playBgm(trashCatchBgmUrl);
  }

  return;
}

  if (clickX >= 360 && clickX <= 390 && clickY >= 10 && clickY <= 35) {
    isGamePaused = !isGamePaused;
  }
});

function drawInGameLeaderboard() {
  gameCtx.save();

  gameCtx.fillStyle = "#000000";
  gameCtx.font = "700 14px 'Pretendard', sans-serif";
  gameCtx.textBaseline = "top";
  gameCtx.textAlign = "left";

  const startX = 20;
  const startY = gameCanvas.height / 2 - 40;

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

function drawPauseButton() {
  gameCtx.save();

  gameCtx.fillStyle = "#000000";
  gameCtx.fillRect(368, 15, 4, 14);
  gameCtx.fillRect(376, 15, 4, 14);

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

function updateAndDrawTrashItems() {
  for (let i = 0; i < gameItems.length; i++) {
    const item = gameItems[i];

    item.y += item.speed;

    const img = trashImages[item.type];

    if (img && img.complete && img.naturalWidth > 0) {
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      item.height = item.width * aspectRatio;
      gameCtx.drawImage(img, item.x, item.y, item.width, item.height);
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
      scoreDisplay.textContent = gameScore;

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
  gameCtx.font = '700 16px "Pretendard", sans-serif';
  gameCtx.textAlign = "center";

  gameCtx.fillText(
    "마우스로 움직여 쓰레기를 담으세요",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 14
  );

  gameCtx.font = '700 18px "Pretendard", sans-serif';
  gameCtx.fillText(
    "[ 클릭하여 게임 시작하기 ]",
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 18
  );
}

function drawGameOverScreen() {
  gameCtx.fillStyle = "#000000";
  gameCtx.font = "700 28px 'Pretendard', sans-serif";
  gameCtx.textAlign = "center";
  gameCtx.fillText(
    "게임 오버",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - 20,
  );

  gameCtx.font = "600 13px 'Pretendard', sans-serif";
  gameCtx.fillText(
    "[ 클릭하여 게임 재시작하기 ]",
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 20,
  );
}

function drawPausedScreen() {
  drawInGameLeaderboard();
  drawPauseButton();

  gameCtx.fillStyle = "#000000";
  gameCtx.font = "700 28px 'Pretendard', sans-serif";
  gameCtx.textAlign = "center";
  gameCtx.fillText("일시 정지", gameCanvas.width / 2, gameCanvas.height / 2 - 10);

  gameCtx.font = "600 13px 'Pretendard', sans-serif";
  gameCtx.fillText(
    "[ 클릭하여 게임 재시작하기 ]",
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
        `레벨업! LV:${gameLevel}`,
        gameCanvas.width / 2,
        gameCanvas.height / 2 - 80,
      );
    }

    levelUpTimer--;
  }
}

function runGameLoop() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  drawInGameLeaderboard();
  drawPauseButton();
  drawPlayerBasket();

  if (!isFirstClickToStart) {
    drawStartOverlay();
  } else if (isGameOver) {
    drawGameOverScreen();
  } else if (isGamePaused) {
    drawPausedScreen();
  } else {
    updateAndDrawTrashItems();
    drawLevelUpText();
  }

  requestAnimationFrame(runGameLoop);
}

updateHeartsDisplay();
runGameLoop();
