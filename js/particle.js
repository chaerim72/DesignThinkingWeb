// 바나나 로고 파티클 전용 코드
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particleArray = [];

const mouse = {
  x: null,
  y: null,
  radius: 85,
  vx: 0,
  vy: 0,
  lastX: null,
  lastY: null,
};

const easedMouse = {
  x: null,
  y: null,
};

/* 이미지 경로 */
const imageList = ["./assets/images/바나나.png"];
const randomImageName = imageList[Math.floor(Math.random() * imageList.length)];

window.addEventListener("mousemove", (event) => {
  if (mouse.lastX !== null && mouse.lastY !== null) {
    mouse.vx = event.clientX - mouse.lastX;
    mouse.vy = event.clientY - mouse.lastY;
  }

  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.lastX = event.clientX;
  mouse.lastY = event.clientY;

  if (easedMouse.x === null) easedMouse.x = mouse.x;
  if (easedMouse.y === null) easedMouse.y = mouse.y;
});

window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
  mouse.vx = 0;
  mouse.vy = 0;
  mouse.lastX = null;
  mouse.lastY = null;
});

class Particle {
  constructor(x, y, relX, relY) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.originX = x;
    this.originY = y;

    this.relX = relX;
    this.relY = relY;

    this.color = "#000000";

    const layerRand = Math.random();

    if (layerRand < 0.3) {
      this.size = 3.5;
      this.friction = 0.84;
      this.returnSpeed = 0.035;
    } else if (layerRand < 0.7) {
      this.size = 3.0;
      this.friction = 0.85;
      this.returnSpeed = 0.022;
    } else {
      this.size = 2.5;
      this.friction = 0.86;
      this.returnSpeed = 0.012;
    }

    this.vx = 0;
    this.vy = 0;
  }

  draw() {
    ctx.fillStyle = this.color;

    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size,
    );
  }

  update() {
    if (easedMouse.x !== null && easedMouse.y !== null) {
      let dx = easedMouse.x - this.x;
      let dy = easedMouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return;

      let magnetRadius = mouse.radius * 1.6;

      const isMouseMoving =
        Math.abs(mouse.vx) > 0.01 || Math.abs(mouse.vy) > 0.01;

      if (mouse.x !== null && distance < magnetRadius && isMouseMoving) {
        let force = (magnetRadius - distance) / magnetRadius;

        if (distance < mouse.radius * 0.65) {
          let pushForce =
            (mouse.radius * 0.65 - distance) / (mouse.radius * 0.65);

          this.vx -= (dx / distance) * pushForce * 2.8;
          this.vy -= (dy / distance) * pushForce * 2.8;
        } else {
          let smoothForce = force * force;

          this.vx += (dx / distance) * smoothForce * 0.35 * this.size;
          this.vy += (dy / distance) * smoothForce * 0.35 * this.size;
        }

        if (distance < mouse.radius) {
          let speedForce = (mouse.radius - distance) / mouse.radius;

          this.vx += mouse.vx * speedForce * 0.08 * this.size;
          this.vy += mouse.vy * speedForce * 0.08 * this.size;
        }
      }
    }

    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    let dxOrigin = this.originX - this.x;
    let dyOrigin = this.originY - this.y;

    this.x += dxOrigin * this.returnSpeed;
    this.y += dyOrigin * this.returnSpeed;
  }
}

const mainImg = new Image();
mainImg.src = randomImageName;

mainImg.onload = () => {
  initMainParticles(mainImg);
  mainRenderingLoop();
};

let centerX = 0;
let centerY = 0;

/* 로고 크기 조절 */
let baseScale = 1.9;
let particleOffsetY = 30;

function initMainParticles(image) {
  particleArray = [];

  const scaledWidth = image.width * baseScale;
  const scaledHeight = image.height * baseScale;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = scaledWidth;
  tempCanvas.height = scaledHeight;

  tempCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

  const pixels = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);

  centerX = (canvas.width - scaledWidth) / 2;
  centerY = (canvas.height - scaledHeight) / 2 + particleOffsetY;

  const gap = 2;

  for (let y = 0; y < tempCanvas.height; y += gap) {
    for (let x = 0; x < tempCanvas.width; x += gap) {
      const index = (y * tempCanvas.width + x) * 4;
      const a = pixels.data[index + 3];

      if (a > 30) {
        const r = pixels.data[index];
        const g = pixels.data[index + 1];
        const b = pixels.data[index + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness < 245) {
          if (Math.random() > brightness / 255) {
            const relX = x - scaledWidth / 2;
            const relY = y - scaledHeight / 2;

            particleArray.push(
              new Particle(x + centerX, y + centerY, relX, relY),
            );
          }
        }
      }
    }
  }
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (!mainImg.complete) return;

  const newCanvasCenterX = canvas.width / 2;
  const newCanvasCenterY = canvas.height / 2;

  for (let i = 0; i < particleArray.length; i++) {
    const p = particleArray[i];

    const targetX = newCanvasCenterX + p.relX;
    const targetY = newCanvasCenterY + p.relY + particleOffsetY;

    p.originX = targetX;
    p.originY = targetY;
    p.x = targetX;
    p.y = targetY;
  }
});

function mainRenderingLoop() {
  if (mouse.x !== null && mouse.y !== null) {
    easedMouse.x += (mouse.x - easedMouse.x) * 0.5;
    easedMouse.y += (mouse.y - easedMouse.y) * 0.35;
  } else {
    easedMouse.x = null;
    easedMouse.y = null;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particleArray.length; i++) {
    particleArray[i].update();
    particleArray[i].draw();
  }

  mouse.vx *= 0.75;
  mouse.vy *= 0.75;

  requestAnimationFrame(mainRenderingLoop);
}
