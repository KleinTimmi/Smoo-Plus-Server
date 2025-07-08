const stagesByKingdom = {
  Odyssey: ["HomeShipInsideStage"],
  "Cap Kingdom": [
    "CapWorldHomeStage",
    "CapWorldTowerStage",
    "PoisonWaveExStage",
    "PushBlockExStage",
    "FrogSearchExStage",
    "RollingExStage",
  ],
  "Cascade Kingdom": [
    "WaterfallWorldHomeStage",
    "TrexPoppunExStage",
    "WanwanClashExStage",
    "Lift2DExStage",
    "CapAppearExStage",
    "WindBlowExStage",
  ],
  "Sand Kingdom": [
    "SandWorldHomeStage",
    "SandWorldShopStage",
    "SandWorldSlotStage",
    "SandWorldCostumeStage",
    "SandWorldSecretStage",
    "SandWorldVibrationStage",
    "SandWorldPyramid000Stage",
    "SandWorldPyramid001Stage",
    "SandWorldUnderground000Stage",
    "SandWorldUnderground001Stage",
    "SandWorldPressExStage",
    "SandWorldMeganeExStage",
    "SandWorldKillerExStage",
    "SandWorldSphinxExStage",
    "SandWorldRotateExStage",
    "MeganeLiftExStage",
    "RocketFlowerExStage",
    "WaterTubeExStage",
  ],
  "Lake Kingdom": [
    "LakeWorldHomeStage",
    "LakeWorldShopStage",
    "GotogotonExStage",
    "FastenerExStage",
    "TrampolineWallCatchExStage",
    "FrogPoisonExStage",
  ],
  "Wodded Kingdom": [
    "ForestWorldHomeStage",
    "ForestWorldTowerStage",
    "ForestWorldBossStage",
    "ForestWorldWoodsStage",
    "ForestWorldWoodsCostumeStage",
    "ForestWorldWoodsTreasureStage",
    "ForestWorldBonusStage",
    "ForestWorldWaterExStage",
    "FogMountainExStage",
    "RailCollisionExStage",
    "ShootingElevatorExStage",
    "ForestWorldCloudBonusExStage",
    "PackunPoisonExStage",
    "AnimalChaseExStage",
    "KillerRoadExStage",
  ],
  "Cloud Kingdom": [
    "CloudWorldHomeStage",
    "FukuwaraiKuriboStage",
    "Cube2DExStage",
  ],
  "Lost Kingdom": [
    "ClashWorldHomeStage",
    "ClashWorldShopStage",
    "ImomuPoisonExStage",
    "JangoExStage",
  ],
  "City Kingdom": [
    "CityWorldHomeStage",
    "CityWorldShop01Stage",
    "CityWorldSandSlotStage",
    "CityWorldMainTowerStage",
    "CityWorldFactoryStage",
    "RadioControlExStage",
    "Note2D3DRoomExStage",
    "Theater2DExStage",
    "CityPeopleRoadStage",
    "ElectricWireExStage",
    "ShootingCityExStage",
    "CapRotatePackunExStage",
    "PoleGrabCeilExStage",
    "PoleKillerExStage",
    "TrexBikeExStage",
    "DonsukeExStage",
    "SwingSteelExStage",
    "BikeSteelExStage",
  ],
  "Snow Kingdom": [
    "SnowWorldHomeStage",
    "SnowWorldShopStage",
    "SnowWorldCostumeStage",
    "IceWalkerExStage",
    "SnowWorldTownStage",
    "SnowWorldLobby000Stage",
    "SnowWorldLobby001Stage",
    "SnowWorldRace000Stage",
    "SnowWorldRace001Stage",
    "SnowWorldRaceTutorialStage",
    "SnowWorldLobbyExStage",
    "SnowWorldRaceExStage",
    "SnowWorldRaceHardExStage",
    "IceWaterDashExStage",
    "IceWaterBlockExStage",
    "ByugoPuzzleExStage",
    "SnowWorldCloudBonusExStage",
    "KillerRailCollisionExStage",
  ],
  "Seaside Kingdom": [
    "SeaWorldHomeStage",
    "SeaWorldCostumeStage",
    "SeaWorldSecretStage",
    "SeaWorldVibrationStage",
    "SeaWorldUtsuboCaveStage",
    "SeaWorldSneakingManStage",
    "CloudExStage",
    "WaterValleyExStage",
    "SenobiTowerExStage",
    "ReflectBombExStage",
    "TogezoRotateExStage",
  ],
  "Luncheon Kingdom": [
    "LavaWorldHomeStage",
    "LavaWorldCostumeStage",
    "LavaWorldTreasureStage",
    "LavaWorldUpDownExStage",
    "LavaWorldBubbleLaneExStage",
    "ForkExStage",
    "LavaWorldExcavationExStage",
    "LavaWorldClockExStage",
    "GabuzouClockExStage",
    "CapAppearLavaLiftExStage",
    "LavaWorldFenceLiftExStage",
  ],
  "Ruin Kingdom": [
    "BossRaidWorldHomeStage",
    "DotTowerExStage",
    "BullRunExStage",
  ],
  "Bowser Kingdom": [
    "SkyWorldHomeStage",
    "SkyWorldShopStage",
    "SkyWorldCostumeStage",
    "SkyWorldTreasureStage",
    "TsukkunRotateExStage",
    "JizoSwitchExStage",
    "SkyWorldCloudBonusExStage",
    "KaronWingTowerStage",
    "TsukkunClimbExStage",
  ],
  "Moon Kingdom": [
    "MoonWorldHomeStage",
    "MoonWorldCaptureParadeStage",
    "MoonWorldWeddingRoomStage",
    "MoonWorldWeddingRoom2Stage",
    "MoonWorldKoopa1Stage",
    "MoonWorldKoopa2Stage",
    "Galaxy2DExStage",
    "MoonAthleticExStage",
  ],
  "Dark Side": [
    "Special1WorldHomeStage",
    "Special1WorldTowerStackerStage",
    "Special1WorldTowerBombTailStage",
    "Special1WorldTowerFireBlowerStage",
    "Special1WorldTowerCapThrowerStage",
    "KillerRoadNoCapExStage",
    "PackunPoisonNoCapExStage",
    "BikeSteelNoCapExStage",
    "ShootingCityYoshiExStage",
    "SenobiTowerYoshiExStage",
    "LavaWorldUpDownYoshiExStage",
  ],
  "Darker Side": [
    "Special2WorldHomeStage",
    "Special2WorldLavaStage",
    "Special2WorldCloudStage",
    "Special2WorldKoopaStage",
  ],
  "Peach Kingdom": [
    "PeachWorldHomeStage",
    "PeachWorldCastleStage",
    "PeachWorldShopStage",
    "PeachWorldCostumeStage",
    "FukuwaraiMarioStage",
    "PeachWorldPictureBossKnuckleStage",
    "PeachWorldPictureBossForestStage",
    "PeachWorldPictureMofumofuStage",
    "PeachWorldPictureGiantWanderBossStage",
    "PeachWorldPictureBossMagmaStage",
    "PeachWorldPictureBossRaidStage",
    "RevengeBossKnuckleStage",
    "RevengeForestBossStage",
    "RevengeMofumofuStage",
    "RevengeGiantWanderBossStage",
    "RevengeBossMagmaStage",
    "RevengeBossRaidStage",
    "YoshiCloudExStage",
    "DotHardExStage",
  ],
};

const stageToKingdom = {
  CapWorldHomeStage: "Cap Kingdom",
  SandWorldHomeStage: "Sand Kingdom",
  WaterfallWorldHomeStage: "Cascade Kingdom",
  LakeWorldHomeStage: "Lake Kingdom",
  ForestWorldHomeStage: "Wodded Kingdom",
  CloudWorldHomeStage: "Cloud Kingdom",
  CityWorldHomeStage: "City Kingdom",
  SnowWorldHomeStage: "Snow Kingdom",
  SeaWorldHomeStage: "Seaside Kingdom",
  LavaWorldHomeStage: "Luncheon Kingdom",
  BossRaidWorldHomeStage: "Ruin Kingdom",
  KoopaWorldHomeStage: "Bowser Kingdom",
  MoonWorldHomeStage: "Moon Kingdom",
  DarkWorldHomeStage: "Dark Side",
  DarkerWorldHomeStage: "Darker Side",
};

const kingdomToStage = {
  Odyssey: "HomeShipInsideStage",
  "Cap Kingdom": "CapWorldHomeStage",
  "Cascade Kingdom": "WaterfallWorldHomeStage",
  "Sand Kingdom": "SandWorldHomeStage",
  "Lake Kingdom": "LakeWorldHomeStage",
  "Wodded Kingdom": "ForestWorldHomeStage",
  "Cloud Kingdom": "CloudWorldHomeStage",
  "City Kingdom": "CityWorldHomeStage",
  "Snow Kingdom": "SnowWorldHomeStage",
  "Seaside Kingdom": "SeaWorldHomeStage",
  "Luncheon Kingdom": "LavaWorldHomeStage",
  "Ruin Kingdom": "BossRaidWorldHomeStage",
  "Bowser Kingdom": "KoopaWorldHomeStage",
  "Moon Kingdom": "MoonWorldHomeStage",
  "Dark Side": "DarkWorldHomeStage",
  "Darker Side": "DarkerWorldHomeStage",
};

const mapImages = {
  HomeShipInsideStage: "Odyssey.png",
  CapWorldHomeStage: "CapKingdom.png",
  WaterfallWorldHomeStage: "CascadeKingdom.png",
  SandWorldHomeStage: "SandKingdom.png",
  LakeWorldHomeStage: "LakeKingdom.png",
  ForestWorldHomeStage: "WoodedKingdom.png",
  CloudWorldHomeStage: "CloudKingdom.png",
  CityWorldHomeStage: "MetroKingdom.png",
  SnowWorldHomeStage: "SnowKingdom.png",
  SeaWorldHomeStage: "SeasideKingdom.png",
  LavaWorldHomeStage: "LuncheonKingdom.png",
  BossRaidWorldHomeStage: "RuinedKingdom.png",
  KoopaWorldHomeStage: "BowserKingdom.png",
  MoonWorldHomeStage: "MoonKingdom.png",
  DarkWorldHomeStage: "DarkSide.png",
  DarkerWorldHomeStage: "DarkerSide.png",
};

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

// Beim Laden der Seite Kingdom-Dropdowns befüllen und initialisieren
document.addEventListener("DOMContentLoaded", function () {
  fillKingdomDropdowns();

  // Ban Stage Dropdown initialisieren
  const kingdomSelect = document.getElementById("kingdomSelect");
  if (kingdomSelect) {
    kingdomSelect.dispatchEvent(new Event("change"));
  }

  // Send Player Dropdown initialisieren
  const sendKingdom = document.getElementById("sendKingdom");
  if (sendKingdom) {
    sendKingdom.dispatchEvent(new Event("change"));
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
  const response = await fetch("/api/players");
  if (!response.ok) return [];
  const data = await response.json();
  return data.Players || [];
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

async function renderPlayerTable() {
  const tbody = document.getElementById("playerTable");
  if (!tbody) return;
  const players = await fetchPlayers();
  const now = Date.now();

  // Update last seen
  players.forEach((p) => {
    lastSeenPlayers[p.Name] = now;
  });

  // Alle Spieler, die in den letzten 2 Sekunden gesehen wurden
  const allNames = Object.keys(lastSeenPlayers);
  let html = "";
  allNames.forEach((name) => {
    const p = players.find((x) => x.Name === name);
    const lastSeen = lastSeenPlayers[name];
    if (p) {
      // Spieler ist aktuell verbunden
      html += `
        <tr>
          <td>${p.Name}</td>
          <td>${getCapImg(p.Cap)}</td>
          <td>${getBodyImg(p.Body)}</td>
          <td>${getCaptureImg(p.Capture)}</td>
          <td>${p.GameMode || "-"}</td>
          <td>${p.Stage || "-"}</td>
          <td>${p.IPv4 || "-"}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger" onclick="toggleBan(${allNames.indexOf(
              name
            )})">${p.Banned ? "Entbannen" : "Bannen"}</button>
            <button class="btn btn-sm btn-outline-warning ms-1" onclick="crashPlayer('${
              p.Name
            }')">Crash</button>
            <button class="btn btn-sm btn-outline-primary ms-1" onclick="openTeleportModal('${
              p.Name
            }')">Teleport</button>
          </td>
        </tr>
      `;
    } else if (now - lastSeen < 2000) {
      // Spieler ist gerade erst verschwunden, noch anzeigen (ausgegraut)
      html += `<tr class="table-secondary"><td colspan="8">${name} (verbindet neu...)</td></tr>`;
    } else {
      // Spieler wirklich entfernen
      delete lastSeenPlayers[name];
    }
  });
  tbody.innerHTML = html;
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
  document.getElementById("mapSection").style.display =
    section === "map" ? "block" : "none";
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
}

document.getElementById("navDashboard").onclick = function (e) {
  e.preventDefault();
  showSection("dashboard");
  loadServerInfo();
};
let playerlistInterval;
document.getElementById("navPlayerlist").onclick = async function (e) {
  e.preventDefault();
  await renderPlayerTable();
  showSection("playerlist");
  clearInterval(playerlistInterval);
  playerlistInterval = setInterval(renderPlayerTable, 500); // alle 0,5 Sekunden aktualisieren
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
document.getElementById("navMap").onclick = function (e) {
  e.preventDefault();
  showSection("map");
  renderMap();
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
// Hilfsfunktion: infcapbouncePlayer Dropdown mit Spielern befüllen
async function fillInfCapBounceDropdown() {
  const select = document.getElementById("infcapbouncePlayer");
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

// Crash-Button Funktion
window.crashPlayer = function (name) {
  fetch("/commands/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: `crash ${name}` }),
  });
};

// Teleport-Modal HTML einfügen, falls nicht vorhanden
if (!document.getElementById("teleportModal")) {
  const modalHtml = `
    <div class="modal fade" id="teleportModal" tabindex="-1" aria-labelledby="teleportModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="teleportModalLabel">Teleport Spieler</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="teleportForm">
              <div class="mb-2">
                <label for="teleportKingdom" class="form-label">Kingdom</label>
                <select class="form-select" id="teleportKingdom">
                  <option value="Cap Kingdom">Cap Kingdom</option>
                  <option value="Cascade Kingdom">Cascade Kingdom</option>
                  <option value="Wodded Kingdom">Wodded Kingdom</option>
                </select>
              </div>
              <div class="mb-2">
                <label for="teleportStage" class="form-label">Stage</label>
                <select class="form-select" id="teleportStage"></select>
              </div>
              <div class="mb-2">
                <label for="teleportScenario" class="form-label">Scenario</label>
                <input type="number" class="form-control" id="teleportScenario" value="-1" min="-1" max="127" />
              </div>
              <input type="hidden" id="teleportPlayerName" />
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" id="teleportSendBtn">Teleportieren</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

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

// Teleport ausführen
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
    bootstrap.Modal.getInstance(
      document.getElementById("teleportModal")
    ).hide();
  };
  window.teleportModalHandlerAdded = true;
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
function getSavedTheme() {
  return localStorage.getItem("theme") || "system";
}
function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}
// Theme-Radio-Buttons
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
// Theme beim Laden setzen
setTheme(getSavedTheme());
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

async function renderMap() {
  const players = await fetchPlayers();
  console.log("selectedKingdom:", selectedKingdom);
  let stageName = kingdomToStage[selectedKingdom];
  console.log("stageName:", stageName);
  let mapFile = mapImages[stageName] || "CapWorld.png";
  console.log("mapFile:", mapFile);
  document.getElementById("mapImage").src = "images/map/" + mapFile;

  // Titel setzen
  document.getElementById("mapTitle").textContent = "Map – " + selectedKingdom;

  // Marker-Overlay leeren
  const markerDiv = document.getElementById("playerMarkers");
  markerDiv.innerHTML = "";

  // Nur Spieler im aktuellen Kingdom anzeigen
  players
    .filter((p) => stageToKingdom[p.Stage] === selectedKingdom)
    .forEach((p) => {
      if (p.PosX !== undefined && p.PosY !== undefined) {
        const bounds = mapBounds[stageName];
        if (bounds && p.PosX !== undefined && p.PosY !== undefined) {
          // X von Spielkoordinate auf Prozent im Bild
          let x = (p.PosX - bounds.minX) / (bounds.maxX - bounds.minX);
          let y = 1 - (p.PosY - bounds.minY) / (bounds.maxY - bounds.minY); // ggf. Y invertieren!
          let marker = document.createElement("div");
          marker.style.position = "absolute";
          marker.style.left = x * 100 + "%";
          marker.style.top = y * 100 + "%";
          marker.style.transform = "translate(-50%, -50%)";
          marker.style.width = "32px";
          marker.style.height = "32px";
          marker.innerHTML = `<img src="images/cap/${p.Cap}.png" title="${p.Name}" style="width:100%;border-radius:50%;">`;
          markerDiv.appendChild(marker);
        }
      }
    });

  if (!stageName) {
    console.error("Kein stageName für Kingdom:", selectedKingdom);
  }
  if (!mapImages[stageName]) {
    console.error("Kein Bild für stageName:", stageName);
  }
}

setInterval(function () {
  if (document.getElementById("mapSection").style.display === "block") {
    renderMap();
  }
}, 2000);

let lastSeenPlayers = {};
