// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { parseFile } from 'music-metadata';
import fs from 'fs';
import path from 'path';

const PORT  = Number(process.env.PORT) || 4000;
const HOST  = process.env.HOST ?? `http://localhost:${PORT}`;
const app   = express();
const prisma = new PrismaClient();

// CORS
app.use(cors({
  origin: ['https://soulpopmusic.netlify.app', 'http://localhost:5173'],
}));
app.use(express.json());

// ensure uploads dir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

/* ---------- Upload audio + metadata ---------- */
app.post('/songs/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });

  const meta = await parseFile(req.file.path).catch(() => ({} as any));
  const audioUrl = `${HOST}/uploads/${req.file.filename}`;

  res.json({
    title:  meta.common?.title  ?? path.parse(req.file.originalname).name,
    artist: meta.common?.artist ?? 'Unknown Artist',
    album:  meta.common?.album  ?? 'Unknown Album',
    year:   meta.common?.year   ?? new Date().getFullYear(),
    coverUrl: '',
    audioUrl,
  });
});

app.use('/uploads', express.static(uploadDir));

/* ---------- CRUD via Prisma ---------- */

// GET /songs?skip=0&take=20
app.get('/songs', async (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 20;
  const songs = await prisma.song.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
  res.json(songs);
});

// POST /songs
app.post('/songs', async (req, res) => {
  const song = await prisma.song.create({ data: req.body });
  res.status(201).json(song);
});

// PUT /songs/:id
app.put('/songs/:id', async (req, res) => {
  const id = Number(req.params.id);
  const song = await prisma.song.update({ where: { id }, data: req.body });
  res.json(song);
});

// DELETE /songs/:id
app.delete('/songs/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.song.delete({ where: { id } });
  res.status(204).end();
});

/* ---------- Health check ---------- */
app.get('/health', (_, res) => res.send('ok'));

/* ---------- Start ---------- */
app.listen(PORT, () =>
  console.log(`🎵  API ready → http://localhost:${PORT}`)
);
