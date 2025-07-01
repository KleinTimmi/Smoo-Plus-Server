document.getElementById('consoleSendBtn').onclick = function(e) {
    // Falls du das Event brauchst: if (e) e.preventDefault();
    const input = document.getElementById('consoleInput');
    const command = input.value.trim();
    if (!command) return;
    fetch('/commands/exec', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({command})
    })
    .then(r => r.text())
    .then(() => {
        input.value = '';
    });
};

document.getElementById('consoleInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('consoleSendBtn').click();
    }
});

function updateConsoleOutput() {
    fetch('/commands/output')
        .then(r => r.text())
        .then(text => {
            document.getElementById('log').textContent = text;
            // Automatisch nach unten scrollen:
            const logDiv = document.getElementById('log');
            logDiv.scrollTop = logDiv.scrollHeight;
        });
}

// Bereich-Umschaltung
document.getElementById('navConsole').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('consoleSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    updateConsoleOutput();
});

// Output regelmäßig aktualisieren, aber nur wenn Console sichtbar ist
setInterval(function() {
    if (document.getElementById('consoleSection').style.display === 'block') {
        updateConsoleOutput();
    }
}, 2000);

const logDiv = document.getElementById('log');
logDiv.textContent += "Neuer Log-Eintrag\n";
logDiv.scrollTop = logDiv.scrollHeight; // Scrollt automatisch nach unten