function applySavedTheme() {
  const isDark = localStorage.getItem("theme") === "dark";

  document.documentElement.classList.toggle("dark-mode", isDark);

  if (document.body) {
    document.body.classList.toggle("dark-mode", isDark);
  }
}

applySavedTheme();

window.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
});
