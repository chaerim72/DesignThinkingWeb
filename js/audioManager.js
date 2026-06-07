const AudioManager = {
  getVolume(type) {
    return Number(localStorage.getItem(type + "Volume") ?? 30);
  },

  isMuted() {
    return localStorage.getItem("audioMuted") === "true";
  },

  createAudio(src, type) {
    const audio = new Audio(src);
    audio.dataset.type = type;

    if (type === "bgm") {
      audio.loop = true;
    }

    audio.volume = this.isMuted() ? 0 : this.getVolume(type) / 100;

    return audio;
  },

  bgm: null,

  sounds: {
    button: new Audio("../assets/sounds/- Mouse Click 2.mp3"),
    gameover: new Audio("../assets/sounds/Mike Koenig - Computer Error Alert Sound.mp3"),
    
    catch: new Audio("../assets/sounds/- Coin 1.mp3"),
    levelup: new Audio("../assets/sounds/- Correct 1.mp3"),

    jump: new Audio("../assets/sounds/- Storytelling Cartoon SwishCartoon 02.mp3"),
    
    stack: new Audio("../assets/sounds/- Storytelling Cartoon PopVocal 03.mp3"),
  },

  updateAllVolumes() {
    const muted = this.isMuted();
    const bgmVol = muted ? 0 : this.getVolume("bgm");
    const sfxVol = muted ? 0 : this.getVolume("sfx");

    document.querySelectorAll("audio").forEach((audio) => {
      audio.volume = (audio.dataset.type === "bgm" ? bgmVol : sfxVol) / 100;
    });

    if (this.bgm) {
      this.bgm.volume = bgmVol / 100;
    }

    Object.values(this.sounds).forEach((audio) => {
      audio.volume = sfxVol / 100;
    });
  },

  toggleMute() {
  const currentlyMuted = this.isMuted();
  const nextMuted = !currentlyMuted;

  // 음소거 상태에서 해제할 때는 먼저 해제하고 클릭음 재생
  if (currentlyMuted) {
    localStorage.setItem("audioMuted", "false");
    this.updateAllVolumes();
    this.playButtonSfx();
    return false;
  }

  // 음소거로 바꿀 때는 클릭음 먼저 재생 후 음소거
  this.playButtonSfx();

  setTimeout(() => {
    localStorage.setItem("audioMuted", "true");
    this.updateAllVolumes();
  }, 120);

  return true;
},

  playSfx(name) {
    if (this.isMuted()) return;

    const sfx = this.sounds[name];
    if (!sfx) return;

    sfx.dataset.type = "sfx";
    sfx.volume = this.getVolume("sfx") / 100;
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  },

  // 음소거 버튼을 누르는 순간에도 클릭음이 나게
  playButtonSfx() {
    const sfx = this.sounds.button;
    if (!sfx) return;

    sfx.dataset.type = "sfx";
    sfx.volume = this.getVolume("sfx") / 100;
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  },

  playBgm(src) {
    if (!this.bgm || this.bgm.src !== new URL(src, location.href).href) {
      if (this.bgm) {
        this.bgm.pause();
      }

      this.bgm = this.createAudio(src, "bgm");
    }

    this.bgm.volume = this.isMuted() ? 0 : this.getVolume("bgm") / 100;

    if (this.bgm.paused) {
      this.bgm.play().catch(() => {});
    }
  },

  pauseBgm() {
    if (this.bgm) {
      this.bgm.pause();
    }
  },
};

window.AudioManager = AudioManager;