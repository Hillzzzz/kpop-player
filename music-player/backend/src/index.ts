/*************************************************************************
 *  Simple in‑memory music API
 *  --------------------------------------------------
 *  POST   /songs/upload   → { title, artist, album, year, audioUrl }
 *  GET    /songs?skip&take
 *  POST   /songs          (create Song)
 *  PUT    /songs/:id      (update)
 *  DELETE /songs/:id
 *************************************************************************/

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { parseFile } from 'music-metadata';
import fs from 'fs';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST ?? `http://localhost:${PORT}`; // Railway sets HOST automatically

/*************************************************************************
 *  CORS
 *************************************************************************/
const allowed = new Set<string>([
  'http://localhost:5173',
  process.env.SOULPOP_ORIGIN ?? '',              // e.g. https://soulpopmusic.netlify.app
]);

const app = express();
app.use(
  cors({
    origin: [
      'https://soulpopmusic.netlify.app',   // your Netlify site
      'http://localhost:5173'              // local dev
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: false
  })
);


app.use(express.json());

/*************************************************************************
 *  Multer for uploads
 *************************************************************************/
const upload = multer({ dest: 'uploads/' });

/*************************************************************************
 *  Data model (in‑memory only)
 *************************************************************************/
interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  coverUrl?: string;
  audioUrl: string;
}

let songs: Song[] = [];
let nextId = 1;

/*************************************************************************
 *  Routes
 *************************************************************************/

// === 1. Upload MP3/WAV and return extracted metadata =============
app.post('/songs/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { path: tmpPath, originalname, filename } = req.file;
    const meta = await parseFile(tmpPath).catch(() => ({} as any));

    const title  = meta.common?.title  ?? path.parse(originalname).name;
    const artist = meta.common?.artist ?? 'Unknown Artist';
    const album  = meta.common?.album  ?? 'Unknown Album';
    const year   = meta.common?.year   ?? new Date().getFullYear();

    const audioUrl = `${HOST}/uploads/${filename}`;

    return res.json({ title, artist, album, year, audioUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({ error: 'Failed to process file' });
  }
});

// === 2. Serve uploaded files =====================================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// === 3. CRUD API ================================================

// paginated list
app.get('/songs', (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 20;
  res.json(songs.slice(skip, skip + take));
});

// create
app.post('/songs', (req, res) => {
  const song: Song = { id: nextId++, ...req.body };
  songs.push(song);
  res.status(201).json(song);
});

// update
app.put('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = songs.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  songs[index] = { ...songs[index], ...req.body };
  res.json(songs[index]);
});

// delete
app.delete('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  songs = songs.filter((s) => s.id !== id);
  res.status(204).end();
});

/*************************************************************************
 *  Start server
 *************************************************************************/
app.listen(PORT, () => {
  console.log(`🎵  API ready  →  ${HOST}`);
  console.log(`📂  Upload dir →  ${path.resolve('uploads')}`);
});
