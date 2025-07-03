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
      document.getElementById("log").textContent = text;
      // Automatisch nach unten scrollen:
      const logDiv = document.getElementById("log");
      logDiv.scrollTop = logDiv.scrollHeight;
    });
}

// Bereich-Umschaltung
document.getElementById("navConsole").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("consoleSection").style.display = "block";
  document.getElementById("dashboardSection").style.display = "none";
  updateConsoleOutput();
});

// Output regelmäßig aktualisieren, aber nur wenn Console sichtbar ist
setInterval(function () {
  if (document.getElementById("consoleSection").style.display === "block") {
    updateConsoleOutput();
  }
}, 2000);

async function fetchPlayers() {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      API_JSON_REQUEST: {
        Token: "PlayerToken",
        Type: "Status",
      },
    }),
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.Players || [];
}

async function renderPlayerTable() {
  const tbody = document.getElementById("playerTable");
  if (!tbody) return;
  tbody.innerHTML = "";
  const players = await fetchPlayers();
  players.forEach((c, i) => {
    tbody.innerHTML += `
          <tr>
            <td>${c.Name}</td>
            <td>${c.IPv4 ? "Online" : "Offline"}</td>
            <td>${c.Banned ? "Ja" : "Nein"}</td>
            <td>${c.Ignored ? "Ja" : "Nein"}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" onclick="toggleBan(${i})">${
      c.Banned ? "Entbannen" : "Bannen"
    }</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="toggleIgnore(${i})">${
      c.Ignored ? "Nicht ignorieren" : "Ignorieren"
    }</button>
              <button class="btn btn-sm btn-outline-info" onclick="showDetails(${i})">Details</button>
            </td>
          </tr>
        `;
  });
}

const logDiv = document.getElementById("log");
logDiv.textContent += "Neuer Log-Eintrag\n";
logDiv.scrollTop = logDiv.scrollHeight; // Scrollt automatisch nach unten

function showSection(section) {
  document.getElementById("dashboardSection").style.display =
    section === "dashboard" ? "block" : "none";
  document.getElementById("playerlistSection").style.display =
    section === "playerlist" ? "block" : "none";
  document.getElementById("featuresSection").style.display =
    section === "features" ? "block" : "none";
  document.getElementById("consoleSection").style.display =
    section === "console" ? "block" : "none";
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
}

document.getElementById("navDashboard").onclick = function (e) {
  e.preventDefault();
  showSection("dashboard");
  loadServerInfo();
};
document.getElementById("navPlayerlist").onclick = async function (e) {
  e.preventDefault();
  await renderPlayerTable();
  showSection("playerlist");
};
document.getElementById("navFeatures").onclick = function (e) {
  e.preventDefault();
  showSection("features");
};
document.getElementById("navConsole").onclick = function (e) {
  e.preventDefault();
  showSection("console");
  updateConsoleOutput();
};

async function loadServerInfo() {
  const box = document.getElementById("serverInfoBox");
  if (!box) return;
  try {
    const response = await fetch("/api/serverinfo");
    if (!response.ok) throw new Error("Fehler beim Laden der Serverdaten");
    const data = await response.json();
    box.innerHTML = `
      <b>Server-Address:</b> ${data.host}<br>
      <b>Port:</b> ${data.port}<br>
      <b>Max. Players:</b> ${data.maxPlayers}
    `;
  } catch (e) {
    box.innerHTML = "Serverdaten konnten nicht geladen werden.";
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
