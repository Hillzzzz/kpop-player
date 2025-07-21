import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';

const app = express();
const PORT = 4000;
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: ['https://popmusicplayer.netlify.app', 'http://localhost:5173'],
}));
app.use(express.json());

// In-memory DB for simplicity
let songs = [];
let idCounter = 1;

// Upload audio and extract metadata
app.post('/songs/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { path: filePath, originalname, filename } = req.file;
    const metadata = await parseFile(filePath);

    const title = metadata.common.title || path.parse(originalname).name;
    const artist = metadata.common.artist || 'Unknown Artist';
    const album = metadata.common.album || 'Unknown Album';
    const year = metadata.common.year || new Date().getFullYear();

    const audioUrl = `http://localhost:${PORT}/uploads/${filename}`;

    res.json({ title, artist, album, year, audioUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file.' });
  }
});

// Serve uploaded audio
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// List songs (paginated)
app.get('/songs', (req, res) => {
  const skip = Number(req.query.skip || 0);
  const take = Number(req.query.take || 20);
  res.json(songs.slice(skip, skip + take));
});

// Add new song
app.post('/songs', (req, res) => {
  const song = { ...req.body, id: idCounter++ };
  songs.push(song);
  res.json(song);
});

// Update existing song
app.put('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = songs.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  songs[index] = { ...songs[index], ...req.body };
  res.json(songs[index]);
});

// Delete a song
app.delete('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  songs = songs.filter((s) => s.id !== id);
  res.status(204).end();
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

