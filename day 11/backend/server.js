const express = require('express');
const cors = require('cors');
const { getCurrentPdf, getConversationHistory, resetState } = require('./services/state');
const uploadRouter = require('./routes/upload');
const chatRouter = require('./routes/chat');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Register modular routers
app.use('/api/upload', uploadRouter);
app.use('/api/ask', chatRouter);

// Check server status and current loaded document details
app.get('/api/status', (req, res) => {
  const currentPdf = getCurrentPdf();
  res.json({
    success: true,
    hasPdf: !!currentPdf,
    fileName: currentPdf ? currentPdf.filename : null,
    pages: currentPdf ? currentPdf.pages.length : 0,
    history: getConversationHistory()
  });
});

// Reset the active session state
app.post('/api/reset', (req, res) => {
  resetState();
  res.json({
    success: true,
    message: 'System state reset successfully'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Smart Doc Q&A server running on http://localhost:${PORT}`);
});
