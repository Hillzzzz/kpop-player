import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { parseFile } from 'music-metadata';
import fs from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

// ✅ Enable CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://kpop-player.vercel.app'
  ]
}));

// ✅ Health check route (optional)
app.get('/', (req, res) => {
  res.send('Backend is running.');
});

// ✅ Upload endpoint
app.post('/songs/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { path: filePath, originalname } = req.file;
    const metadata = await parseFile(filePath);

    const title = metadata.common.title || path.parse(originalname).name;
    const artist = metadata.common.artist || 'Unknown Artist';
    const album = metadata.common.album || 'Unknown Album';
    const year = metadata.common.year || new Date().getFullYear();

    // Optionally delete file to save space
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete uploaded file:', err);
    });

    return res.json({
      title,
      artist,
      album,
      year,
      message: 'Metadata extracted successfully',
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ error: 'Failed to process uploaded file.' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
