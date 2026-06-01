// 2. 음량 조절 로직
const masterSlider = document.getElementById("master-volume");
const masterText = document.getElementById("master-value-text");

const effectSlider = document.getElementById("effect-volume");
const effectText = document.getElementById("effect-value-text");

const setSliderBackground = (slider) => {
  if (!slider) return;
  slider.style.background = "#d9d9d9";
};

const getStoredVolume = (key, fallback) => {
  const value = localStorage.getItem(key);
  return value === null ? fallback : Number(value);
};

window.addEventListener("DOMContentLoaded", () => {
  const bgmVolume = getStoredVolume("bgmVolume", 85);
  const sfxVolume = getStoredVolume("sfxVolume", 62);

  if (masterSlider) {
    masterSlider.value = bgmVolume;
    masterText.textContent = `${bgmVolume}%`;
    setSliderBackground(masterSlider);
  }

  if (effectSlider) {
    effectSlider.value = sfxVolume;
    effectText.textContent = `${sfxVolume}%`;
    setSliderBackground(effectSlider);
  }

  localStorage.setItem("bgmVolume", bgmVolume);
  localStorage.setItem("sfxVolume", sfxVolume);

  if (
    window.AudioManager &&
    typeof AudioManager.updateAllVolumes === "function"
  ) {
    AudioManager.updateAllVolumes();
  }
});

if (masterSlider) {
  setSliderBackground(masterSlider);
  masterSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    localStorage.setItem("bgmVolume", val);
    if (masterText) masterText.innerText = val + "%";
    setSliderBackground(masterSlider);
    if (
      window.AudioManager &&
      typeof AudioManager.updateAllVolumes === "function"
    ) {
      AudioManager.updateAllVolumes();
    }
  });
}

if (effectSlider) {
  setSliderBackground(effectSlider);
  effectSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    localStorage.setItem("sfxVolume", val);
    if (effectText) effectText.innerText = val + "%";
    setSliderBackground(effectSlider);
    if (
      window.AudioManager &&
      typeof AudioManager.updateAllVolumes === "function"
    ) {
      AudioManager.updateAllVolumes();
    }
  });
}

// 3. 다크모드 로직
const toggleInput = document.getElementById("dark-mode-toggle");

// 페이지 로드 시 상태 확인 및 초기화 (중복 제거)
window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) document.body.classList.add("dark-mode");
  if (toggleInput) toggleInput.checked = isDark;
});

if (toggleInput) {
  toggleInput.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkNow = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDarkNow ? "dark" : "light");
  });
}

// Optional 슬라이더들 (있을 때만 등록)
const bgmSlider = document.getElementById("bgm-slider");
if (bgmSlider) {
  bgmSlider.addEventListener("input", (e) => {
    localStorage.setItem("bgmVolume", e.target.value);
    if (
      window.AudioManager &&
      typeof AudioManager.updateAllVolumes === "function"
    ) {
      AudioManager.updateAllVolumes();
    }
  });
}

const sfxSlider = document.getElementById("sfx-slider");
if (sfxSlider) {
  sfxSlider.addEventListener("input", (e) => {
    localStorage.setItem("sfxVolume", e.target.value);
    if (
      window.AudioManager &&
      typeof AudioManager.updateAllVolumes === "function"
    ) {
      AudioManager.updateAllVolumes();
    }
  });
}
