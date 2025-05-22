const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(express.json()); // potrzebne do odbierania JSON-a

app.post('/upload', upload.single('myFile'), (req, res) => {
  const oldPath = req.file.path;
  const newPath = path.join('uploads', req.file.originalname);
  fs.renameSync(oldPath, newPath);
  res.redirect('/');
});

app.get('/files', (req, res) => {
  const files = fs.readdirSync('uploads');
  res.json(files);
});

app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
