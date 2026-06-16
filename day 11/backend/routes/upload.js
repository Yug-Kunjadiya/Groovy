const express = require('express');
const multer = require('multer');
const { ingestPdf } = require('../services/ingest');
const { setCurrentPdf, setConversationHistory } = require('../services/state');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
    }

    // Process PDF and ingest into ChromaDB
    const result = await ingestPdf(req.file.buffer, req.file.originalname);

    // Save in active session state
    setCurrentPdf({
      filename: req.file.originalname,
      pages: { length: result.pagesCount }
    });

    // Reset conversation history for the new document
    setConversationHistory([]);

    res.json({
      success: true,
      pages: result.pagesCount,
      chunks: result.chunksCount
    });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to process PDF: ${error.message}`
    });
  }
});

module.exports = router;
