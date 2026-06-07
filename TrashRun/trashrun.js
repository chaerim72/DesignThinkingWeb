const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgmSoundUrl = "../assets/sounds/SellBuyMusic - 뒤뚱뒤뚱.mp3";
// const bgmSoundUrl = "../assets/sounds/trashsound.wav";

// 캐릭터 이미지 불러오기
const playerImage = new Image();
playerImage.src = "../assets/images/쓰레기런_캐릭터기본.png";

// 장애물 이미지 불러오기
const obstacleImage1 = new Image();
obstacleImage1.src = "../assets/images/쓰레기런_담뱃갑.png/";

const obstacleImage2 = new Image();
obstacleImage2.src = "../assets/images/쓰레기런_몬스터.png";

const obstacleImage3 = new Image();
obstacleImage3.src = "../assets/images/쓰레기런_바나나.png.png";

const obstacleImage4 = new Image();
obstacleImage4.src = "../assets/images/쓰레기런_사과.png";

const obstacleImage5 = new Image();
obstacleImage4.src = "../assets/images/쓰레기런_쓰레기봉투.png";

const obstacleImage6 = new Image();
obstacleImage4.src = "../assets/images/쓰레기런_양파링.png";

const obstacleImage7 = new Image();
obstacleImage4.src = "../assets/images/쓰레기런_초콜릿.png";

const obstacleImage8 = new Image();
obstacleImage4.src = "../assets/images/쓰레기런_커피컵.png";

const obstacleImage9 = new Image();
obstacleImage4.src = "../assets/images/쓰레기런_토레타.png";

const obstacleImages = [
  obstacleImage1,
  obstacleImage2,
  obstacleImage3,
  obstacleImage4,
  obstacleImage5,
  obstacleImage6,
  obstacleImage7,
  obstacleImage8,
  obstacleImage9,
];

//배경이미지 불러오기
const backgroundImages = [];

const bgImage1 = new Image();
bgImage1.src = "../assets/images/쓰레기런배경_상명대.png";

const bgImage2 = new Image();
bgImage2.src = "../assets/images/쓰레기런배경_상명.png";

const bgImage3 = new Image();
bgImage3.src = "../assets/images/쓰레기런배경_호서.png";

const bgImage4 = new Image();
bgImage4.src = "../assets/images/쓰레기런배경_천호지.png";

const bgImage5 = new Image();
bgImage5.src = "../assets/images/쓰레기런배경_백석.png";

backgroundImages.push(bgImage1, bgImage2, bgImage3, bgImage4, bgImage5);

let currentBgIndex = 0;
let backgroundX = 0;
let backgroundSpeed = 5;

// 게임 설정 시스템 물리 수치 (극강의 스릴을 위한 재튜닝)
let gameResult = "READY";
let score = 0;
let baseSpeed = 9; // 초기 속도 상승 (시작부터 빠르게)
let gameSpeed = baseSpeed;
let maxSpeed = 35; // 최대 한계 속도 대폭 상향 (광속 런)
const gravity = 0.95; // 중력을 대폭 높여 체공 시간을 줄이고, 빠른 낙하감 선사

let obstacles = [];
let frameCount = 0;
let nextObstacleFrame = 45; // 첫 장애물 등장 타이밍을 당김
let isMousePressed = false;
let isGamePaused = false;

function startBgm() {
  if (window.AudioManager) {
    AudioManager.playBgm(bgmSoundUrl);
  } else {
    if (!window._trashRunBgm) {
      window._trashRunBgm = new Audio(bgmSoundUrl);
      window._trashRunBgm.loop = true;
    }
    window._trashRunBgm.volume =
      Number(localStorage.getItem("bgmVolume") || 85) / 100;
    window._trashRunBgm.play().catch(() => {});
  }
}

function pauseBgm() {
  if (window.AudioManager) {
    AudioManager.pauseBgm();
  } else if (window._trashRunBgm) {
    window._trashRunBgm.pause();
  }
}

function playJumpSfx() {
  if (window.AudioManager) {
    AudioManager.playSfx("jump");
  } else {
    const sfx = new Audio("../assets/sounds/jump.wav");
    sfx.volume = Number(localStorage.getItem("sfxVolume") || 62) / 100;
    sfx.play().catch(() => {});
  }
}

// 플레이어 오브젝트
const player = {
  x: 120,
  y: 340,
  width: 80,
  height: 80,
  velocityY: 0,
  isGrounded: false,
  jumpForce: -16.5, // 높아진 중력에 맞춰 점프력 상향 (칼타이밍 점프 필요)
  minJumpForce: -7, // 가변 숏점프 제어를 더 날카롭게 변경

  draw() {
  ctx.save();

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (playerImage.complete && playerImage.naturalWidth > 0) {
    ctx.drawImage(
      playerImage,
      this.x,
      this.y,
      this.width,
      this.height
    );
  } else {
    // 이미지가 아직 안 불러와졌을 때 임시 네모
    ctx.fillStyle = "#000000";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  if (gameResult === "READY") {
    ctx.strokeStyle = "#ff3399";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + 130);
    ctx.lineTo(this.x + this.width / 2, this.y + 85);
    ctx.moveTo(this.x + this.width / 2 - 6, this.y + 93);
    ctx.lineTo(this.x + this.width / 2, this.y + 85);
    ctx.lineTo(this.x + this.width / 2 + 6, this.y + 93);
    ctx.stroke();
  }

  ctx.restore();
},

  update() {
    if (
      !this.isGrounded &&
      !isMousePressed &&
      this.velocityY < this.minJumpForce
    ) {
      this.velocityY = this.minJumpForce;
    }

    this.velocityY += gravity;
    this.y += this.velocityY;

    if (this.y + this.height >= 420) {
      this.y = 420 - this.height;
      this.velocityY = 0;
      this.isGrounded = true;
    }
  },
};

// 장애물 쓰레기 클래스
class Obstacle {
  constructor() {
    this.x = canvas.width + 50;

    this.type = Math.floor(Math.random() * obstacleImages.length);
    this.image = obstacleImages[this.type];

    // 이미지별 기준 높이만 지정
    if (this.type === 0) {
      this.height = 50;
    } else if (this.type === 1) {
      this.height = 56;
    } else if (this.type === 2) {
      this.height = 50;
    } else if (this.type === 3) {
      this.height = 50;
    } else if (this.type === 4) {
      this.height = 50;
    } else if (this.type === 5) {
      this.height = 50;
    } else if (this.type === 6) {
      this.height = 50;
    } else if (this.type === 7) {
      this.height = 50;
    } else {
      this.height = 50;
    }

    // 일단 임시 width
    this.width = 50;

    // 이미지가 로드되어 있으면 원본 비율로 width 계산
    if (this.image.complete && this.image.naturalWidth > 0) {
      const ratio = this.image.naturalWidth / this.image.naturalHeight;
      this.width = this.height * ratio;
    }

    this.y = 420 - this.height;
  }

  draw() {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (this.image.complete && this.image.naturalWidth > 0) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "#111111";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  update() {
    this.x -= gameSpeed;
  }
}

//배경 그리기
function drawGridBackground() {
  const gridSize = 50;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawMovingBackground() {
  const currentBg = backgroundImages[currentBgIndex];
  const nextBgIndex = (currentBgIndex + 1) % backgroundImages.length;
  const nextBg = backgroundImages[nextBgIndex];

  // 이미지가 아직 안 불러와졌으면 넘어감
  if (
    !currentBg.complete ||
    currentBg.naturalWidth === 0 ||
    !nextBg.complete ||
    nextBg.naturalWidth === 0
  ) {
    return;
  }

  // 배경 이미지 세로 사이즈
  const bgHeight = canvas.height*0.75;

  const currentScale = bgHeight / currentBg.naturalHeight;
  const currentWidth = currentBg.naturalWidth * currentScale;

  const nextScale = bgHeight / nextBg.naturalHeight;
  const nextWidth = nextBg.naturalWidth * nextScale;

  const bgY = canvas.height - bgHeight;

  // 이미지 확대 시 품질 보정
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (gameResult === "RUNNING") {
    backgroundX -= backgroundSpeed;
  }

  // 현재 배경
  ctx.drawImage(currentBg, backgroundX, bgY, currentWidth, bgHeight);

  // 다음 배경
  ctx.drawImage(nextBg, backgroundX + currentWidth, bgY, nextWidth, bgHeight);

  // 현재 배경이 완전히 지나가면 다음 이미지로 변경
  if (backgroundX <= -currentWidth) {
    backgroundX += currentWidth;
    currentBgIndex++;

    if (currentBgIndex >= backgroundImages.length) {
      currentBgIndex = 0;
    }
  }
}

function drawUI() {
  const scoreBoxWidth = 140;
  const scoreBoxHeight = 32;
  const scoreBoxX = canvas.width / 2 - scoreBoxWidth / 2;
  const scoreBoxY = 25;

  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight);

  ctx.strokeStyle = "#7f7f7f";
  ctx.strokeRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight);

  ctx.fillStyle = "#000000";
  ctx.font = '400 12px "Pretendard", sans-serif';
  ctx.textAlign = "center";
  let paddedScore = String(Math.floor(score)).padStart(6, "0");
  ctx.fillText(`점수: ${paddedScore}`, canvas.width / 2, scoreBoxY + 21);

  // 우측 상단 아이콘
  ctx.fillStyle = "#4a4a4a";
  ctx.font = '16px "Pretendard", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const soundIcon =
    window.AudioManager && AudioManager.isMuted()
      ? "🔇"
      : "🔊";

  ctx.fillText(soundIcon, canvas.width - 64, 36);

  ctx.fillStyle = "#4a4a4a";

  if (gameResult === "PAUSED") {
    // 재생 아이콘
    ctx.beginPath();
    ctx.moveTo(canvas.width - 44, 27);
    ctx.lineTo(canvas.width - 44, 45);
    ctx.lineTo(canvas.width - 30, 36);
    ctx.closePath();
    ctx.fill();
  } else {
    // 일시정지 아이콘
    ctx.fillRect(canvas.width - 45, 28, 4, 16);
    ctx.fillRect(canvas.width - 37, 28, 4, 16);
  }

  ctx.textBaseline = "alphabetic";

  if (gameResult === "READY") {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = '800 16px "Pretendard", sans-serif';
    ctx.textAlign = "center";

    ctx.fillText(
      "[ 클릭하여 게임 시작하기 ]",
      canvas.width / 2,
      canvas.height / 2
    );
  } else if (gameResult === "PAUSED") {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = '700 28px "Pretendard", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("일시 정지", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '600 13px "Pretendard", sans-serif';
    ctx.fillText(
      "[ 클릭하여 계속하기 ]",
      canvas.width / 2,
      canvas.height / 2 + 20
    );
  } else if (gameResult === "GAMEOVER") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const boxWidth = 240;
    const boxHeight = 80;
    const boxX = canvas.width / 2 - boxWidth / 2;
    const boxY = canvas.height / 2 - boxHeight / 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(boxX + 5, boxY + 5, boxWidth - 10, boxHeight - 10);

    ctx.fillStyle = "#ffffff";
    ctx.font = '700 18px "Pretendard", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 5);

    ctx.font = '400 12px "Pretendard", sans-serif';
    ctx.fillText(
      "다시 시작하려면 클릭",
      canvas.width / 2,
      canvas.height / 2 + 20
    );
  }
}

// 히트박스(충돌 영역) 판정 고도화
function checkCollision(rect1, rect2) {
  // 속도가 워낙 빠르기 때문에 억울한 죽음이 없도록 판정 범위를 미세하게 완화 (디노 게임 스치기 판정 적용)
  const paddingX = 6;
  const paddingY = 4;
  return (
    rect1.x + paddingX < rect2.x + rect2.width - paddingX &&
    rect1.x + rect1.width - paddingX > rect2.x + paddingX &&
    rect1.y + paddingY < rect2.y + rect2.height - paddingY &&
    rect1.y + rect1.height - paddingY > rect2.y + paddingY
  );
}

function resetGame() {
  score = 0;
  gameSpeed = baseSpeed;
  obstacles = [];
  frameCount = 0;
  nextObstacleFrame = 60;
  player.y = 340;
  player.velocityY = 0;
  gameResult = "RUNNING";
  currentBgIndex = 0;
  backgroundX = 0;
}


function gameLoop() {
  drawGridBackground();
  drawMovingBackground();

  if (gameResult === "RUNNING") {

    frameCount++;
    score += 0.25;

    if (gameSpeed < maxSpeed) {
      gameSpeed += 0.004;
    }

    // 장애물 헬모드 스폰 로직: 속도가 빨라질수록 스폰 주기(Interval)가 극단적으로 짧아짐
    if (frameCount >= nextObstacleFrame) {
      obstacles.push(new Obstacle());

      // 속도에 비례해 장애물 간 최소/최대 거리를 극단적으로 좁힘 (연속 장애물 유도)
      const minInterval = Math.max(25, 70 - Math.floor(gameSpeed * 2.2));
      const maxInterval = Math.max(50, 120 - Math.floor(gameSpeed * 2.5));
      nextObstacleFrame =
        frameCount +
        Math.floor(Math.random() * (maxInterval - minInterval)) +
        minInterval;
    }

    player.update();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (gameResult === "RUNNING") obstacles[i].update();
    obstacles[i].draw();

    if (gameResult === "RUNNING" && checkCollision(player, obstacles[i])) {
      gameResult = "GAMEOVER";

      if (window.AudioManager) {
        AudioManager.playSfx("gameover");
      }

      pauseBgm();
    }

    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }

  player.draw();
  drawUI();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("mousedown", (e) => {
  if (e.target.closest(".navbar") || e.target.closest(".game-side-arrow")) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

  // 소리 아이콘 클릭
  if (
    clickX >= canvas.width - 82 &&
    clickX <= canvas.width - 50 &&
    clickY >= 20 &&
    clickY <= 52
  ) {
    if (window.AudioManager) {
      AudioManager.toggleMute();
    }
    return;
  }

  // 일시정지 / 재생 아이콘 클릭
  if (
    clickX >= canvas.width - 52 &&
    clickX <= canvas.width - 20 &&
    clickY >= 20 &&
    clickY <= 52
  ) {
    if (window.AudioManager) {
      AudioManager.playButtonSfx();
    }

    if (gameResult === "RUNNING") {
      gameResult = "PAUSED";
      isMousePressed = false;
      pauseBgm();
    } else if (gameResult === "PAUSED") {
      gameResult = "RUNNING";
      startBgm();
    }

    return;
  }

  // 일시정지 화면에서는 화면 아무 곳 클릭하면 계속하기
  if (gameResult === "PAUSED") {
    if (window.AudioManager) {
      AudioManager.playButtonSfx();
    }

    gameResult = "RUNNING";
    startBgm();
    return;
  }

  isMousePressed = true;

  if (gameResult === "READY") {
    gameResult = "RUNNING";
    startBgm();
  } else if (gameResult === "RUNNING" && player.isGrounded) {
    player.velocityY = player.jumpForce;
    player.isGrounded = false;
    playJumpSfx();
  } else if (gameResult === "GAMEOVER") {
    resetGame();
    startBgm();
  }
});

// 2. 마우스 버튼에서 손을 떼는 순간 (스페이스바 업 기능 대체 - 가변 점프 유지용)
window.addEventListener("mouseup", () => {
  isMousePressed = false;
});

gameLoop();
