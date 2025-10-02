// Player list UI module
window.PlayerUI = (function () {
  const state = {
    lastSeenPlayers: {},
  };

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
        }')">Change GM</button>`,
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
      label: "Actions",
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

  function initializeColumnVisibility() {
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

    Object.keys(settings).forEach((key) => {
      const checkbox = document.getElementById(
        `col${key.charAt(0).toUpperCase() + key.slice(1)}`
      );
      if (checkbox) {
        checkbox.checked = settings[key];
        updateColumnVisibility(key, settings[key]);
      }
    });

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

    const toggleButton = document.getElementById("toggleColumnSettings");
    const toggleIcon = document.getElementById("toggleIcon");
    const content = document.getElementById("columnSettingsContent");
    const isExpanded =
      localStorage.getItem("playerlistSettingsExpanded") === "true";
    if (isExpanded) {
      content.style.display = "block";
      toggleIcon.classList.add("rotated");
    }
    toggleButton.addEventListener("click", function () {
      const isVisible = content.style.display !== "none";
      if (isVisible) {
        content.style.display = "none";
        toggleIcon.classList.remove("rotated");
        localStorage.setItem("playerlistSettingsExpanded", "false");
      } else {
        content.style.display = "block";
        toggleIcon.classList.add("rotated");
        localStorage.setItem("playerlistSettingsExpanded", "true");
      }
    });
  }

  async function renderPlayerTable() {
    const tbody = document.getElementById("playerTable");
    if (!tbody) return;
    const players = await window.Api.fetchPlayers();
    const now = Date.now();
    players.forEach((p) => {
      state.lastSeenPlayers[p.Name] = now;
    });
    const visibleColumns = playerTableColumns.filter(
      (col) =>
        !document.querySelector(`th.${col.class}`).classList.contains("hidden")
    );
    let html = "";
    const allNames = Object.keys(state.lastSeenPlayers);
    allNames.forEach((name) => {
      const p = players.find((x) => x.Name === name);
      const lastSeen = state.lastSeenPlayers[name];
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
        html += `<tr class="table-secondary"><td colspan="${visibleColumns.length}">${name} (reconnecting...)</td></tr>`;
      } else {
        delete state.lastSeenPlayers[name];
      }
    });
    if (visibleColumns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="1" class="text-center text-muted">No columns selected</td></tr>`;
    } else {
      tbody.innerHTML = html;
    }
  }

  function initNavigation() {
    let playerlistInterval;
    const nav = document.getElementById("navPlayerlist");
    if (!nav) return;
    nav.onclick = async function (e) {
      e.preventDefault();
      await renderPlayerTable();
      if (typeof showSection === "function") showSection("playerlist");
      initializeColumnVisibility();
      clearInterval(playerlistInterval);
      playerlistInterval = setInterval(renderPlayerTable, 500);
    };
  }

  function init() {
    initNavigation();
  }

  return { init, renderPlayerTable, initializeColumnVisibility };
})();
