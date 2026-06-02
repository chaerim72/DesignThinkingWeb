const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bgmSoundUrl = "../assets/sounds/trashsound.wav";

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
  width: 45,
  height: 80,
  velocityY: 0,
  isGrounded: false,
  jumpForce: -16.5, // 높아진 중력에 맞춰 점프력 상향 (칼타이밍 점프 필요)
  minJumpForce: -7, // 가변 숏점프 제어를 더 날카롭게 변경

  draw() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 1. 머리 그리기
    ctx.fillStyle = "#000000";
    ctx.fillRect(this.x + 8, this.y, 28, 28);
    ctx.clearRect(this.x + 12, this.y + 6, 6, 6);

    // 2. 몸통 및 팔
    ctx.fillRect(this.x + 14, this.y + 28, 16, 30);
    if (Math.floor(frameCount / 4) % 2 === 0) {
      // 다리 속도에 맞춰 팔도 빠르게 교차
      ctx.fillRect(this.x + 4, this.y + 34, 10, 8);
      ctx.fillRect(this.x + 30, this.y + 30, 8, 8);
    } else {
      ctx.fillRect(this.x + 8, this.y + 30, 6, 8);
      ctx.fillRect(this.x + 30, this.y + 34, 10, 8);
    }

    // 3. 다리 달리기 구동 애니메이션 (속도감 반영하여 프레임 단축)
    if (!this.isGrounded) {
      ctx.fillRect(this.x + 10, this.y + 58, 8, 14);
      ctx.fillRect(this.x + 24, this.y + 58, 8, 10);
    } else if (Math.floor(frameCount / 3) % 2 === 0) {
      // 더 다다다닥 뛰도록 변경
      ctx.fillRect(this.x + 10, this.y + 58, 9, 22);
      ctx.fillRect(this.x + 24, this.y + 58, 9, 14);
    } else {
      ctx.fillRect(this.x + 10, this.y + 58, 9, 14);
      ctx.fillRect(this.x + 24, this.y + 58, 9, 22);
    }

    // 4. 캐릭터 뒤쪽 도트 먼지 이펙트
    ctx.fillStyle = "#dcdcdc";
    ctx.fillRect(this.x - 12, this.y + 42, 10, 10);
    ctx.fillRect(this.x - 22, this.y + 48, 8, 8);

    if (gameResult === "READY") {
      ctx.strokeStyle = "#ff3399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 22, this.y + 130);
      ctx.lineTo(this.x + 22, this.y + 85);
      ctx.moveTo(this.x + 16, this.y + 93);
      ctx.lineTo(this.x + 22, this.y + 85);
      ctx.lineTo(this.x + 28, this.y + 93);
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
    this.type = Math.floor(Math.random() * 3);

    if (this.type === 0) {
      this.width = 32;
      this.height = 78; // 캔 기둥 (높아서 숏점프하면 걸림)
    } else if (this.type === 1) {
      this.width = 48;
      this.height = 62; // 일회용 컵
    } else {
      this.width = 70;
      this.height = 48; // 과자 봉지 (길어서 멀리 뛰어야 함)
    }
    this.y = 420 - this.height;
  }

  draw() {
    ctx.save();
    ctx.fillStyle = "#111111";

    if (this.type === 0) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(0.18);
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-this.width / 2 + 6, -this.height / 2, 4, this.height);
    } else if (this.type === 1) {
      ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + 15, this.width / 2, Math.PI, 0);
      ctx.fill();
      this.drawArrow();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + 15, this.y);
      ctx.lineTo(this.x + this.width - 10, this.y + 10);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(this.x + 15, this.y + 25, this.width - 30, 8);
      this.drawArrow();
    }
    ctx.restore();
  }

  drawArrow() {
    ctx.strokeStyle = "#ff3399";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - 10, this.y + 32);
    ctx.lineTo(this.x - 35, this.y + 32);
    ctx.lineTo(this.x - 28, this.y + 26);
    ctx.moveTo(this.x - 35, this.y + 32);
    ctx.lineTo(this.x - 28, this.y + 38);
    ctx.stroke();
  }

  update() {
    this.x -= gameSpeed;
  }
}

function drawUI() {
  // 스코어박스
  ctx.strokeStyle = "#7f7f7f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.lineTo(canvas.width, 420);
  ctx.stroke();

  const scoreBoxWidth = 140;
  const scoreBoxHeight = 32;
  const scoreBoxX = canvas.width / 2 - scoreBoxWidth / 2;
  const scoreBoxY = 25;

  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight);

  ctx.strokeStyle = "#7f7f7f";
  ctx.strokeRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight);

  ctx.fillStyle = "#000000";
  ctx.font = '700 15px "Pretendard", sans-serif';
  ctx.textAlign = "center";
  let paddedScore = String(Math.floor(score)).padStart(6, "0");
  ctx.fillText(`Score: ${paddedScore}`, canvas.width / 2, scoreBoxY + 21);

  // 바닥
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 421, canvas.width, canvas.height - 421);

  ctx.fillStyle = "#4a4a4a";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("🔊  ▶", canvas.width - 40, 46);

  if (gameResult === "READY") {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "[CLICK SCREEN TO START]",
      canvas.width / 2,
      canvas.height / 2,
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
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 5);
    ctx.font = "12px sans-serif";
    ctx.fillText(
      "다시 시작하려면 ENTER",
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
}

function gameLoop() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#f4f4f4";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  if (gameResult === "RUNNING") {
    frameCount++;
    score += 0.25; // 점수 상승 속도도 스릴에 맞춰 상향

    // 상시 가속도 엔진 튜닝: 가속 계수를 0.0015에서 0.004로 대폭 상향 (순식간에 빨라짐)
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

    if (checkCollision(player, obstacles[i])) {
      gameResult = "GAMEOVER";
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
  if (e.target.closest(".navbar") || e.target.closest(".game-side-arrow"))
    return;
  isMousePressed = true;

  if (gameResult === "READY") {
    gameResult = "RUNNING";
    startBgm();
  } else if (gameResult === "RUNNING" && player.isGrounded) {
    player.velocityY = player.jumpForce;
    player.isGrounded = false;
    playJumpSfx();
  } else if (gameResult === "GAMEOVER") {
    // click 이벤트와 분리하지 않고 mousedown 시점에 단 한 번만 리셋하여 렉 발생을 원천 차단
    resetGame();
    startBgm();
  }
});

// 2. 마우스 버튼에서 손을 떼는 순간 (스페이스바 업 기능 대체 - 가변 점프 유지용)
window.addEventListener("mouseup", () => {
  isMousePressed = false;
});

gameLoop();
