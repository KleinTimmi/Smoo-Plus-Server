const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-szs', upload.single('szsfile'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded.');

  // Dateiname prüfen
  if (file.originalname === 'StageA.szs') {
    // Aktion A
    res.send('StageA.szs erkannt! Aktion A ausgeführt.');
  } else if (file.originalname === 'StageB.szs') {
    // Aktion B
    res.send('StageB.szs erkannt! Aktion B ausgeführt.');
  } else {
    // Standardaktion
    res.send('Andere SZS-Datei hochgeladen: ' + file.originalname);
  }
});

app.listen(3000, () => console.log('Server läuft auf Port 3000'));
