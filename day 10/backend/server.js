const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Set up Multer for in-memory file uploads
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

// In-memory application state
let currentPdf = null;
let conversationHistory = [];

/**
 * Custom PDF page renderer to extract text per page along with the page number.
 * pdf-parse calls this function for each page asynchronously.
 * We store pages in an array scoped to the request.
 */
function createPageRenderer(pageArray) {
  return function renderPage(pageData) {
    return pageData.getTextContent({
      normalizeWhitespace: true
    })
    .then(function(textContent) {
      const pageNum = pageData.pageNumber;
      const text = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pageArray[pageNum - 1] = {
        pageNumber: pageNum,
        text: text
      };
      
      return text;
    });
  };
}

// Check server status and current loaded document details
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    hasPdf: !!currentPdf,
    fileName: currentPdf ? currentPdf.filename : null,
    pages: currentPdf ? currentPdf.pages.length : 0,
    history: conversationHistory
  });
});

// Reset the active PDF and conversation history
app.post('/api/reset', (req, res) => {
  currentPdf = null;
  conversationHistory = [];
  res.json({
    success: true,
    message: 'System state reset successfully'
  });
});

// PDF Upload and parsing endpoint
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
    }

    const pages = [];
    const options = {
      pagerender: createPageRenderer(pages)
    };

    // Parse the PDF buffer
    await pdfParse(req.file.buffer, options);

    // Clean up empty slots in case of asynchronous ordering gaps
    const validPages = pages.filter(p => p !== undefined && p.text.length > 0);

    if (validPages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'PDF parsed successfully, but no readable text content was found.' 
      });
    }

    // Store in-memory
    currentPdf = {
      filename: req.file.originalname,
      pages: validPages
    };

    // Reset conversation history for the new document
    conversationHistory = [];

    res.json({
      success: true,
      pages: validPages.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to process PDF: ${error.message}`
    });
  }
});

// Q&A endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ success: false, error: 'Question cannot be empty' });
    }

    if (!currentPdf) {
      return res.status(400).json({ 
        success: false, 
        error: 'No document has been uploaded. Please upload a PDF first.' 
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Groq API Key is missing on the server. Please check environment variables.' 
      });
    }

    // Initialize Groq client
    const groq = new Groq({ apiKey });

    // Format the pages context for the system prompt
    const docContext = currentPdf.pages
      .map(p => `<page number="${p.pageNumber}">\n${p.text}\n</page>`)
      .join('\n\n');

    const systemPrompt = `You are "Smart Doc Q&A", a precise document assistant. Answer the user's question based strictly on the provided document pages.

Document content:
${docContext}

Instructions:
1. Base your answer strictly on the document text provided above. If the document does not contain the answer, say "I could not find the answer to this question in the uploaded document." and output empty sources.
2. Be factual, concise, and do not make up any information.
3. For each claim or fact you mention, you MUST cite the page number(s) you got the information from, using inline citations in the format [Page X].
4. At the very end of your response, you MUST provide a separate block containing ONLY the page numbers you cited as a JSON array of integers enclosed in a <sources> tag. Example: <sources>[7, 8]</sources> or <sources>[]</sources>. No text inside the tag besides the JSON array. Make sure this tag is on its own new line.
5. If multiple pages support your answer, list all of them in the array, e.g. [1, 2, 5]. Do not list pages that were not referenced.`;

    // Format local history for Anthropic's Messages API (only sending text)
    // The history stored in memory has cleaned answers (without the <sources> tag)
    // We send it to Anthropic directly.
    const messages = [];
    
    // Add existing history
    for (const chat of conversationHistory) {
      messages.push({ role: 'user', content: chat.question });
      messages.push({ role: 'assistant', content: chat.answer });
    }

    // Add current user question
    messages.push({ role: 'user', content: question });

    // Invoke Groq API
    // Using llama-3.3-70b-versatile as default
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    });

    const replyContent = response.choices[0].message.content;
    
    // Extract sources and clean up the reply content
    let sources = [];
    let cleanAnswer = replyContent;
    const sourcesRegex = /<sources>\s*(\[.*?\])\s*<\/sources>/s;
    const match = replyContent.match(sourcesRegex);

    if (match) {
      try {
        sources = JSON.parse(match[1]);
        // Remove the source block from the final answer text
        cleanAnswer = replyContent.replace(sourcesRegex, '').trim();
      } catch (e) {
        console.error('Error parsing sources JSON from response:', e);
      }
    }

    // If no sources were parsed but the text has page mentions, we can attempt a fallback scan
    if (sources.length === 0) {
      const pageMentions = [...cleanAnswer.matchAll(/\[Page (\d+)\]/gi)];
      if (pageMentions.length > 0) {
        const uniquePages = [...new Set(pageMentions.map(m => parseInt(m[1])))];
        sources = uniquePages.sort((a, b) => a - b);
      }
    }

    // Extract telemetry
    const promptTokens = response.usage.prompt_tokens;
    const responseTokens = response.usage.completion_tokens;
    const totalTokens = response.usage.total_tokens;
    
    // Calculate cost based on Groq llama-3.3-70b-versatile pricing:
    // $0.59 per million input tokens ($0.00000059/token)
    // $0.79 per million output tokens ($0.00000079/token)
    const estimatedCost = (promptTokens * 0.00000059) + (responseTokens * 0.00000079);

    const telemetry = {
      promptTokens,
      responseTokens,
      totalTokens,
      estimatedCost: parseFloat(estimatedCost.toFixed(6))
    };

    // Store in-memory history
    conversationHistory.push({
      question,
      answer: cleanAnswer,
      sources,
      telemetry
    });

    res.json({
      answer: cleanAnswer,
      sources,
      telemetry
    });

  } catch (error) {
    console.error('Ask error:', error);
    
    // Friendly error messaging for Groq integration issues
    let userFriendlyError = 'An error occurred while answering your question.';
    if (error.status === 401) {
      userFriendlyError = 'Authentication failed. Please check if your Groq API Key is valid.';
    } else if (error.status === 429) {
      userFriendlyError = 'Groq API rate limit exceeded. Please try again in a moment.';
    } else if (error.message && error.message.includes('API key')) {
      userFriendlyError = 'Invalid or missing API key. Please check your backend configuration.';
    } else {
      userFriendlyError = error.message || userFriendlyError;
    }

    res.status(500).json({
      success: false,
      error: userFriendlyError
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Smart Doc Q&A server running on http://localhost:${PORT}`);
});
