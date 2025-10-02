// Map UI module
window.MapUI = (function () {
  async function renderMap() {
    const select = document.getElementById("mapKingdomSelect");
    const img = document.getElementById("mapImage");
    if (!select || !img) return;
    const selectedKingdom = select.value;
    const stageName =
      (window.GameConstants &&
        window.GameConstants.kingdomToStage[selectedKingdom]) ||
      "CapWorldHomeStage";
    const mapFile =
      (window.GameConstants && window.GameConstants.mapImages[stageName]) ||
      "CapKingdom.png";
    img.src = "images/map/" + mapFile;
  }

  function init() {
    const mapKingdomSelect = document.getElementById("mapKingdomSelect");
    if (mapKingdomSelect) {
      mapKingdomSelect.addEventListener("change", function () {
        renderMap();
      });
    }
    renderMap();
  }

  return { init, renderMap };
})();
