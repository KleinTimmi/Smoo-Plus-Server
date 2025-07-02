document.getElementById('consoleSendBtn').onclick = function(e) {
    const input = document.getElementById('consoleInput').value;
    fetch('/commands/exec', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ command: input })
    })
    .then(r => r.text())
    .then(result => {
        updateConsoleOutput();
        document.getElementById('consoleInput').value = '';
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