// Unified API wrappers
window.Api = (function () {
  async function postJson(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return res;
  }

  async function getJson(path) {
    const res = await fetch(path);
    if (!res.ok) return null;
    return res.json();
  }

  // Commands
  function execCommand(command) {
    return postJson("/commands/exec", { command });
  }

  // Players
  async function fetchPlayers() {
    const res = await getJson("/api/players");
    return res && res.Players ? res.Players : [];
  }

  // Server info
  async function fetchServerInfo() {
    return getJson("/api/serverinfo");
  }

  // Banlist
  async function fetchBanList() {
    return getJson("/api/banlist");
  }

  // Settings
  async function fetchSettings() {
    const res = await postJson("/api", { Type: "Settings" });
    if (!res.ok) return null;
    return res.json();
  }

  // Console output
  async function fetchConsoleOutput() {
    const res = await fetch("/commands/output");
    return res.ok ? res.text() : "";
  }

  return {
    postJson,
    getJson,
    execCommand,
    fetchPlayers,
    fetchServerInfo,
    fetchBanList,
    fetchSettings,
    fetchConsoleOutput,
  };
})();
