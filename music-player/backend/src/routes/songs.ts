import { Router } from 'express';
import multer from 'multer';
import { parseFile } from 'music-metadata';
import path from 'path';
import fs from 'fs';

import { prisma } from '../utils/prisma';

const upload = multer({ dest: 'uploads/' });
export const songRouter = Router();

// Upload and extract metadata
songRouter.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { path: filePath, originalname, filename } = req.file;
    const metadata = await parseFile(filePath);

    const title = metadata.common.title || path.parse(originalname).name;
    const artist = metadata.common.artist || 'Unknown Artist';
    const album = metadata.common.album || 'Unknown Album';
    const year = metadata.common.year || new Date().getFullYear();
    const audioUrl = `${process.env.BASE_URL}/uploads/${filename}`;

    res.json({ title, artist, album, year, audioUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file.' });
  }
});

