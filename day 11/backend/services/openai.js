const { OpenAI } = require('openai');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey) {
  openai = new OpenAI({ apiKey });
}

async function getChatCompletion(systemPrompt, userQuestion, history = []) {
  if (!openai) {
    throw new Error('OpenAI API key is missing on the server. Please check your .env file.');
  }

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // Map history
  for (const chat of history) {
    messages.push({ role: 'user', content: chat.question });
    messages.push({ role: 'assistant', content: chat.answer });
  }

  messages.push({ role: 'user', content: userQuestion });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 1024,
    temperature: 0
  });

  return {
    content: response.choices[0].message.content,
    usage: {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    }
  };
}

module.exports = {
  getChatCompletion
};
