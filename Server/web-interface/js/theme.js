// Centralized theme handling used by dashboard.html and dashboard.js
window.Theme = (function () {
  function getSavedTheme() {
    return localStorage.getItem("theme") || "system";
  }

  function saveTheme(theme) {
    localStorage.setItem("theme", theme);
  }

  function setTheme(theme) {
    document.body.classList.remove("theme-dark", "theme-light");
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
    } else if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("theme-dark");
      } else {
        document.body.classList.add("theme-light");
      }
    }
  }

  function initThemeSelectors() {
    const selects = document.querySelectorAll(
      "#settingsModalAdmin #themeSelect, #settingsModalGuest #themeSelect"
    );
    const current = getSavedTheme();
    selects.forEach((sel) => {
      sel.value = current;
      sel.onchange = function () {
        const value = sel.value;
        saveTheme(value);
        setTheme(value);
        selects.forEach((other) => {
          if (other !== sel) other.value = value;
        });
      };
    });

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        if (getSavedTheme() === "system") setTheme("system");
      });
  }

  function initSettingsFab() {
    const settingsFab = document.getElementById("settingsFab");
    if (!settingsFab) return;
    settingsFab.onclick = function () {
      const modalId =
        window.isAdmin && window.isAdmin()
          ? "settingsModalAdmin"
          : "settingsModalGuest";
      const modalEl = document.getElementById(modalId);
      if (!modalEl) return;
      const selectInModal = modalEl.querySelector("#themeSelect");
      if (selectInModal) selectInModal.value = getSavedTheme();
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    };
  }

  function init() {
    setTheme(getSavedTheme());
    initThemeSelectors();
    initSettingsFab();
  }

  return { getSavedTheme, saveTheme, setTheme, init };
})();
