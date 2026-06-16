const { OpenAI } = require('openai');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey) {
  openai = new OpenAI({ apiKey });
}

async function getEmbeddings(texts) {
  if (!openai) {
    throw new Error('OpenAI API key is missing on the server. Please check your .env file.');
  }

  const isArray = Array.isArray(texts);
  const input = isArray ? texts : [texts];

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input
  });

  const embeddings = response.data.map(item => item.embedding);
  return isArray ? embeddings : embeddings[0];
}

module.exports = {
  getEmbeddings
};
