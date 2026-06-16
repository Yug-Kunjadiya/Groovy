const express = require('express');
const { retrieveRelevantContext } = require('../services/retrieval');
const { getChatCompletion } = require('../services/openai');
const { getCurrentPdf, getConversationHistory, setConversationHistory } = require('../services/state');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ success: false, error: 'Question cannot be empty' });
    }

    const currentPdf = getCurrentPdf();
    if (!currentPdf) {
      return res.status(400).json({ 
        success: false, 
        error: 'No document has been uploaded. Please upload a PDF first.' 
      });
    }

    // 1. Retrieve matching chunks from ChromaDB
    const retrievedChunks = await retrieveRelevantContext(question, 5);

    if (retrievedChunks.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No relevant context could be retrieved. Please verify your vector database status.'
      });
    }

    // 2. Format context for prompt
    const docContext = retrievedChunks
      .map(c => `<page number="${c.metadata.pageNumber}">\n${c.text}\n</page>`)
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

    // 3. Call OpenAI chat service
    const history = getConversationHistory();
    const chatResult = await getChatCompletion(systemPrompt, question, history);

    const replyContent = chatResult.content;
    
    // 4. Extract sources and clean up the reply content
    let sources = [];
    let cleanAnswer = replyContent;
    const sourcesRegex = /<sources>\s*(\[.*?\])\s*<\/sources>/s;
    const match = replyContent.match(sourcesRegex);

    if (match) {
      try {
        sources = JSON.parse(match[1]);
        cleanAnswer = replyContent.replace(sourcesRegex, '').trim();
      } catch (e) {
        console.error('Error parsing sources JSON:', e);
      }
    }

    // Fallback scan if no sources parsed
    if (sources.length === 0) {
      const pageMentions = [...cleanAnswer.matchAll(/\[Page (\d+)\]/gi)];
      if (pageMentions.length > 0) {
        const uniquePages = [...new Set(pageMentions.map(m => parseInt(m[1])))];
        sources = uniquePages.sort((a, b) => a - b);
      }
    }

    // 5. Calculate pricing telemetry (gpt-4o-mini pricing: input: $0.15/M, output: $0.60/M)
    const { promptTokens, completionTokens, totalTokens } = chatResult.usage;
    const estimatedCost = (promptTokens * 0.00000015) + (completionTokens * 0.00000060);

    const telemetry = {
      promptTokens,
      responseTokens: completionTokens,
      totalTokens,
      estimatedCost: parseFloat(estimatedCost.toFixed(6))
    };

    // 6. Update local history
    const updatedHistory = [
      ...history,
      {
        question,
        answer: cleanAnswer,
        sources,
        telemetry
      }
    ];
    setConversationHistory(updatedHistory);

    res.json({
      answer: cleanAnswer,
      sources,
      telemetry
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while answering your question.'
    });
  }
});

module.exports = router;
