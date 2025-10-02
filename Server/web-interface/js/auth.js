// Auth and login helpers
window.Auth = (function () {
  let serverSettings = { username: "admin", password: "admin" };

  async function fetchServerSettings() {
    try {
      const data = await window.Api.fetchSettings();
      if (data && data.username && data.password) {
        serverSettings.username = data.username;
        serverSettings.password = data.password;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function openLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.show();
  }
  function closeLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.hide();
  }

  function isAdmin() {
    return localStorage.getItem("admin") === "true";
  }
  function enableGuestMode() {
    if (typeof showSection === "function") showSection("chat");
    const navIdsToHide = [
      "navDashboard",
      "navPlayerlist",
      "navFeatures",
      "navConsole",
      "navMap",
    ];
    navIdsToHide.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    const chatNav = document.getElementById("navChat");
    if (chatNav) chatNav.style.display = "block";
    const chatInput = document.getElementById("chatInput");
    const chatSendBtn = document.getElementById("chatSendBtn");
    if (chatInput) chatInput.disabled = false;
    if (chatSendBtn) chatSendBtn.disabled = false;
    const settingsFab = document.getElementById("settingsFab");
    if (settingsFab) settingsFab.style.display = "flex";
  }
  function enableAdminMode() {
    [
      "navDashboard",
      "navPlayerlist",
      "navFeatures",
      "navConsole",
      "navMap",
      "navChat",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "block";
    });
    const settingsFab = document.getElementById("settingsFab");
    if (settingsFab) settingsFab.style.display = "flex";
    if (typeof showSection === "function") showSection("dashboard");
  }

  async function initLogin() {
    openLoginModal();
    const settingsLoaded = await fetchServerSettings();
    if (!settingsLoaded) {
      console.warn("Using default credentials (admin/admin)");
    }
    document.getElementById("guestBtn").addEventListener("click", function () {
      localStorage.setItem("admin", "false");
      closeLoginModal();
      enableGuestMode();
    });
    document
      .getElementById("loginBtn")
      .addEventListener("click", async function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const wrongLoginElement = document.getElementById("wrongLogin");
        wrongLoginElement.style.display = "none";
        if (
          username === serverSettings.username &&
          password === serverSettings.password
        ) {
          localStorage.setItem("admin", "true");
          enableAdminMode();
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("loginModal")
          );
          if (modal) modal.hide();
          else closeLoginModal();
          if (typeof initializeApplication === "function")
            initializeApplication();
        } else {
          wrongLoginElement.style.display = "block";
          setTimeout(() => {
            wrongLoginElement.style.display = "none";
          }, 3000);
        }
      });
  }

  return { initLogin, isAdmin, enableGuestMode, enableAdminMode };
})();
