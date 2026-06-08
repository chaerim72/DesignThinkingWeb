const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgmSoundUrl = "../assets/sounds/SellBuyMusic - 뒤뚱뒤뚱.mp3";

function loadUiIcon(src, name) {
  const img = new Image();

  img.onload = () => {
    console.log(`${name} 로드 성공:`, src);
  };

  img.onerror = () => {
    console.log(`${name} 로드 실패:`, src);
  };

  img.src = src;
  return img;
}

const soundIconOnImage = loadUiIcon(
  "../assets/images/사운드 아이콘on.png",
  "사운드 ON 아이콘",
);

const soundIconOffImage = loadUiIcon(
  "../assets/images/사운드 아이콘off.png",
  "사운드 OFF 아이콘",
);

const pauseIconImage = loadUiIcon(
  "../assets/images/정지 아이콘.png",
  "정지 아이콘",
);

const playIconImage = loadUiIcon(
  "../assets/images/재생 아이콘.png",
  "재생 아이콘",
);

// 캐릭터 달리기 이미지 불러오기
const playerRunImage1 = new Image();
playerRunImage1.src = "../assets/images/뛰어가는 캐릭터1.png";

const playerRunImage2 = new Image();
playerRunImage2.src = "../assets/images/뛰어가는 캐릭터2.png";

const playerRunImage3 = new Image();
playerRunImage3.src = "../assets/images/뛰어가는 캐릭터3.png";

const playerRunImages = [playerRunImage1, playerRunImage2, playerRunImage3];

// 캐릭터 게임오버 이미지 불러오기
const playerDeadImage1 = new Image();
playerDeadImage1.src = "../assets/images/캐릭터 게임오버1.png";

const playerDeadImage2 = new Image();
playerDeadImage2.src = "../assets/images/캐릭터 게임오버2.png";

const playerDeadImages = [playerDeadImage1, playerDeadImage2];

// 애니메이션 속도 조절
let playerRunFrame = 0;
let playerDeadFrame = 0;

const playerRunFrameSpeed = 8;
const playerDeadFrameSpeed = 4;

// 장애물 이미지 경로 + 이미지별 기준 높이
const obstacleImageData = [
  {
    src: "../assets/images/쓰레기런_담뱃갑.png",
    height: 70,
  },
  {
    src: "../assets/images/쓰레기런_몬스터02.png",
    height: 80,
  },
  {
    src: "../assets/images/쓰레기런_바나나03.png",
    height: 30,
  },
  {
    src: "../assets/images/쓰레기런_사과04.png",
    height: 30,
  },
  {
    src: "../assets/images/쓰레기런_쓰레기봉투05.png",
    height: 50,
  },
  {
    src: "../assets/images/쓰레기런_양파링06.png",
    height: 50,
  },
  {
    src: "../assets/images/쓰레기런_초콜릿.png",
    height: 40,
  },
  {
    src: "../assets/images/쓰레기런_커피컵.png",
    height: 100,
  },
  {
    src: "../assets/images/쓰레기런_토레타09.png",
    height: 30,
  },
];

// 로드 성공한 이미지 정보만 저장
const obstacleImages = [];

obstacleImageData.forEach((data, index) => {
  const img = new Image();

  img.onload = () => {
    obstacleImages.push({
      image: img,
      height: data.height,
      originalIndex: index,
      src: data.src,
    });

    console.log("장애물 이미지 로드 성공:", data.src);
  };

  img.onerror = () => {
    console.log("장애물 이미지 로드 실패:", data.src);
  };

  img.src = data.src;
});

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

// 바닥 이미지 불러오기
const groundImage = new Image();
groundImage.src = "../assets/images/쓰레기런배경_바닥.png";

let groundX = 0;

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

    let currentImage = playerRunImages[0];

    if (gameResult === "GAMEOVER") {
      const deadIndex = Math.min(
        Math.floor(playerDeadFrame / playerDeadFrameSpeed),
        playerDeadImages.length - 1,
      );

      currentImage = playerDeadImages[deadIndex];
    } else if (gameResult === "RUNNING") {
      const runIndex =
        Math.floor(playerRunFrame / playerRunFrameSpeed) %
        playerRunImages.length;

      currentImage = playerRunImages[runIndex];
    } else {
      currentImage = playerRunImages[0];
    }

    if (
      currentImage &&
      currentImage.complete &&
      currentImage.naturalWidth > 0
    ) {
      const imageRatio = currentImage.naturalWidth / currentImage.naturalHeight;

      // 상태별 이미지 크기 조절
      let imageScale = 1;

      if (gameResult === "GAMEOVER") {
        imageScale = 0.85; // 죽는 모션만 크기 조절
      } else {
        imageScale = 1; // 달리기 모션 크기 유지
      }

      const drawHeight = this.height * imageScale;
      const drawWidth = drawHeight * imageRatio;

      // 캐릭터 중심 정렬
      const drawX = this.x + this.width / 2 - drawWidth / 2;

      // 발 위치 기준 정렬
      const drawY = this.y + this.height - drawHeight;

      ctx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);
    } else {
      // 이미지 로딩 전 임시 네모
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y, this.width, this.height);
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

    // 아직 이미지가 하나도 안 불러와졌으면 생성 방지용 임시값
    if (obstacleImages.length === 0) {
      this.image = null;
      this.width = 50;
      this.height = 50;
      this.y = 420 - this.height;
      return;
    }

    // 로드 성공한 이미지 중에서만 랜덤 선택
    const randomIndex = Math.floor(Math.random() * obstacleImages.length);
    const selected = obstacleImages[randomIndex];

    this.image = selected.image;
    this.type = selected.originalIndex;

    // 이미지별로 지정한 기준 높이 적용
    this.height = selected.height;

    // 원본 비율 유지해서 width 계산
    const ratio = this.image.naturalWidth / this.image.naturalHeight;
    this.width = this.height * ratio;

    // 바닥 기준
    this.y = 420 - this.height;
  }

  draw() {
    ctx.save();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
  const bgHeight = canvas.height * 0.75;

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

function drawMovingGround() {
  if (!groundImage.complete || groundImage.naturalWidth === 0) {
    return;
  }

  // 바닥 이미지를 캔버스 너비에 맞춰 비율 유지
  const groundWidth = canvas.width * 3.65;
  const groundScale = groundWidth / groundImage.naturalWidth;
  const groundHeight = groundImage.naturalHeight * groundScale;

  // 바닥은 캔버스 아래에 붙임
  const groundY = canvas.height - groundHeight;

  // 게임이 진행 중일 때만 바닥 이동
  if (gameResult === "RUNNING") {
    groundX -= gameSpeed;
  }

  // 반복해서 끊기지 않게 두 장 그림
  ctx.drawImage(groundImage, groundX, groundY, groundWidth, groundHeight);
  ctx.drawImage(
    groundImage,
    groundX + groundWidth,
    groundY,
    groundWidth,
    groundHeight,
  );

  // 한 장이 완전히 지나가면 위치 초기화
  if (groundX <= -groundWidth) {
    groundX += groundWidth;
  }
}

function drawUI() {
  // 상단 SCORE 텍스트
  const uiTextY = 30;

  ctx.fillStyle = "#000000";
  ctx.font = '700 16px "Pretendard", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const paddedScore = String(Math.floor(score)).padStart(6, "0");
  ctx.fillText(`점수: ${paddedScore}`, 25, uiTextY);

  // 우측 상단 아이콘 이미지
  const iconSize = 20;
  const iconY = 20;

  const soundX = canvas.width - 76;
  const pauseX = canvas.width - 46;

  const currentSoundIcon =
    window.AudioManager && AudioManager.isMuted()
      ? soundIconOffImage
      : soundIconOnImage;

  const currentPauseIcon =
    gameResult === "PAUSED" ? playIconImage : pauseIconImage;

  if (
    currentSoundIcon &&
    currentSoundIcon.complete &&
    currentSoundIcon.naturalWidth > 0
  ) {
    ctx.drawImage(currentSoundIcon, soundX, iconY, iconSize, iconSize);
  }

  if (
    currentPauseIcon &&
    currentPauseIcon.complete &&
    currentPauseIcon.naturalWidth > 0
  ) {
    ctx.drawImage(currentPauseIcon, pauseX, iconY, iconSize, iconSize);
  }

  ctx.textBaseline = "alphabetic";

  if (gameResult === "READY") {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    ctx.font = '700 14px "Pretendard", sans-serif';
    ctx.fillText(
      "마우스로 클릭해 점프하세요",
      canvas.width / 2,
      canvas.height / 2 - 10,
    );

    ctx.font = '800 16px "Pretendard", sans-serif';
    ctx.fillText(
      "[ 클릭하여 게임 시작하기 ]",
      canvas.width / 2,
      canvas.height / 2 + 20,
    );
  } else if (gameResult === "PAUSED") {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = '800 20px "Pretendard", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("일시 정지", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '800 16px "Pretendard", sans-serif';
    ctx.fillText(
      "[ 클릭하여 계속하기 ]",
      canvas.width / 2,
      canvas.height / 2 + 20,
    );
  } else if (gameResult === "GAMEOVER") {
    ctx.fillStyle = "#000000";
    ctx.font = '800 20px "Pretendard", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '800 16px "Pretendard", sans-serif';
    ctx.fillText(
      "[ 클릭하여 게임 다시시작하기 ]",
      canvas.width / 2,
      canvas.height / 2 + 20,
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

  playerRunFrame = 0;
  playerDeadFrame = 0;

  currentBgIndex = 0;
  backgroundX = 0;
  groundX = 0;
}

function gameLoop() {
  drawGridBackground();
  drawMovingBackground();
  drawMovingGround();

  if (gameResult === "RUNNING") {
    frameCount++;
    playerRunFrame++;
    score += 0.25;

    if (gameSpeed < maxSpeed) {
      gameSpeed += 0.004;
    }

    // 장애물 헬모드 스폰 로직: 속도가 빨라질수록 스폰 주기(Interval)가 극단적으로 짧아짐
    if (frameCount >= nextObstacleFrame) {
      if (obstacleImages.length > 0) {
        obstacles.push(new Obstacle());
      }

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

  if (gameResult === "GAMEOVER") {
    playerDeadFrame++;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (gameResult === "RUNNING") obstacles[i].update();
    obstacles[i].draw();

    if (gameResult === "RUNNING" && checkCollision(player, obstacles[i])) {
      gameResult = "GAMEOVER";
      playerDeadFrame = 0;

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
