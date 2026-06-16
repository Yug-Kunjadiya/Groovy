const { ChromaClient } = require('chromadb');
const { getEmbeddings } = require('./embeddings');
require('dotenv').config();

const chromaUrl = new URL(process.env.CHROMA_URL || 'http://localhost:8000');
const chromaClient = new ChromaClient({
  host: chromaUrl.hostname,
  port: chromaUrl.port ? parseInt(chromaUrl.port) : (chromaUrl.protocol === 'https:' ? 443 : 80),
  ssl: chromaUrl.protocol === 'https:'
});

async function retrieveRelevantContext(question, limit = 5) {
  // 1. Generate query embedding
  const queryEmbedding = await getEmbeddings(question);

  const collectionName = 'smart_doc_qa_collection';

  try {
    // 2. Get the collection
    const collection = await chromaClient.getCollection({
      name: collectionName
    });

    // 3. Query collection
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit
    });

    // 4. Format results
    const chunks = [];
    if (results && results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        chunks.push({
          text: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances ? results.distances[0][i] : null
        });
      }
    }

    return chunks;
  } catch (error) {
    console.error('Error during retrieval:', error);
    // If collection doesn't exist, return empty array
    return [];
  }
}

module.exports = {
  retrieveRelevantContext
};
