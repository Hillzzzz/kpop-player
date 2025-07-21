import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { parseFile } from 'music-metadata';

// ---------- Types ----------
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  year: number;
  coverUrl?: string;
  audioUrl: string;
}

// ---------- App setup ----------
const app = express();
const PORT = Number(process.env.PORT) || 4000;

// CORS — add your Netlify URL
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://popmusicplayer.netlify.app', // ← change if your Netlify URL differs
    ],
  })
);
app.use(express.json());

// ---------- File upload ----------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

// ---------- In‑memory store ----------
let songs: Song[] = [];
let idCounter = 1;

// ---------- Routes ----------

// Upload audio file + extract metadata
app.post('/songs/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { path: filePath, originalname, filename } = req.file;
    const meta = await parseFile(filePath);

    const title = meta.common.title ?? path.parse(originalname).name;
    const artist = meta.common.artist ?? 'Unknown Artist';
    const album = meta.common.album ?? 'Unknown Album';
    const year = meta.common.year ?? new Date().getFullYear();

    // Build a public URL to the uploaded file
    const audioUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    res.json({ title, artist, album, year, audioUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file.' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// GET /songs  (paginated)
app.get('/songs', (req, res) => {
  const skip = Number(req.query.skip ?? 0);
  const take = Number(req.query.take ?? 20);
  res.json(songs.slice(skip, skip + take));
});

// POST /songs  (create)
app.post('/songs', (req, res) => {
  const song: Song = { ...req.body, id: idCounter++ };
  songs.push(song);
  res.status(201).json(song);
});

// PUT /songs/:id  (update)
app.put('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = songs.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  songs[idx] = { ...songs[idx], ...req.body };
  res.json(songs[idx]);
});

// DELETE /songs/:id
app.delete('/songs/:id', (req, res) => {
  const id = Number(req.params.id);
  songs = songs.filter((s) => s.id !== id);
  res.status(204).end();
});

// ---------- Start ----------
app.listen(PORT, () =>
  console.log(`🚀  Server running at http://localhost:${PORT}`)
);
