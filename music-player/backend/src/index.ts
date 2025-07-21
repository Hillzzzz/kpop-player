import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';
import dotenv from 'dotenv';
dotenv.config();

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  coverUrl?: string;
  audioUrl: string;
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(cors({
  origin: ['http://localhost:5173', 'https://kpop-player.vercel.app'],
}));
app.use(express.json());

// In-memory DB for simplicity (replace with DB if needed)
let songs: Song[] = [];
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

    const audioUrl = `${process.env.BASE_URL || `http://localhost:${PORT}`}/uploads/${filename}`;

    res.json({ title, artist, album, year, audioUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file.' });
  }
});

// Serve uploaded audio
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Song endpoints
app.get('/songs', (req, res) => {
  const skip = Number(req.query.skip || 0);
  const take = Number(req.query.take || 20);
  res.json(songs.slice(skip, skip + take));
});

app.post('/songs', (req, res) => {
  const song = { ...req.body, id: idCounter++ };
  songs.push(song);
  res.json(song);
});

app.put('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = songs.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  songs[index] = { ...songs[index], ...req.body };
  res.json(songs[index]);
});

app.delete('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  songs = songs.filter((s) => s.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
