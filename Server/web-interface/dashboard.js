// --- Cap- und Body-Bildnamen (aus images/cap und images/body) ---
let lastSeenPlayers = {};

// Use centralized constants from GameConstants
let {
  caps,
  bodies,
  stagesByKingdom,
  stageToKingdom,
  kingdomToStage,
  mapImages,
} = window.GameConstants || {};

// stagesByKingdom, stageToKingdom, kingdomToStage, mapImages are supplied by GameConstants or fetched from server

// Global settings object
let serverSettings = {
  username: "admin",
  password: "admin",
};

// Function to fetch server settings
async function fetchServerSettings() {
  try {
    const response = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Type: "Settings",
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data && data.username && data.password) {
        // Store the credentials without logging them
        serverSettings.username = data.username;
        serverSettings.password = data.password;
        return true;
      } else {
        console.warn("Invalid response format, using default credentials");
        return false;
      }
    } else {
      const errorText = await response.text();
      console.warn(
        `Failed to fetch server settings (${response.status}):`,
        errorText
      );
      return false;
    }
  } catch (error) {
    console.error("Error fetching server settings:", error);
    return false;
  }
}

// Function to fetch stages from Mods
async function fetchStages() {
  try {
    const response = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Type: "Stages",
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data && data.stagesByKingdom) {
        // Update the global variables with fetched data
        stagesByKingdom = data.stagesByKingdom;
        stageToKingdom = data.stageToKingdom;
        kingdomToStage = data.kingdomToStage;
        mapImages = data.mapImages;
        return true;
      } else {
        console.warn("Invalid stages response format, using fallback");
        return false;
      }
    } else {
      const errorText = await response.text();
      console.warn(
        `Failed to fetch stages (${response.status}):`,
        errorText
      );
      return false;
    }
  } catch (error) {
    console.error("Error fetching stages:", error);
    return false;
  }
}

// Login Modal
function openLoginModal() {
  const modal = new bootstrap.Modal(document.getElementById("loginModal"));
  modal.show();
}

function closeLoginModal() {
  const modal = new bootstrap.Modal(document.getElementById("loginModal"));
  modal.hide();
}

// Initialize login functionality
async function initLogin() {
  // Show login modal immediately for better UX
  openLoginModal();

  // Try to load settings from server in the background
  const settingsLoaded = await fetchServerSettings();

  if (!settingsLoaded) {
    console.warn("Using default credentials (admin/admin)");
  }

  // Set up guest button
  document.getElementById("guestBtn").addEventListener("click", function () {
    localStorage.setItem("admin", "false");
    closeLoginModal();
    // Enable guest mode UI restrictions
    enableGuestMode();
  });

  // Set up login button
  document
    .getElementById("loginBtn")
    .addEventListener("click", async function (e) {
      e.preventDefault(); // Prevent form submission

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const wrongLoginElement = document.getElementById("wrongLogin");

      // Hide any previous error messages
      wrongLoginElement.style.display = "none";

      if (
        username === serverSettings.username &&
        password === serverSettings.password
      ) {
        localStorage.setItem("admin", "true");

        // Re-enable full UI for admin
        enableAdminMode();

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        );
        if (modal) {
          modal.hide();
        } else {
          closeLoginModal();
        }

        // Initialize the rest of the application after successful login
        initializeApplication();
      } else {
        wrongLoginElement.style.display = "block";

        // Auto-hide the error after 3 seconds
        setTimeout(() => {
          wrongLoginElement.style.display = "none";
        }, 3000);
      }
    });
}

// Initialize the login functionality when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the login system
  if (window.Auth && typeof window.Auth.initLogin === "function") {
    window.Auth.initLogin();
  } else {
    initLogin();
  }

  // Set up other event listeners and initialization code here
  initializeColumnVisibility();
  fillKingdomDropdowns();

  // Set theme
  if (window.Theme) {
    window.Theme.setTheme(window.Theme.getSavedTheme());
    window.Theme.init();
  }

  // Initialize the rest of the application
  initializeApplication();

  // If previously marked as guest, enforce guest mode
  if (localStorage.getItem("admin") === "false") {
    enableGuestMode();
  }
});

// Function to initialize the rest of the application after login
function initializeApplication() {
  // Add any additional initialization code here
  // This function will be called after successful login
}

// --- Access helpers ---
function isAdmin() {
  return localStorage.getItem("admin") === "true";
}

function enableGuestMode() {
  // Only show chat section
  showSection("chat");

  // Hide all nav items except Chat
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

  // Enable chat input for guests
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");
  if (chatInput) chatInput.disabled = false;
  if (chatSendBtn) chatSendBtn.disabled = false;

  // Keep settings FAB visible for guests (opens guest settings modal)
  const settingsFab = document.getElementById("settingsFab");
  if (settingsFab) settingsFab.style.display = "flex";
}

function enableAdminMode() {
  // Show all nav items
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

  // Show settings FAB
  const settingsFab = document.getElementById("settingsFab");
  if (settingsFab) settingsFab.style.display = "flex";

  // Default to dashboard view
  showSection("dashboard");
}

// --- Hilfsfunktionen ganz oben einfügen ---
function getSavedTheme() {
  return localStorage.getItem("theme") || "system";
}

function updateColumnVisibility(columnName, visible) {
  const className = `col-${columnName}`;
  const elements = document.querySelectorAll(`.${className}`);

  elements.forEach((element) => {
    if (visible) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  });
}

function initializeColumnVisibility() {
  // Gespeicherte Einstellungen laden
  const savedSettings = localStorage.getItem("playerlistColumns");
  const defaultSettings = {
    name: true,
    cap: true,
    body: true,
    capture: true,
    gamemode: true,
    stage: true,
    ip: true,
    actions: true,
  };

  const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

  // Checkboxen entsprechend setzen
  Object.keys(settings).forEach((key) => {
    const checkbox = document.getElementById(
      `col${key.charAt(0).toUpperCase() + key.slice(1)}`
    );
    if (checkbox) {
      checkbox.checked = settings[key];
      updateColumnVisibility(key, settings[key]);
    }
  });

  // Event-Listener für Checkboxen
  const checkboxes = [
    "colName",
    "colCap",
    "colBody",
    "colCapture",
    "colGameMode",
    "colStage",
    "colIP",
    "colActions",
  ];

  checkboxes.forEach((id) => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener("change", function () {
        const columnName = id.replace("col", "").toLowerCase();
        updateColumnVisibility(columnName, this.checked);
        saveColumnSettings();
      });
    }
  });

  // "Show all" Button
  document
    .getElementById("showAllColumns")
    .addEventListener("click", function () {
      checkboxes.forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
          checkbox.checked = true;
          const columnName = id.replace("col", "").toLowerCase();
          updateColumnVisibility(columnName, true);
        }
      });
      saveColumnSettings();
    });

  // "Hide all" Button
  document
    .getElementById("hideAllColumns")
    .addEventListener("click", function () {
      checkboxes.forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
          checkbox.checked = false;
          const columnName = id.replace("col", "").toLowerCase();
          updateColumnVisibility(columnName, false);
        }
      });
      saveColumnSettings();
    });

  // Toggle-Button für Ausklapp-Menü
  const toggleButton = document.getElementById("toggleColumnSettings");
  const toggleIcon = document.getElementById("toggleIcon");
  const content = document.getElementById("columnSettingsContent");

  // Gespeicherten Zustand laden
  const isExpanded =
    localStorage.getItem("playerlistSettingsExpanded") === "true";
  if (isExpanded) {
    content.style.display = "block";
    toggleIcon.classList.add("rotated");
  }

  toggleButton.addEventListener("click", function () {
    const isVisible = content.style.display !== "none";

    if (isVisible) {
      // Collapse
      content.style.display = "none";
      toggleIcon.classList.remove("rotated");
      localStorage.setItem("playerlistSettingsExpanded", "false");
    } else {
      // Expand
      content.style.display = "block";
      toggleIcon.classList.add("rotated");
      localStorage.setItem("playerlistSettingsExpanded", "true");
    }
  });
}

//dropdown menu logic
function fillKingdomDropdowns() {
  const kingdomNames = Object.keys(stagesByKingdom);
  const dropdownIds = ["kingdomSelect", "sendKingdom"];
  dropdownIds.forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = "";
    kingdomNames.forEach((kingdom) => {
      const opt = document.createElement("option");
      opt.value = kingdom;
      opt.textContent = kingdom;
      select.appendChild(opt);
    });
  });
}

// When the page is loaded, fill the Kingdom-Dropdowns and initialize
document.addEventListener("DOMContentLoaded", async function () {
  // Fetch stages from server
  const stagesFetched = await fetchStages();
  if (!stagesFetched) {
    console.warn("Using fallback stages from GameConstants");
  }

  // Kingdom-Dropdowns initialisieren
  fillKingdomDropdowns();

  // Ban Stage Dropdown initialisieren
  const kingdomSelect = document.getElementById("kingdomSelect");
  if (kingdomSelect) {
    kingdomSelect.addEventListener("change", function () {
      const kingdom = this.value;
      const stageSelect = document.getElementById("stageSelect");
      stageSelect.innerHTML = "";
      (stagesByKingdom[kingdom] || []).forEach((stage) => {
        const opt = document.createElement("option");
        opt.value = stage;
        opt.textContent = stage;
        stageSelect.appendChild(opt);
      });
    });
    kingdomSelect.dispatchEvent(new Event("change"));
  }

  // Send Player Dropdown initialisieren
  const sendKingdom = document.getElementById("sendKingdom");
  if (sendKingdom) {
    sendKingdom.addEventListener("change", function () {
      const kingdom = this.value;
      const stageSelect = document.getElementById("sendStage");
      stageSelect.innerHTML = "";
      (stagesByKingdom[kingdom] || []).forEach((stage) => {
        const opt = document.createElement("option");
        opt.value = stage;
        opt.textContent = stage;
        stageSelect.appendChild(opt);
      });
    });
    sendKingdom.dispatchEvent(new Event("change"));
  }

  // Settings-FAB-Button handled by Theme.init()

  // Theme logic initialized by Theme.init()

  // Initialize Map module
  if (window.MapUI && typeof window.MapUI.init === "function") {
    window.MapUI.init();
  } else {
    // Fallback
    renderMap();
  }
});

document.getElementById("consoleSendBtn").onclick = function (e) {
  const input = document.getElementById("consoleInput").value;
  fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: input }),
  })
    .then((r) => r.text())
    .then((result) => {
      updateConsoleOutput();
      document.getElementById("consoleInput").value = "";
    });
};

document
  .getElementById("consoleInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      document.getElementById("consoleSendBtn").click();
    }
  });

function updateConsoleOutput() {
  fetch("/commands/output")
    .then((r) => r.text())
    .then((text) => {
      const logEl = document.getElementById("log");
      if (!logEl) return;

      const escapeHtml = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const classify = (line) => {
        if (/error/i.test(line)) return "log-error";
        if (/warn/i.test(line)) return "log-warn";
        return "log-info";
      };

      const html = text
        .split("\n")
        .map(
          (line) => `<span class="${classify(line)}">${escapeHtml(line)}</span>`
        )
        .join("\n");

      logEl.innerHTML = html;
      logEl.scrollTop = logEl.scrollHeight;
    });
}
function fetchIp() {
  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("myIpBox").textContent =
        "Deine öffentliche IP: " + data.ip;
    });
}

// Section switch
document.getElementById("navConsole").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("consoleSection").style.display = "block";
  document.getElementById("dashboardSection").style.display = "none";
  updateConsoleOutput();
});

// Output regularly update, but only if Console is visible
setInterval(function () {
  if (document.getElementById("consoleSection").style.display === "block") {
    updateConsoleOutput();
  }
}, 2000);

async function fetchPlayers() {
  const response = await fetch("/api/players");
  if (!response.ok) return [];
  const data = await response.json();
  const realPlayers = data.Players || [];
  return realPlayers;
}

function getCapImg(capName) {
  if (!capName) return "-";
  return `<img src="images/cap/${capName}.png" alt="${capName}" class="outfit-img">`;
}

function getBodyImg(bodyName) {
  if (!bodyName) return "-";
  return `<img src="images/body/${bodyName}.png" alt="${bodyName}" class="outfit-img">`;
}

function getCaptureImg(captureName) {
  if (!captureName) return "-";
  return `<img src="images/capture/${captureName}.png" alt="${captureName}" class="outfit-img">`;
}

// Player Table Columns Definition (muss nach den Bildfunktionen stehen)
const playerTableColumns = [
  { key: "name", label: "Name", class: "col-name", render: (p) => p.Name },
  {
    key: "cap",
    label: "Cap",
    class: "col-cap",
    render: (p) => getCapImg(p.Cap),
  },
  {
    key: "body",
    label: "Body",
    class: "col-body",
    render: (p) => getBodyImg(p.Body),
  },
  {
    key: "capture",
    label: "Capture",
    class: "col-capture",
    render: (p) => getCaptureImg(p.Capture),
  },
  {
    key: "gamemode",
    label: "Game Mode",
    class: "col-gamemode",
    render: (p) => `
      ${p.GameMode || "-"}
      <button class="btn-gm btn btn-sm" onclick="openChangeGMModal('${
        p.Name
      }')">
        Change GM
      </button>`,
  },
  {
    key: "stage",
    label: "Stage",
    class: "col-stage",
    render: (p) => p.Stage || "-",
  },
  { key: "ip", label: "IP", class: "col-ip", render: (p) => p.IPv4 || "-" },
  {
    key: "actions",
    label: "Aktionen",
    class: "col-actions",
    render: (p, idx) => `
    <button class="btn btn-sm btn-outline-danger" onclick="toggleBan(${idx})">${
      p.Banned ? "Unban" : "Ban"
    }</button>
    <button class="btn btn-sm btn-outline-warning ms-1" onclick="crashPlayer('${
      p.Name
    }')">Crash</button>
    <button class="btn btn-sm btn-outline-primary ms-1" onclick="openTeleportModal('${
      p.Name
    }')">Teleport</button>
    <button class="btn btn-sm btn-outline-success ms-1" onclick="openParamEditor('${
      p.Name
    }')">Param Editor</button>
  `,
  },
];

async function renderPlayerTable() {
  const tbody = document.getElementById("playerTable");
  if (!tbody) return;
  const players = await fetchPlayers();
  const now = Date.now();

  // Update last seen
  players.forEach((p) => {
    lastSeenPlayers[p.Name] = now;
  });

  // Sichtbare Spalten bestimmen
  const visibleColumns = playerTableColumns.filter(
    (col) =>
      !document.querySelector(`th.${col.class}`).classList.contains("hidden")
  );

  let html = "";
  const allNames = Object.keys(lastSeenPlayers);
  allNames.forEach((name, idx) => {
    const p = players.find((x) => x.Name === name);
    const lastSeen = lastSeenPlayers[name];
    if (p) {
      html += `<tr>`;
      visibleColumns.forEach((col) => {
        html += `<td class="${col.class}">${col.render(
          p,
          allNames.indexOf(name)
        )}</td>`;
      });
      html += `</tr>`;
    } else if (now - lastSeen < 2000) {
      html += `<tr class="table-secondary"><td colspan="${visibleColumns.length}">${name} (verbindet neu...)</td></tr>`;
    } else {
      delete lastSeenPlayers[name];
    }
  });

  if (visibleColumns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="1" class="text-center text-muted">No columns selected</td></tr>`;
  } else {
    tbody.innerHTML = html;
  }
}

const logDiv = document.getElementById("log");
logDiv.textContent += "Neuer Log-Eintrag\n";
logDiv.scrollTop = logDiv.scrollHeight; // Scrollt automatisch nach unten

function showSection(section) {
  // If guest, force chat only
  if (!isAdmin() && section !== "chat") {
    section = "chat";
  }

  document.getElementById("dashboardSection").style.display =
    section === "dashboard" ? "block" : "none";
  document.getElementById("playerlistSection").style.display =
    section === "playerlist" ? "block" : "none";
  document.getElementById("featuresSection").style.display =
    section === "features" ? "block" : "none";
  document.getElementById("consoleSection").style.display =
    section === "console" ? "block" : "none";
  document.getElementById("mapSection").style.display =
    section === "map" ? "block" : "none";
  document.getElementById("chatSection").style.display =
    section === "chat" ? "block" : "none";
  // Active-Klasse setzen
  document
    .getElementById("navDashboard")
    .classList.toggle("active", section === "dashboard");
  document
    .getElementById("navPlayerlist")
    .classList.toggle("active", section === "playerlist");
  document
    .getElementById("navFeatures")
    .classList.toggle("active", section === "features");
  document
    .getElementById("navConsole")
    .classList.toggle("active", section === "console");
  document
    .getElementById("navMap")
    .classList.toggle("active", section === "map");
  document
    .getElementById("navChat")
    .classList.toggle("active", section === "chat");
}

document.getElementById("navDashboard").onclick = function (e) {
  e.preventDefault();
  showSection("dashboard");
  loadServerInfo();
};
let playerlistInterval;
// Delegate Playerlist navigation to PlayerUI
if (window.PlayerUI && typeof window.PlayerUI.init === "function") {
  window.PlayerUI.init();
}
document.getElementById("navFeatures").onclick = function (e) {
  e.preventDefault();
  showSection("features");
};
document.getElementById("navConsole").onclick = function (e) {
  e.preventDefault();
  showSection("console");
  updateConsoleOutput();
};
document.getElementById("navMap").onclick = function (e) {
  e.preventDefault();
  showSection("map");
  renderMap();
};
document.getElementById("navChat").onclick = function (e) {
  e.preventDefault();
  showSection("chat");
};

async function loadServerInfo() {
  const box = document.getElementById("serverInfoBox");
  if (!box) return;
  try {
    const response = await fetch("/api/serverinfo");
    if (!response.ok) throw new Error("Fehler beim Laden der Serverdaten");
    const data = await response.json();

    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((ipData) => {
        let addressLine = "";
        if (data.host && data.host !== "0.0.0.0") {
          addressLine = `<b>Server-Address:</b> ${data.host} / ${ipData.ip}<br>`;
        } else {
          addressLine = `<b>Server-Address:</b> ${ipData.ip}<br>`;
        }
        box.innerHTML = `
          ${addressLine}
          <b>Port:</b> ${data.port}<br>
          <b>Max. Players:</b> ${data.maxPlayers}
        `;
      });
  } catch (e) {
    box.innerHTML = "Server data could not be loaded.";
  }
}

document.addEventListener("DOMContentLoaded", loadServerInfo);

// Serverinfo regelmäßig aktualisieren (z.B. jede Sekunde)
setInterval(loadServerInfo, 1000); // 1000 ms = 1 Sekunde

// --- SERVERSTEUERUNG ---

// Restart Server
document.getElementById("restartBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "restartserver" }),
  });
};

// Load Settings
document.getElementById("loadSettingsBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "loadsettings" }),
  });
};

// Rejoin All
document.getElementById("rejoinAllBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "rejoin *" }),
  });
};

// Crash All
document.getElementById("crashAllBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "crash *" }),
  });
};

// Flip POV Buttons
document.getElementById("flipSelfBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "flip pov self" }),
  });
};
document.getElementById("flipOtherBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "flip pov others" }),
  });
};
document.getElementById("flipBothBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "flip pov both" }),
  });
};

//Shine Sync
document.getElementById("Shinetrue").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "shine set true" }),
  });
};
document.getElementById("Shinefalse").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "shine set false" }),
  });
};

// Scenario Merging
document.getElementById("mergeEnableBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "scenario merge true" }),
  });
};
document.getElementById("mergeDisableBtn").onclick = async function () {
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "scenario merge false" }),
  });
};

// Max Players setzen
document.getElementById("setMaxPlayersBtn").onclick = async function () {
  const value = document.getElementById("maxPlayersInput").value;
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `maxplayers ${value}` }),
  });
};

//Ban Stage
document.getElementById("banStageBtn").onclick = async function () {
  const stage = document.getElementById("stageSelect").value;
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `ban stage ${stage}` }),
  });
};

//Unban Stage
document.getElementById("unbanStageBtn").onclick = async function () {
  const stage = document.getElementById("stageSelect").value;
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `unban stage ${stage}` }),
  });
};

//Ban Stage dropdown
document
  .getElementById("kingdomSelect")
  .addEventListener("change", function () {
    const kingdom = this.value;
    const stageSelect = document.getElementById("stageSelect");
    stageSelect.innerHTML = "";
    (stagesByKingdom[kingdom] || []).forEach((stage) => {
      const opt = document.createElement("option");
      opt.value = stage;
      opt.textContent = stage;
      stageSelect.appendChild(opt);
    });
  });

// Hilfsfunktion: sendPlayer Dropdown mit aktiven Spielern befüllen
async function fillSendPlayerDropdown() {
  const select = document.getElementById("sendPlayer");
  if (!select) return;
  select.innerHTML = '<option value="All">All</option>';
  const players = await fetchPlayers();
  players.forEach((p) => {
    if (p.Name) {
      const opt = document.createElement("option");
      opt.value = p.Name;
      opt.textContent = p.Name;
      select.appendChild(opt);
    }
  });
}

// Beim Laden der Seite und beim Öffnen des Send Player Bereichs Dropdown befüllen

document.addEventListener("DOMContentLoaded", fillSendPlayerDropdown);
document
  .getElementById("navDashboard")
  .addEventListener("click", fillSendPlayerDropdown);
// Falls Features- oder Playerlist-Tab das Formular beeinflussen, ggf. auch dort aufrufen

//Send player dropdown
document.getElementById("sendKingdom").addEventListener("change", function () {
  const kingdom = this.value;
  const stageSelect = document.getElementById("sendStage");
  stageSelect.innerHTML = "";
  (stagesByKingdom[kingdom] || []).forEach((stage) => {
    const opt = document.createElement("option");
    opt.value = stage;
    opt.textContent = stage;
    stageSelect.appendChild(opt);
  });
});

//Send Player
// Das Formular abfangen, damit kein Reload passiert
const sendPlayerForm = document.getElementById("sendPlayerForm");
if (sendPlayerForm) {
  sendPlayerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    let player = document.getElementById("sendPlayer").value;
    if (player === "All") player = "*";
    const stage = document.getElementById("sendStage").value;
    const scenario = document.getElementById("sendScenario").value;
    await fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: `send ${stage} "" ${scenario} ${player}`,
      }),
    });
  });
}

//Ban List
async function updateBanLists() {
  try {
    const response = await fetch("/api/banlist");
    if (!response.ok) throw new Error("Fehler beim Laden der Ban-Liste");
    const data = await response.json();

    // Spieler-Ban-Liste anzeigen
    const playerList = document.getElementById("banListPlayers");
    if (playerList) {
      if (data.players && data.players.length > 0) {
        playerList.innerHTML = data.players
          .map(
            (p) =>
              `<li class=\"list-group-item d-flex justify-content-between align-items-center\">` +
              `<span><i class=\"bi bi-person-x-fill text-danger\"></i> ${p}</span>` +
              `<button class=\"btn btn-sm btn-outline-success\" onclick=\"unbanPlayer('${p}')\">Entbannen</button>` +
              `</li>`
          )
          .join("");
      } else {
        playerList.innerHTML =
          '<li class="list-group-item text-muted"><i>Keine Spieler gebannt</i></li>';
      }
    }

    // Stage-Ban-Liste anzeigen
    const stageList = document.getElementById("banListStages");
    if (stageList) {
      if (data.stages && data.stages.length > 0) {
        stageList.innerHTML = data.stages
          .map(
            (s) =>
              `<li class=\"list-group-item d-flex justify-content-between align-items-center\">` +
              `<span><i class=\"bi bi-flag-fill text-warning\"></i> ${s}</span>` +
              `<button class=\"btn btn-sm btn-outline-success\" onclick=\"unbanStage('${s}')\">Entbannen</button>` +
              `</li>`
          )
          .join("");
      } else {
        stageList.innerHTML =
          '<li class="list-group-item text-muted"><i>Keine Stages gebannt</i></li>';
      }
    }
  } catch (e) {
    document.getElementById("banListPlayers").innerHTML =
      '<li class="list-group-item text-danger">Fehler beim Laden!</li>';
    document.getElementById("banListStages").innerHTML =
      '<li class="list-group-item text-danger">Fehler beim Laden!</li>';
  }
}

window.unbanPlayer = function (player) {
  fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `unban player ${player}` }),
  }).then(updateBanLists);
};

window.unbanStage = function (stage) {
  fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `unban stage ${stage}` }),
  }).then(updateBanLists);
};

// Beim Laden der Seite Ban-Listen initialisieren
document.addEventListener("DOMContentLoaded", updateBanLists);
setInterval(updateBanLists, 500); // alle 0,5 Sekunden neu laden

window.toggleBan = async function (idx) {
  const players = await fetchPlayers();
  const player = players[idx];
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: `${player.Banned ? "unban" : "ban"} player ${player.Name}`,
    }),
  });
  renderPlayerTable();
};

//Features
//Dropdown mit Spielern befüllen
async function fillInfCapBounceDropdown() {
  const selects = document.querySelectorAll("select.player-dropdown");
  const players = await fetchPlayers();
  selects.forEach((select) => {
    select.innerHTML = '<option value="All">All</option>';
    players.forEach((p) => {
      if (p.Name) {
        const opt = document.createElement("option");
        opt.value = p.Name;
        opt.textContent = p.Name;
        select.appendChild(opt);
      }
    });
  });
}

// Beim Laden der Seite und beim Öffnen des Features-Bereichs Dropdown befüllen
document.addEventListener("DOMContentLoaded", fillInfCapBounceDropdown);
document
  .getElementById("navFeatures")
  .addEventListener("click", fillInfCapBounceDropdown);

//InfCapBounce True
document.getElementById("sendinfcapbounceTrue").onclick = async function () {
  let player = document.getElementById("infcapbouncePlayer").value;
  if (player === "All") player = "*";
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `infCapDive ${player} true` }),
  });
};

//InfCapBounce False
document.getElementById("sendinfcapbounceFalse").onclick = async function () {
  let player = document.getElementById("infcapbouncePlayer").value;
  if (player === "All") player = "*";
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `infCapDive ${player} false` }),
  });
};

//Noclip True
document.getElementById("sendnoclipTrue").onclick = async function () {
  let player = document.getElementById("noclipPlayer").value;
  if (player === "All") player = "*";
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `noclip ${player} true` }),
  });
};

//Noclip False
document.getElementById("sendnoclipFalse").onclick = async function () {
  let player = document.getElementById("noclipPlayer").value;
  if (player === "All") player = "*";
  await fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `noclip ${player} false` }),
  });
};

// Crash-Button Funktion
window.crashPlayer = function (name) {
  fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `crash ${name}` }),
  });
};

//Teleport Modal
// Kingdom- und Stage-Auswahl im Teleport-Modal befüllen
window.openTeleportModal = function (playerName) {
  document.getElementById("teleportPlayerName").value = playerName;
  const kingdomSelect = document.getElementById("teleportKingdom");
  const stageSelect = document.getElementById("teleportStage");
  // Kingdoms befüllen
  kingdomSelect.innerHTML = "";
  Object.keys(stagesByKingdom).forEach((kingdom) => {
    const opt = document.createElement("option");
    opt.value = kingdom;
    opt.textContent = kingdom;
    kingdomSelect.appendChild(opt);
  });
  // Stage-Auswahl initialisieren
  function updateTeleportStages() {
    const kingdom = kingdomSelect.value;
    stageSelect.innerHTML = "";
    (stagesByKingdom[kingdom] || []).forEach((stage) => {
      const opt = document.createElement("option");
      opt.value = stage;
      opt.textContent = stage;
      stageSelect.appendChild(opt);
    });
  }
  kingdomSelect.onchange = updateTeleportStages;
  updateTeleportStages();
  // Modal anzeigen
  const modal = new bootstrap.Modal(document.getElementById("teleportModal"));
  modal.show();
};

//Teleport ausführen
if (!window.teleportModalHandlerAdded) {
  document.getElementById("teleportSendBtn").onclick = async function () {
    const player = document.getElementById("teleportPlayerName").value;
    const stage = document.getElementById("teleportStage").value;
    const scenario = document.getElementById("teleportScenario").value;
    await fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: `send ${stage} "" ${scenario} ${player}`,
      }),
    });
    // Modal schließen
    closeTeleportModal();
  };
  window.teleportModalHandlerAdded = true;
}
//Teleport Modal Close
window.closeTeleportModal = function () {
  const modalEl = document.getElementById("teleportModal");
  const modal =
    bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
};

//To Player Button
document.getElementById("switchTpBtnP1").onclick = function () {
  const currentModalEl = document.getElementById("teleportModal");
  const currentModal =
    bootstrap.Modal.getInstance(currentModalEl) ||
    new bootstrap.Modal(currentModalEl);
  currentModalEl.addEventListener("hidden.bs.modal", function handler() {
    window.openTeleportPlayerModal();
    currentModalEl.removeEventListener("hidden.bs.modal", handler);
  });
  currentModal.hide();
};
document.getElementById("switchTpBtnP2").onclick = function () {
  const currentModalEl = document.getElementById("teleportCoordModal");
  const currentModal =
    bootstrap.Modal.getInstance(currentModalEl) ||
    new bootstrap.Modal(currentModalEl);
  currentModalEl.addEventListener("hidden.bs.modal", function handler() {
    window.openTeleportPlayerModal();
    currentModalEl.removeEventListener("hidden.bs.modal", handler);
  });
  currentModal.hide();
};

//To Stage Button
document.getElementById("switchTpBtnS1").onclick = function () {
  const currentModalEl = document.getElementById("teleportPlayerModal");
  const currentModal =
    bootstrap.Modal.getInstance(currentModalEl) ||
    new bootstrap.Modal(currentModalEl);
  currentModalEl.addEventListener("hidden.bs.modal", function handler() {
    window.openTeleportModal();
    currentModalEl.removeEventListener("hidden.bs.modal", handler);
  });
  currentModal.hide();
};
document.getElementById("switchTpBtnS2").onclick = function () {
  const currentModalEl = document.getElementById("teleportCoordModal");
  const currentModal =
    bootstrap.Modal.getInstance(currentModalEl) ||
    new bootstrap.Modal(currentModalEl);
  currentModalEl.addEventListener("hidden.bs.modal", function handler() {
    window.openTeleportModal();
    currentModalEl.removeEventListener("hidden.bs.modal", handler);
  });
  currentModal.hide();
};

//To Coordinates Button
document.getElementById("switchTpBtnC1").onclick = function () {
  const currentModalEl = document.getElementById("teleportModal");
  const currentModal =
    bootstrap.Modal.getInstance(currentModalEl) ||
    new bootstrap.Modal(currentModalEl);
  currentModalEl.addEventListener("hidden.bs.modal", function handler() {
    window.openTeleportCoordModal();
    currentModalEl.removeEventListener("hidden.bs.modal", handler);
  });
  currentModal.hide();
};
document.getElementById("switchTpBtnC2").onclick = function () {
  const currentModalEl = document.getElementById("teleportPlayerModal");
  const currentModal =
    bootstrap.Modal.getInstance(currentModalEl) ||
    new bootstrap.Modal(currentModalEl);
  currentModalEl.addEventListener("hidden.bs.modal", function handler() {
    window.openTeleportCoordModal();
    currentModalEl.removeEventListener("hidden.bs.modal", handler);
  });
  currentModal.hide();
};

// Player Teleport Modal
document.getElementById("teleportPlayerSendBtn").onclick = function () {
  //Logik Hinzufügen
  closeTeleportPlayerModal();
};

//Open Teleport Player Modal
window.openTeleportPlayerModal = function () {
  const modal = new bootstrap.Modal(
    document.getElementById("teleportPlayerModal")
  );
  modal.show();
};
//Teleport Player Modal Close
window.closeTeleportPlayerModal = function () {
  const modalEl = document.getElementById("teleportPlayerModal");
  const modal =
    bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
};
//Teleport Coordinate Modal
document.getElementById("teleportCoordSendBtn").onclick = function () {
  //Logik Hinzufügen
  closeTeleportCoordModal();
};

//Open Teleport Coordinate Modal
window.openTeleportCoordModal = function () {
  const modal = new bootstrap.Modal(
    document.getElementById("teleportCoordModal")
  );
  modal.show();
};
//Teleport Coordinate Modal Close
window.closeTeleportCoordModal = function () {
  const modalEl = document.getElementById("teleportCoordModal");
  const modal =
    bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
};

// Funktion zum Öffnen des Change GM Modals
window.openChangeGMModal = function (playerName) {
  document.getElementById(
    "changeGMModalLabel"
  ).textContent = `Change Game Mode for ${playerName}`;

  // Initialize game status options based on current game mode selection
  updateGameStatusOptions();

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("changeGMModal"));
  modal.show();

  // Event-Listener für den "Change Game Mode" Button im Modal
  document.getElementById("changeGMBtn").onclick = function () {
    const selectedGameMode = document.getElementById("gameModeSelect").value;
    const selectedGameStatus = document.getElementById("Gm-Status").value;
    changeGameMode(playerName, selectedGameMode, selectedGameStatus);
    modal.hide();
  };

  // Add event listener to handle game mode selection and show/hide appropriate game status options
  document.getElementById("gameModeSelect").onchange = function () {
    updateGameStatusOptions();
  };
};

// Function to update game status options based on selected game mode
function updateGameStatusOptions() {
  const gameModeSelect = document.getElementById("gameModeSelect");
  const gameStatusSelect = document.getElementById("Gm-Status");

  if (!gameModeSelect || !gameStatusSelect) return;

  const selectedGameMode = gameModeSelect.value;
  const options = gameStatusSelect.querySelectorAll("option");

  // Hide all options first
  options.forEach((option) => {
    option.style.display = "none";
    option.disabled = true;
  });

  // Show relevant options based on game mode
  if (selectedGameMode === "notChange") {
    // Don't show any options if game mode is "notChange"
    return;
  } else if (selectedGameMode === "hns") {
    // Hide and Seek
    // Show Seeker and Hider
    const seekerOption = gameStatusSelect.querySelector(
      '.hns-option[value="seeker"]'
    );
    const hiderOption = gameStatusSelect.querySelector(
      '.hns-option[value="hider"]'
    );
    if (seekerOption) {
      seekerOption.style.display = "block";
      seekerOption.disabled = false;
    }
    if (hiderOption) {
      hiderOption.style.display = "block";
      hiderOption.disabled = false;
    }
    gameStatusSelect.value = "notChange";
  } else if (selectedGameMode === "sardine") {
    // Sardine
    // Show Can and Sardine
    const sardineOption = gameStatusSelect.querySelector(
      '.snh-option[value="sardine"]'
    );
    const canOption = gameStatusSelect.querySelector(
      '.snh-option[value="can"]'
    );
    if (sardineOption) {
      sardineOption.style.display = "block";
      sardineOption.disabled = false;
    }
    if (canOption) {
      canOption.style.display = "block";
      canOption.disabled = false;
    }
    // Set default to Runner
    gameStatusSelect.value = "notChange";
  } else if (selectedGameMode === "freeze") {
    // Freeze Tag
    // Show Chaser
    const chaserOption = gameStatusSelect.querySelector(
      '.freeze-option[value="chaser"]'
    );
    const runnerOption = gameStatusSelect.querySelector(
      '.freeze-option[value="runner"]'
    );
    if (chaserOption) {
      chaserOption.style.display = "block";
      chaserOption.disabled = false;
    }
    if (runnerOption) {
      runnerOption.style.display = "block";
      runnerOption.disabled = false;
    }
    // Set default to Chaser
    gameStatusSelect.value = "notChange";
  }
}

// Global function to change game mode and status
window.changeGameMode = async function (
  playerName,
  newGameMode,
  newGameStatus
) {
  // Only send game mode if not 'notChange'
  if (newGameMode && newGameMode !== "notChange") {
    await fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: `gamemode ${playerName} ${newGameMode}`,
      }),
    });
  }
  // Only send tag/status if not 'notChange'
  if (newGameStatus && newGameStatus !== "notChange") {
    if (
      newGameStatus === "seeker" ||
      newGameStatus === "chaser" ||
      newGameStatus === "can"
    ) {
      newGameStatus = true;
    } else if (
      newGameStatus === "hider" ||
      newGameStatus === "runner" ||
      newGameStatus === "sardine"
    ) {
      newGameStatus = false;
    }
    await fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: `tag seeking ${newGameMode} ${playerName} ${newGameStatus}`,
      }),
    });
  }
  // Optionally, refresh the player table or UI here if needed
  if (typeof renderPlayerTable === "function") {
    renderPlayerTable();
  }
};

// Modal für Parameter-Editor ist bereits im HTML vorhanden, daher nicht dynamisch erstellen

// Lebens- und Münzanzeige für das Param-Modal (Segment-Kreis, Herz, Zahl, Münze, interaktiv)
function renderLifeAndCoinSVG(lives, coins) {
  // Nur noch die Münzenanzeige als SVG, das Herz wird durch renderLifeSVG ersetzt
  const coinIcon = `<circle cx="15" cy="20" r="10" fill="#ffe066" stroke="#bfa600" stroke-width="3" /><text x="15" y="25" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#bfa600">C</text>`;
  const coinText = `<text id="coinScrubber" x="35" y="27" text-anchor="start" font-size="22" font-family="Arial" font-weight="bold" fill="white" style="cursor:ew-resize;user-select:none;">${coins
    .toString()
    .padStart(4, "0")}</text>`;
  const coinLine = `<rect x="15" y="32" width="55" height="4" rx="2" fill="white" />`;
  return `
    <div style="position:absolute;top:18px;right:24px;z-index:10;display:flex;gap:18px;align-items:center;">
      <div style="background:rgba(30,30,35,0.95);border-radius:18px;padding:8px 18px 8px 8px;min-width:110px;box-shadow:0 2px 8px #0006;display:flex;align-items:center;">
        <svg width="70" height="38" viewBox="0 0 70 38">
          ${coinIcon}
          ${coinText}
          ${coinLine}
        </svg>
      </div>
      <div id="lifeSVGContainer">${renderLifeSVG(lives)}</div>
    </div>
  `;
}
function renderCoinSVG(coins) {
  // Münzenanzeige (SVG-Icon, Zahl, Strich, Zahl ist interaktiv)
  const coinIcon = `<circle cx="15" cy="20" r="10" fill="#ffe066" stroke="#bfa600" stroke-width="3" /><text x="15" y="25" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#bfa600">C</text>`;
  const coinText = `<text id="coinScrubber" x="45" y="27" text-anchor="start" font-size="22" font-family="Arial" font-weight="bold" fill="white" style="cursor:ew-resize;user-select:none;">${coins
    .toString()
    .padStart(4, "0")}</text>`;
  const coinLine = `<rect x="15" y="32" width="75" height="4" rx="2" fill="white" />`;
  return `
    <div style="background:rgba(30,30,35,0.95);border-radius:18px;padding:8px 24px 8px 8px;min-width:140px;box-shadow:0 2px 8px #0006;display:flex;align-items:center;">
      <svg width="100" height="38" viewBox="0 0 100 38">
        ${coinIcon}
        ${coinText}
        ${coinLine}
      </svg>
    </div>
  `;
}
// Interaktive Scrubber-Logik für Leben und Münzen (robust, immer nach Render aufrufen)
function setupScrubbers() {
  const lifeText = document.getElementById("lifeScrubber");
  const coinText = document.getElementById("coinScrubber");
  // Vorherige Listener entfernen
  if (lifeText) {
    lifeText.onmousedown = null;
    lifeText.onclick = null;
    let startY, startVal;
    let dragging = false;
    lifeText.onmousedown = function (e) {
      dragging = true;
      startY = e.clientY;
      startVal = parseInt(document.getElementById("paramLives").value) || 0;
      document.body.style.cursor = "ns-resize";
      function move(ev) {
        let diff = Math.round((startY - ev.clientY) / 8);
        let newVal = Math.max(0, Math.min(6, startVal + diff));
        document.getElementById("paramLives").value = newVal;
        document.getElementById("paramLifeSVG").innerHTML =
          renderLifeSVG(newVal);
        setupScrubbers();
      }
      function up() {
        dragging = false;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        document.body.style.cursor = "";
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
    // Fallback: Klick auf Zahl → Prompt
    lifeText.onclick = function (e) {
      if (!dragging) {
        let val = prompt(
          "Leben eingeben (0-6):",
          document.getElementById("paramLives").value
        );
        if (val !== null) {
          let newVal = Math.max(0, Math.min(6, parseInt(val) || 0));
          document.getElementById("paramLives").value = newVal;
          document.getElementById("paramLifeSVG").innerHTML =
            renderLifeSVG(newVal);
          setupScrubbers();
        }
      }
    };
  }
  if (coinText) {
    coinText.onmousedown = null;
    coinText.onclick = null;
    let startX, startVal;
    let dragging = false;
    coinText.onmousedown = function (e) {
      dragging = true;
      startX = e.clientX;
      startVal = parseInt(document.getElementById("paramCoins").value) || 0;
      document.body.style.cursor = "ew-resize";
      function move(ev) {
        let diff = Math.round((ev.clientX - startX) / 6);
        let newVal = Math.max(0, Math.min(9999, startVal + diff));
        document.getElementById("paramCoins").value = newVal;
        document.getElementById("paramCoinSVG").innerHTML =
          renderCoinSVG(newVal);
        setupScrubbers();
      }
      function up() {
        dragging = false;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        document.body.style.cursor = "";
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
    // Fallback: Klick auf Zahl → Prompt
    coinText.onclick = function (e) {
      if (!dragging) {
        let val = prompt(
          "Münzen eingeben (0-9999):",
          document.getElementById("paramCoins").value
        );
        if (val !== null) {
          let newVal = Math.max(0, Math.min(9999, parseInt(val) || 0));
          document.getElementById("paramCoins").value = newVal;
          document.getElementById("paramCoinSVG").innerHTML =
            renderCoinSVG(newVal);
          setupScrubbers();
        }
      }
    };
  }
}
// Funktion zum Öffnen des Parameter-Editors
window.openParamEditor = async function (playerName) {
  // Modal-HTML muss im DOM sein
  const modalEl = document.getElementById("paramEditorModal");
  if (!modalEl) {
    alert(
      "Error: The parameter modal could not be found. Please reload the page."
    );
    return;
  }

  document.getElementById("paramPlayerName").value = playerName;

  // Spielerwerte laden
  const players = await fetchPlayers();
  const player = players.find((p) => p.Name === playerName);

  if (player) {
    // Coins, Leben, Speed, Jump High setzen
    document.getElementById("paramCoins").value = player.Coins || 0;
    document.getElementById("paramLives").value = player.Lives || 3;
    document.getElementById("paramSpeed").value = player.Speed || 1.0;
    document.getElementById("paramJumpHeight").value = player.JumpHeight || 1.0;

    // Koordinaten setzen (falls vorhanden)
    const coordsElement = document.getElementById("paramCoords");
    if (coordsElement) {
      coordsElement.value =
        player.PosX !== undefined && player.PosY !== undefined
          ? `${player.PosX}, ${player.PosY}`
          : "";
    }

    // Cap/Body Dropdowns befüllen
    await fillCapAndBodyDropdowns(
      player.Cap || "Mario",
      player.Body || "Mario"
    );

    // Ausgewählte Werte setzen
    document.getElementById("paramCap").value = player.Cap || "Mario";
    document.getElementById("paramBody").value = player.Body || "Mario";

    // Vorschau-Bilder aktualisieren
    const capPreviewImg = document.getElementById("capPreviewImg");
    const bodyPreviewImg = document.getElementById("bodyPreviewImg");

    if (capPreviewImg) {
      capPreviewImg.src = `images/cap/${player.Cap || "Mario"}.png`;
    }
    if (bodyPreviewImg) {
      bodyPreviewImg.src = `images/body/${player.Body || "Mario"}.png`;
    }

    // Dropdown-Änderung aktualisiert Vorschau
    document.getElementById("paramCap").onchange = function () {
      if (capPreviewImg) {
        capPreviewImg.src = `images/cap/${this.value}.png`;
      }
    };
    document.getElementById("paramBody").onchange = function () {
      if (bodyPreviewImg) {
        bodyPreviewImg.src = `images/body/${this.value}.png`;
      }
    };
  }

  //Coin Set Button
  document.getElementById("coinsSetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    const coins = document.getElementById("paramCoins").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `coins ${player} ${coins}` }),
    });
  };

  //Give 9999 coins
  document.getElementById("coinsGiveBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `coins ${player} 9999` }),
    });
  };

  //Reset coins to 0
  document.getElementById("coinsResetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `coins ${player} 0` }),
    });
  };

  //Lives Set Button
  document.getElementById("livesSetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    const lives = document.getElementById("paramLives").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `health ${player} ${lives}` }),
    });
  };

  // Life Up Heart Button
  const lifeUpHeartBtn = document.getElementById("lifeUpHeartBtn");
  if (lifeUpHeartBtn) {
    lifeUpHeartBtn.onclick = function () {
      const player = document.getElementById("paramPlayerName").value;
      fetch("/commands/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: `health ${player} 6` }),
      });
    };
  }

  // Player Kill Button
  const playerKillBtn = document.getElementById("playerKillBtn");
  if (playerKillBtn) {
    playerKillBtn.onclick = function () {
      const player = document.getElementById("paramPlayerName").value;
      fetch("/commands/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: `health ${player} 0` }),
      });
    };
  }

  //Outfit Set Button
  document.getElementById("outfitSetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    const cap = document.getElementById("paramCap").value;
    const body = document.getElementById("paramBody").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `setoutfit ${player} ${body} ${cap}` }),
    });
  };

  //Speed Set Button
  document.getElementById("speedSetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    const speed = document.getElementById("paramSpeed").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `speed ${player} ${speed}` }),
    });
  };

  //Jump Height Set Button
  document.getElementById("jumpSetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    const jump = document.getElementById("paramJumpHeight").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `jumpheight ${player} ${jump}` }),
    });
  };

  //Speed Reset Button
  document.getElementById("speedResetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `speed ${player} 1.0` }),
    });
  };

  //Jump Reset Button
  document.getElementById("jumpResetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `jumpheight ${player} 1.0` }),
    });
  };

  // Modal anzeigen
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Event-Listener für das Leben- und Münzen-Feld, um SVG zu aktualisieren
  if (!window.paramLifeSVGHandlerAdded) {
    document.addEventListener("input", function (e) {
      if (
        e.target &&
        (e.target.id === "paramLives" || e.target.id === "paramCoins")
      ) {
        const lives =
          parseInt(document.getElementById("paramLives").value) || 0;
        const coins =
          parseInt(document.getElementById("paramCoins").value) || 0;
        document.getElementById("paramLifeSVG").innerHTML =
          renderLifeSVG(lives);
        document.getElementById("paramCoinSVG").innerHTML =
          renderCoinSVG(coins);
        setupScrubbers();
      }
    });
    window.paramLifeSVGHandlerAdded = true;
  }
  // Senden-Button im Parameter-Editor
  if (!window.paramEditorHandlerAdded) {
    document.getElementById("paramEditorSendBtn").onclick = async function () {
      const player = document.getElementById("paramPlayerName").value;
      const lives = document.getElementById("paramLives").value;
      const coins = document.getElementById("paramCoins").value;
      const cap = document.getElementById("paramCap").value;
      const body = document.getElementById("paramBody").value;
      const speed = document.getElementById("paramSpeed").value;
      const jumpHeight = document.getElementById("paramJumpHeight").value;

      // Modal schließen
      bootstrap.Modal.getInstance(
        document.getElementById("paramEditorModal")
      ).hide();

      // Spielertabelle aktualisieren
      renderPlayerTable();
    };
    window.paramEditorHandlerAdded = true;
  }

  // Theme-Settings-Button und Modal
  const settingsFab = document.getElementById("settingsFab");
  if (settingsFab) {
    settingsFab.onclick = function () {
      const modal = new bootstrap.Modal(document.getElementById("themeModal"));
      // Aktuelles Theme im Modal auswählen
      const theme = getSavedTheme();
      document.getElementById("themeDark").checked = theme === "dark";
      document.getElementById("themeLight").checked = theme === "light";
      document.getElementById("themeSystem").checked = theme === "system";
      modal.show();
    };
  }

  // Theme-Wechsel-Logik
  function setTheme(theme) {
    document.body.classList.remove("theme-dark", "theme-light");
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
    } else if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      // System: je nach prefers-color-scheme
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("theme-dark");
      } else {
        document.body.classList.add("theme-light");
      }
    }
  }

  function saveTheme(theme) {
    localStorage.setItem("theme", theme);
  }

  // Theme beim Laden setzen
  setTheme(getSavedTheme());

  // Theme-Radio-Buttons Event-Listener
  ["themeDark", "themeLight", "themeSystem"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = function () {
        if (el.checked) {
          saveTheme(el.value);
          setTheme(el.value);
        }
      };
    }
  });

  // System-Theme-Änderung beachten
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function () {
      if (getSavedTheme() === "system") setTheme("system");
    });

  let selectedKingdom = document.getElementById("mapKingdomSelect").value;
  document
    .getElementById("mapKingdomSelect")
    .addEventListener("change", function () {
      selectedKingdom = this.value;
      renderMap();
    });

  setInterval(function () {
    if (document.getElementById("mapSection").style.display === "block") {
      renderMap();
    }
  }, 2000);

  // Lebensanzeige-Overlay oben rechts
  function renderLifeOverlay(lives) {
    const filterId = "glowLifeOverlay"; // oder: "glowLifeOverlay" + Math.random().toString(36).substr(2, 5);
    const maxLives = 6;
    const segs = 6;
    const r = 44;
    const ringWidth = 14;
    const totalLength = 2 * Math.PI * r;
    const segLength = totalLength / segs;
    const gap = segLength * 0.1;
    const dash = segLength - gap;

    // Farbwechsel
    let ringColor = "#00e600";
    let glowColor = "#00ff00";
    if (lives === 2) {
      ringColor = "#ffe066";
      glowColor = "#ffe066";
    }
    if (lives === 1) {
      ringColor = "#ff3c28";
      glowColor = "#ff3c28";
    }

    // Dasharray für die Segmente
    let dashArrayFilled = [];
    for (let i = 0; i < segs; i++) {
      if (i < lives) {
        dashArrayFilled.push(dash, gap);
      } else {
        dashArrayFilled.push(0, dash + gap);
      }
    }

    // Herz und Zahl
    const heart = `<path d="M50 72 Q28 52 40 34 Q50 20 60 34 Q72 52 50 72 Z" fill="white" stroke="black" stroke-width="3"/>`;
    const lifeText = `
    <text x="50" y="60" text-anchor="middle" font-size="34" font-family="Arial" font-weight="bold" fill="white" opacity="0.7" stroke="white" stroke-width="3">${lives}</text>
    <text x="50" y="60" text-anchor="middle" font-size="34" font-family="Arial" font-weight="bold" fill="black">${lives}</text>
  `;

    // SVG mit Glow-Filter
    return `
    <div style="width:100px;height:100px;">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <filter id="${filterId}" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${glowColor}" flood-opacity="0.7"/>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="${r}" stroke="#222" stroke-width="${ringWidth}" fill="none"/>
        <circle
          cx="50" cy="50" r="${r}"
          stroke="${ringColor}"
          stroke-width="${ringWidth}"
          fill="none"
          stroke-dasharray="${dashArrayFilled.join(",")}"
          stroke-dashoffset="0"
          transform="rotate(-90 50 50)"
          filter="url(#${filterId})"
        />
        ${heart}
        ${lifeText}
      </svg>
    </div>
  `;
  }
  async function updateLifeOverlay() {
    const overlay = document.getElementById("lifeOverlay");
    if (!overlay) return;
    const players = await fetchPlayers();
    if (!players.length) {
      overlay.innerHTML = "";
      return;
    }
    const lives = players[0].Lives || 0;
    overlay.innerHTML = renderLifeOverlay(lives);
  }
  setInterval(updateLifeOverlay, 1000);

  // --- Hilfsfunktion: Bild-Dropdown für Cap/Body ---
  function makeImageDropdown(selectId, images, selectedValue, folder) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.style.display = "none"; // Verstecke das echte Dropdown

    // Container für das Custom-Dropdown
    let custom = document.getElementById(selectId + "_imgdropdown");
    if (!custom) {
      custom = document.createElement("div");
      custom.id = selectId + "_imgdropdown";
      custom.className = "img-dropdown";
      custom.style.position = "relative";
      select.parentNode.insertBefore(custom, select.nextSibling);
    }
    custom.innerHTML = "";

    // Aktuell gewähltes Bild anzeigen
    let current = images.find((img) => img === selectedValue) || images[0];
    const currentDiv = document.createElement("div");
    currentDiv.className = "img-dropdown-current";
    currentDiv.style.cursor = "pointer";
    currentDiv.style.display = "flex";
    currentDiv.style.alignItems = "center";
    currentDiv.style.gap = "8px";
    currentDiv.style.border = "1px solid #444";
    currentDiv.style.borderRadius = "6px";
    currentDiv.style.background = "#23232a";
    currentDiv.style.padding = "2px 8px";
    currentDiv.innerHTML = `<img src="images/${folder}/${current}.png" style="height:32px;"> <span style="color:#fff;">${current}</span>`;
    custom.appendChild(currentDiv);

    // Das "Dropdown"-Menü (unsichtbar bis Klick)
    const menu = document.createElement("div");
    menu.className = "img-dropdown-menu";
    menu.style.position = "absolute";
    menu.style.left = "0";
    menu.style.top = "140%";
    menu.style.background = "#23232a";
    menu.style.border = "1px solid #444";
    menu.style.borderRadius = "6px";
    menu.style.boxShadow = "0 2px 8px #0008";
    menu.style.zIndex = "1000";
    menu.style.display = "none";
    menu.style.minWidth = "120px";
    menu.style.maxHeight = "500px";
    menu.style.overflowY = "auto";
    images.forEach((img) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "8px";
      item.style.padding = "4px 8px";
      item.style.cursor = "pointer";
      item.innerHTML = `<img src="images/${folder}/${img}.png" style="height:28px;"> <span style="color:#fff;">${img}</span>`;
      if (img === current) item.style.background = "#393a5a";
      item.onclick = function () {
        select.value = img;
        select.dispatchEvent(new Event("change"));
        menu.style.display = "none";
        makeImageDropdown(selectId, images, img, folder); // neu rendern
      };
      menu.appendChild(item);
    });
    custom.appendChild(menu);

    // Klick auf das aktuelle Bild öffnet das Menü
    currentDiv.onclick = function (e) {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
      e.stopPropagation();
    };
    // Klick außerhalb schließt das Menü
    document.addEventListener("click", function closeMenu(e) {
      if (!custom.contains(e.target)) {
        menu.style.display = "none";
        document.removeEventListener("click", closeMenu);
      }
    });
  }

  // --- Outfit-Dropdown für Parameter-Editor (mit Bildern) ---
  async function fillCapAndBodyDropdowns(selectedCap, selectedBody) {
    const capSelect = document.getElementById("paramCap");
    const bodySelect = document.getElementById("paramBody");
    if (!capSelect || !bodySelect) return;
    capSelect.innerHTML = "";
    bodySelect.innerHTML = "";
    caps.forEach((cap) => {
      const opt = document.createElement("option");
      opt.value = cap;
      opt.textContent = cap;
      if (cap === selectedCap) opt.selected = true;
      capSelect.appendChild(opt);
    });
    bodies.forEach((body) => {
      const opt = document.createElement("option");
      opt.value = body;
      opt.textContent = body;
      if (body === selectedBody) opt.selected = true;
      bodySelect.appendChild(opt);
    });
    // Custom Image-Dropdowns erzeugen
    makeImageDropdown("paramCap", caps, selectedCap, "cap");
    makeImageDropdown("paramBody", bodies, selectedBody, "body");
    // Vorschau
    const preview = document.getElementById("outfitPreview");
    function updatePreview() {
      if (!preview) return;
      preview.innerHTML = `
      <img src="images/cap/${capSelect.value}.png" style="height:48px;">
      <img src="images/body/${bodySelect.value}.png" style="height:48px;">
    `;
    }
    capSelect.onchange = updatePreview;
    bodySelect.onchange = updatePreview;
    updatePreview();
  }

  const dropZone = document.getElementById("szsDropZone");
  const fileInput = document.getElementById("szsFileInput");

  // Klick auf Dropzone öffnet Dateiauswahl
  dropZone.addEventListener("click", () => fileInput.click());

  // Drag & Drop Events
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      dropZone.textContent = e.dataTransfer.files[0].name;
    }
  });

  // Wenn Datei per Dialog gewählt wird, zeige Name an
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      dropZone.textContent = fileInput.files[0].name;
    } else {
      dropZone.textContent = "Drag file here or click";
    }
  });

  // --- Spalten-Ein-/Ausblendung für Playerlist ---
  function initializeColumnVisibility() {
    // Gespeicherte Einstellungen laden
    const savedSettings = localStorage.getItem("playerlistColumns");
    const defaultSettings = {
      name: true,
      cap: true,
      body: true,
      capture: true,
      gamemode: true,
      stage: true,
      ip: true,
      actions: true,
    };

    const settings = savedSettings
      ? JSON.parse(savedSettings)
      : defaultSettings;

    // Checkboxen entsprechend setzen
    Object.keys(settings).forEach((key) => {
      const checkbox = document.getElementById(
        `col${key.charAt(0).toUpperCase() + key.slice(1)}`
      );
      if (checkbox) {
        checkbox.checked = settings[key];
        updateColumnVisibility(key, settings[key]);
      }
    });

    // Event-Listener für Checkboxen
    const checkboxes = [
      "colName",
      "colCap",
      "colBody",
      "colCapture",
      "colGameMode",
      "colStage",
      "colIP",
      "colActions",
    ];

    checkboxes.forEach((id) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.addEventListener("change", function () {
          const columnName = id.replace("col", "").toLowerCase();
          updateColumnVisibility(columnName, this.checked);
          saveColumnSettings();
        });
      }
    });

    // "Show all" Button
    document
      .getElementById("showAllColumns")
      .addEventListener("click", function () {
        checkboxes.forEach((id) => {
          const checkbox = document.getElementById(id);
          if (checkbox) {
            checkbox.checked = true;
            const columnName = id.replace("col", "").toLowerCase();
            updateColumnVisibility(columnName, true);
          }
        });
        saveColumnSettings();
      });

    // "Hide all" Button
    document
      .getElementById("hideAllColumns")
      .addEventListener("click", function () {
        checkboxes.forEach((id) => {
          const checkbox = document.getElementById(id);
          if (checkbox) {
            checkbox.checked = false;
            const columnName = id.replace("col", "").toLowerCase();
            updateColumnVisibility(columnName, false);
          }
        });
        saveColumnSettings();
      });

    // Toggle-Button für Ausklapp-Menü
    const toggleButton = document.getElementById("toggleColumnSettings");
    const toggleIcon = document.getElementById("toggleIcon");
    const content = document.getElementById("columnSettingsContent");

    // Gespeicherten Zustand laden
    const isExpanded =
      localStorage.getItem("playerlistSettingsExpanded") === "true";
    if (isExpanded) {
      content.style.display = "block";
      toggleIcon.classList.add("rotated");
    }

    toggleButton.addEventListener("click", function () {
      const isVisible = content.style.display !== "none";

      if (isVisible) {
        // Collapse
        content.style.display = "none";
        toggleIcon.classList.remove("rotated");
        localStorage.setItem("playerlistSettingsExpanded", "false");
      } else {
        // Expand
        content.style.display = "block";
        toggleIcon.classList.add("rotated");
        localStorage.setItem("playerlistSettingsExpanded", "true");
      }
    });
  }

  function saveColumnSettings() {
    const settings = {
      name: document.getElementById("colName").checked,
      cap: document.getElementById("colCap").checked,
      body: document.getElementById("colBody").checked,
      capture: document.getElementById("colCapture").checked,
      gamemode: document.getElementById("colGameMode").checked,
      stage: document.getElementById("colStage").checked,
      ip: document.getElementById("colIP").checked,
      actions: document.getElementById("colActions").checked,
    };

    localStorage.setItem("playerlistColumns", JSON.stringify(settings));
  }

  // Universelle Funktion: Alle Selects mit .player-dropdown befüllen
  async function fillAllPlayerDropdowns() {
    const selects = document.querySelectorAll("select.player-dropdown");
    const players = await fetchPlayers();
    selects.forEach((select) => {
      const currentValue = select.value;
      select.innerHTML = '<option value="All">All</option>';
      players.forEach((p) => {
        if (p.Name) {
          const opt = document.createElement("option");
          opt.value = p.Name;
          opt.textContent = p.Name;
          select.appendChild(opt);
        }
      });
      // Auswahl beibehalten, falls möglich
      if ([...select.options].some((opt) => opt.value === currentValue)) {
        select.value = currentValue;
      }
    });
  }

  // Beim Laden der Seite und beim Öffnen des Features-Bereichs Dropdowns befüllen
  document.addEventListener("DOMContentLoaded", fillAllPlayerDropdowns);

  // Features-Navigation Event-Listener kombinieren
  const navFeaturesElement = document.getElementById("navFeatures");
  if (navFeaturesElement) {
    // Vorherige Event-Listener entfernen
    navFeaturesElement.removeEventListener("click", fillAllPlayerDropdowns);

    // Neuer kombinierter Event-Listener
    navFeaturesElement.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("features");
      fillAllPlayerDropdowns();

      // Kurz warten bis DOM aktualisiert ist
      setTimeout(() => {
        if (!featuresInitialized) {
          initializeDraggableFeatures();
          featuresInitialized = true;
        }
      }, 100);
    });
  }

  // Nach dem Rendern prüfen, ob alle Spalten ausgeblendet sind
  function checkAllColumnsHidden() {
    const visibleColumns = [
      "col-name",
      "col-cap",
      "col-body",
      "col-capture",
      "col-gamemode",
      "col-stage",
      "col-ip",
      "col-actions",
    ].filter(
      (cls) => !document.querySelector(`th.${cls}`).classList.contains("hidden")
    );
    const table = document.querySelector("#playerTable").closest("table");
    const thead = table.querySelector("thead");
    if (visibleColumns.length === 0) {
      // Kopfzeile und alle Zeilen ausblenden, nur Info anzeigen
      thead.style.display = "none";
      document.getElementById(
        "playerTable"
      ).innerHTML = `<tr><td colspan="8" class="text-center text-muted">No columns selected</td></tr>`;
    } else {
      // Kopfzeile wieder anzeigen
      thead.style.display = "";
    }
  }
  checkAllColumnsHidden();

  // Scrubber-Funktion für Zahleneingabefelder im Param-Editor
  function enableScrubber(
    inputId,
    step = 1,
    min = null,
    max = null,
    decimals = 0
  ) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.style.cursor = "ew-resize";

    // Vorherige Listener entfernen (damit es nicht mehrfach gebunden wird)
    input.onmousedown = null;

    input.onmousedown = function (e) {
      let startX = e.clientX;
      let startVal = parseFloat(input.value) || 0;
      document.body.style.cursor = "ew-resize";

      function move(ev) {
        let diff = Math.round((ev.clientX - startX) / 5);
        let newVal = startVal + diff * step;
        if (min !== null) newVal = Math.max(min, newVal);
        if (max !== null) newVal = Math.min(max, newVal);
        if (decimals > 0) newVal = parseFloat(newVal.toFixed(decimals));
        input.value = newVal;
        input.dispatchEvent(new Event("change"));
      }
      function up() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        document.body.style.cursor = "";
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
  }

  // Enable Scrubber for relevant fields when opening the Param-Editor
  const oldOpenParamEditor = window.openParamEditor;
  window.openParamEditor = async function (playerName) {
    await oldOpenParamEditor(playerName);
    enableScrubber("paramCoins", 1, 0, 9999, 0);
    enableScrubber("paramLives", 1, 0, 6, 0);
    enableScrubber("paramSpeed", 0.01, 0.1, null, 2);
    enableScrubber("paramJumpHeight", 0.01, 0.1, null, 2);
  };

  document.getElementById("jumpSetBtn").onclick = function () {
    const player = document.getElementById("paramPlayerName").value;
    const jump = document.getElementById("paramJumpHeight").value;
    fetch("/commands/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `jumpheight ${player} ${jump}` }),
    });
  };
};

// Verschiebe renderMap in den globalen Scope
async function renderMap() {
  const players = await fetchPlayers();
  let selectedKingdom = document.getElementById("mapKingdomSelect").value;
  let stageName = kingdomToStage[selectedKingdom];
  let mapFile = mapImages[stageName] || "CapKingdom.png";
  document.getElementById("mapImage").src = "images/map/" + mapFile;
}
