const masterSlider = document.getElementById("master-volume");
const masterText = document.getElementById("master-value-text");

const effectSlider = document.getElementById("effect-volume");
const effectText = document.getElementById("effect-value-text");

const darkModeToggle = document.getElementById("dark-mode-toggle");

function getStoredVolume(key, fallback) {
  const value = localStorage.getItem(key);
  return value === null ? fallback : Number(value);
}

function setSliderBackground(slider) {
  if (!slider) return;

  const value =
    ((Number(slider.value) - Number(slider.min)) /
      (Number(slider.max) - Number(slider.min))) *
    100;

  const isDark = document.body.classList.contains("dark-mode");

  if (isDark) {
    slider.style.background = `linear-gradient(
      to right,
      #ffffff 0%,
      #ffffff ${value}%,
      transparent ${value}%,
      transparent 100%
    )`;
  } else {
    slider.style.background = `linear-gradient(
      to right,
      #000000 0%,
      #000000 ${value}%,
      #d9d9d9 ${value}%,
      #d9d9d9 100%
    )`;
  }
}

function applyVolumes() {
  if (masterSlider && masterText) {
    const bgmVolume = getStoredVolume("bgmVolume", 30);

    masterSlider.value = bgmVolume;
    masterText.textContent = `${bgmVolume}%`;
    setSliderBackground(masterSlider);
  }

  if (effectSlider && effectText) {
    const sfxVolume = getStoredVolume("sfxVolume", 30);

    effectSlider.value = sfxVolume;
    effectText.textContent = `${sfxVolume}%`;
    setSliderBackground(effectSlider);
  }

  if (
    window.AudioManager &&
    typeof AudioManager.updateAllVolumes === "function"
  ) {
    AudioManager.updateAllVolumes();
  }
}

function applyTheme() {
  const isDark = localStorage.getItem("theme") === "dark";

  document.documentElement.classList.toggle("dark-mode", isDark);
  document.body.classList.toggle("dark-mode", isDark);

  if (darkModeToggle) {
    darkModeToggle.checked = isDark;
  }

  setSliderBackground(masterSlider);
  setSliderBackground(effectSlider);
}

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("bgmVolume") === null) {
    localStorage.setItem("bgmVolume", 30);
  }

  if (localStorage.getItem("sfxVolume") === null) {
    localStorage.setItem("sfxVolume", 30);
  }

  applyTheme();
  applyVolumes();
});

if (masterSlider) {
  masterSlider.addEventListener("input", (event) => {
    const value = event.target.value;

    localStorage.setItem("bgmVolume", value);

    if (masterText) {
      masterText.textContent = `${value}%`;
    }

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
  effectSlider.addEventListener("input", (event) => {
    const value = event.target.value;

    localStorage.setItem("sfxVolume", value);

    if (effectText) {
      effectText.textContent = `${value}%`;
    }

    setSliderBackground(effectSlider);

    if (
      window.AudioManager &&
      typeof AudioManager.updateAllVolumes === "function"
    ) {
      AudioManager.updateAllVolumes();
    }
  });
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    const isDark = darkModeToggle.checked;

    localStorage.setItem("theme", isDark ? "dark" : "light");

    applyTheme();
  });
}
