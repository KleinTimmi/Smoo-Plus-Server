const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const szsPath = '/path/to/uploaded.szs';
const extractDir = '/path/to/temp/extracted';
const imageExtensions = ['.png', '.jpg', '.jpeg', '.dds', '.bmp'];

exec(`wszst extract "${szsPath}" -d "${extractDir}"`, (err, stdout, stderr) => {
  if (err) {
    console.error('Fehler beim Entpacken:', stderr);
    return;
  }
  console.log('Entpacken abgeschlossen:', stdout);
  // Jetzt sind die Dateien in extractDir
  // Suche nach Bildern und verschiebe sie
});

function moveImagesToBinFolder(extractDir, binDir) {
  fs.readdirSync(extractDir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(extractDir, entry.name);
    if (entry.isDirectory()) {
      moveImagesToBinFolder(fullPath, binDir); // Rekursiv
    } else if (imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
      // Zielordner bestimmen (z.B. nach Typ oder Name)
      const targetDir = path.join(binDir, 'images');
      fs.ensureDirSync(targetDir);
      console.log(`Bild gefunden: ${fullPath} → ${path.join(targetDir, entry.name)}`);
      fs.moveSync(fullPath, path.join(targetDir, entry.name), { overwrite: true });
      console.log(`Bild verschoben: ${entry.name}`);
    }
  });
}

app.post('/api/upload-szs', upload.single('szsfile'), (req, res) => {
  const file = req.file;
  if (!file) {
    console.error('Kein File im Upload erhalten!');
    return res.status(400).send('No file uploaded.');
  }
  console.log('Datei empfangen:', file.originalname, '→', file.path);

  const szsPath = file.path;
  const extractDir = path.join(__dirname, 'temp', path.basename(szsPath, '.szs'));
  const binDir = path.join(__dirname, 'bin');

  console.log('Starte Entpacken:', szsPath, '→', extractDir);
  exec(`wszst extract "${szsPath}" -d "${extractDir}"`, (err) => {
    if (err) {
      console.error('Fehler beim Entpacken:', err);
      return res.status(500).send('Fehler beim Entpacken!');
    }
    console.log('Entpacken erfolgreich. Suche nach Bildern...');
    moveImagesToBinFolder(extractDir, binDir);
    console.log('Alle Bilder verschoben.');
    res.send('Bilder wurden extrahiert und verschoben!');
  });
});