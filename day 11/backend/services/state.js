let currentPdf = null;
let conversationHistory = [];

module.exports = {
  getCurrentPdf: () => currentPdf,
  setCurrentPdf: (pdf) => { currentPdf = pdf; },
  getConversationHistory: () => conversationHistory,
  setConversationHistory: (history) => { conversationHistory = history; },
  resetState: () => {
    currentPdf = null;
    conversationHistory = [];
  }
};
