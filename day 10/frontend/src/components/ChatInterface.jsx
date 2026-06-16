import React, { useEffect, useRef, useState } from 'react';
import { Send, FileText, Sparkles, User, ShieldAlert } from 'lucide-react';
import TelemetryBadge from './TelemetryBadge';

export default function ChatInterface({ chatHistory, isLoading, onAsk }) {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    onAsk(question);
    setQuestion('');
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Format inline citations e.g. [Page 5] into styled inline badges
  const renderTextWithCitations = (text) => {
    if (!text) return '';
    
    // Split on [Page X] patterns
    const parts = text.split(/(\[Page \d+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[Page (\d+)\]/i);
      if (match) {
        const pageNum = match[1];
        return (
          <span 
            key={index} 
            className="citation-chip"
            title={`Cited from Page ${pageNum}`}
          >
            Pg {pageNum}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="chat-container">
      {/* Messages Window */}
      <div className="chat-messages">
        {chatHistory.length === 0 && !isLoading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '1rem'
          }}>
            <Sparkles size={48} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
            <h3 style={{ color: 'white' }}>Ask anything about your notes</h3>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
              Your document is ready. Type a question below to analyze pages and get cited answers instantly.
            </p>
          </div>
        ) : (
          <>
            {chatHistory.map((chat, idx) => (
              <div key={idx} id={`chat-msg-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* User Message */}
                <div className="message user">
                  <div className="message-avatar">
                    <User size={18} />
                  </div>
                  <div className="message-bubble">
                    {chat.question}
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="message assistant">
                  <div className="message-avatar">
                    📄
                  </div>
                  <div className="message-bubble" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '100%' }}>
                    
                    {/* Clean Answer content */}
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {renderTextWithCitations(chat.answer)}
                    </div>

                    {/* Sources section */}
                    {chat.sources && chat.sources.length > 0 && (
                      <div className="sources-container">
                        <span className="sources-label">
                          <FileText size={12} style={{ color: 'var(--color-secondary)' }} />
                          Sources:
                        </span>
                        {chat.sources.map((pageNum, sIdx) => (
                          <span 
                            key={sIdx} 
                            className="source-badge"
                            onClick={() => {
                              alert(`This reference is page ${pageNum} of the uploaded PDF.`);
                            }}
                          >
                            Page {pageNum}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Telemetry Section */}
                    {chat.telemetry && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <TelemetryBadge telemetry={chat.telemetry} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading skeleton state */}
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">
                  📄
                </div>
                <div className="message-bubble" style={{ width: '450px', maxWidth: '90%' }}>
                  <div className="skeleton-container">
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line mid"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-wrapper">
          <input 
            type="text" 
            className="chat-input"
            placeholder="Ask a question about the PDF content..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn-icon-round"
            disabled={!question.trim() || isLoading}
            title="Ask Question"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
