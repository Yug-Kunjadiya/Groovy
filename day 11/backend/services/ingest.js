const pdfParse = require('pdf-parse');
const { ChromaClient } = require('chromadb');
const { getEmbeddings } = require('./embeddings');
require('dotenv').config();

const chromaUrl = new URL(process.env.CHROMA_URL || 'http://localhost:8000');
const chromaClient = new ChromaClient({
  host: chromaUrl.hostname,
  port: chromaUrl.port ? parseInt(chromaUrl.port) : (chromaUrl.protocol === 'https:' ? 443 : 80),
  ssl: chromaUrl.protocol === 'https:'
});

/**
 * Custom PDF page renderer to extract text per page along with the page number.
 */
function createPageRenderer(pageArray) {
  return function renderPage(pageData) {
    return pageData.getTextContent({
      normalizeWhitespace: true
    })
      .then(function (textContent) {
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

/**
 * Split text into chunks of roughly maxChunkSize characters, with some overlap,
 * preserving the page number.
 */
function chunkText(pageText, pageNumber, maxChunkSize = 500, overlap = 50) {
  const chunks = [];
  let index = 0;

  if (pageText.length <= maxChunkSize) {
    return [{ text: pageText, pageNumber }];
  }

  while (index < pageText.length) {
    const chunk = pageText.substring(index, index + maxChunkSize);
    chunks.push({ text: chunk, pageNumber });
    index += (maxChunkSize - overlap);
  }

  return chunks;
}

async function ingestPdf(fileBuffer, filename) {
  const pages = [];
  const options = {
    pagerender: createPageRenderer(pages)
  };

  // 1. Parse the PDF
  await pdfParse(fileBuffer, options);
  const validPages = pages.filter(p => p !== undefined && p.text.length > 0);

  if (validPages.length === 0) {
    throw new Error('PDF parsed successfully, but no readable text content was found.');
  }

  // 2. Chunk the pages
  const allChunks = [];
  for (const page of validPages) {
    const pageChunks = chunkText(page.text, page.pageNumber);
    allChunks.push(...pageChunks);
  }

  // 3. Generate Embeddings for all chunks
  const chunkTexts = allChunks.map(c => c.text);
  const embeddings = await getEmbeddings(chunkTexts);

  // 4. Store in ChromaDB
  // Use a sanitised collection name
  const collectionName = 'smart_doc_qa_collection';

  // Get or create collection
  const collection = await chromaClient.getOrCreateCollection({
    name: collectionName
  });

  // Create unique IDs, metadatas, and documents arrays
  const ids = allChunks.map((_, idx) => `${filename}_p${allChunks[idx].pageNumber}_c${idx}`);
  const metadatas = allChunks.map(c => ({ pageNumber: c.pageNumber, filename }));
  const documents = chunkTexts;

  // Add/Upsert into collection
  await collection.upsert({
    ids,
    embeddings,
    metadatas,
    documents
  });

  return {
    pagesCount: validPages.length,
    chunksCount: allChunks.length,
    collectionName
  };
}

module.exports = {
  ingestPdf
};
