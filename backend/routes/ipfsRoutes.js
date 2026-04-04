const express = require('express');
const router = express.Router();
const multer = require('multer');
const ipfsService = require('../services/ipfsService');

const upload = multer();

// POST /api/ipfs/upload - Upload file to IPFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const result = await ipfsService.uploadToIPFS(fileBuffer, fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
