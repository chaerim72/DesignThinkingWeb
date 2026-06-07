//이 파일을 모든 HTML에서 <script src="../js/audioManager.js"></script>로 불러오세요.//

const AudioManager = {
  // 설정값 가져오기 (없으면 기본값 30)
  getVolume(type) {
    return Number(localStorage.getItem(type + "Volume") ?? 30);
  },

  // 오디오 객체 생성 및 설정 적용
  createAudio(src, type) {
    const audio = new Audio(src);
    audio.dataset.type = type;
    audio.volume = this.getVolume(type) / 100;
    if (type === "bgm") {
      audio.loop = true;
    }
    return audio;
  },

  // 설정 변경 시 전체 오디오 갱신
  updateAllVolumes() {
    const bgmVol = this.getVolume("bgm");
    const sfxVol = this.getVolume("sfx");

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

  // 배경음 / 효과음 오디오 저장
  bgm: null,
  sounds: {
    catch: new Audio("../assets/sounds/- Coin 1.mp3"),
    levelup: new Audio("../assets/sounds/- Correct 1.mp3"), 

    jump: new Audio("../assets/sounds/- Storytelling Cartoon SwishCartoon 02.mp3"),

    stack: new Audio("../assets/sounds/- Storytelling Cartoon PopVocal 03.mp3"),
  },

  // 효과음 재생 함수
  playSfx(name) {
    const sfx = this.sounds[name];
    if (!sfx) return;
    sfx.volume = this.getVolume("sfx") / 100;
    sfx.currentTime = 0; // 즉시 재재생 가능하게 초기화
    sfx.play().catch(() => {});
  },

  // 배경음 재생 함수
  playBgm(src) {
    if (!this.bgm || this.bgm.src !== new URL(src, location.href).href) {
      if (this.bgm) {
        this.bgm.pause();
      }

      this.bgm = this.createAudio(src, "bgm");
    }

    this.bgm.volume = this.getVolume("bgm") / 100;

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