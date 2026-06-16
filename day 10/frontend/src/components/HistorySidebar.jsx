import React from 'react';
import { BookOpen, RefreshCw, Layers, MessageSquare, Database } from 'lucide-react';

export default function HistorySidebar({ pdfInfo, chatHistory, onReset, isResetting }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <BookOpen size={24} style={{ color: 'var(--color-primary)' }} />
        <span className="sidebar-logo-text">Smart Doc Q&A</span>
      </div>

      <div className="sidebar-content">
        {/* Active Document Info */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} style={{ color: 'var(--color-secondary)' }} />
            Active Document
          </h3>
          {pdfInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p 
                style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: '600', 
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={pdfInfo.fileName}
              >
                {pdfInfo.fileName}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Pages:</span>
                <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>{pdfInfo.pages}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No document uploaded.
            </p>
          )}
        </div>

        {/* Conversation History List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          <h3 style={{ fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} style={{ color: 'var(--color-accent)' }} />
            Session Questions
          </h3>
          
          {chatHistory.length > 0 ? (
            <div className="history-list">
              {chatHistory.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => {
                    const el = document.getElementById(`chat-msg-${index}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  title={item.question}
                >
                  {item.question}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Ask a question to see history.
            </p>
          )}
        </div>

        {/* In-Memory Store Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Database size={14} style={{ color: 'var(--color-secondary)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Storage: Server In-Memory
          </span>
        </div>
      </div>

      <div className="sidebar-footer">
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
          onClick={onReset}
          disabled={!pdfInfo || isResetting}
        >
          <RefreshCw size={16} className={isResetting ? 'spin-animation' : ''} />
          {isResetting ? 'Resetting...' : 'Reset Document'}
        </button>
      </div>
    </aside>
  );
}
