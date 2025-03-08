import express from 'express';
import multer from 'multer';
import path from 'path';
import { processUpload, getData, getHash } from '../services/fileProcessor.js';

const router = express.Router();
const upload = multer({ dest: 'storage/temp/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await processUpload(req.file);
    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File processing failed' });
  }
});

router.get('/data', async (req, res) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (error) {
    console.error('Data retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

router.get('/hash/:filename', async (req, res) => {
  try {
    const hash = await getHash(req.params.filename);
    res.json({ hash });
  } catch (error) {
    console.error('Hash retrieval error:', error);
    res.status(500).json({ error: 'Hash retrieval failed' });
  }
});

export { router };