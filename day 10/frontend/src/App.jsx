import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';
import UploadZone from './components/UploadZone';
import HistorySidebar from './components/HistorySidebar';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const [pdfInfo, setPdfInfo] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);

  // Sync state with backend on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        if (data.success && data.hasPdf) {
          setPdfInfo({
            fileName: data.fileName,
            pages: data.pages
          });
          setChatHistory(data.history || []);
        }
      } catch (err) {
        console.error('Failed to sync status with server:', err);
      }
    }
    checkStatus();
  }, []);

  const handleUploadSuccess = (info) => {
    setPdfInfo(info);
    setChatHistory([]);
    setError(null);
  };

  const handleAsk = async (question) => {
    setIsLoadingAnswer(true);
    setError(null);

    // Optimistically add question to local state for rendering
    // (We will patch it when the server responds)
    const newChatIndex = chatHistory.length;
    const tempChatHistory = [...chatHistory, { question, answer: '', sources: [], telemetry: null }];
    setChatHistory(tempChatHistory);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer from server.');
      }

      // Update state with answer, sources, and telemetry
      setChatHistory(prev => {
        const updated = [...prev];
        updated[newChatIndex] = {
          question,
          answer: data.answer,
          sources: data.sources || [],
          telemetry: data.telemetry
        };
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while communicating with the AI model.');
      
      // Remove the empty message placeholder if it failed
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });
      if (response.ok) {
        setPdfInfo(null);
        setChatHistory([]);
      } else {
        throw new Error('Failed to reset session');
      }
    } catch (err) {
      setError('Failed to clear workspace: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation History Sidebar */}
      <HistorySidebar 
        pdfInfo={pdfInfo} 
        chatHistory={chatHistory} 
        onReset={handleReset} 
        isResetting={isResetting}
      />

      {/* Main Panel */}
      <main className="main-content">
        {/* App Header */}
        <header className="app-header">
          <div className="header-title-container">
            <span style={{ fontSize: '1.25rem' }}>🧠</span>
            <h1 className="header-title">Ask My Notes</h1>
          </div>
          {pdfInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem'
                }}
              >
                <FileText size={12} style={{ color: 'var(--color-primary)' }} />
                <span 
                  style={{ 
                    maxWidth: '180px', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    color: 'var(--text-main)',
                    fontWeight: '500'
                  }}
                  title={pdfInfo.fileName}
                >
                  {pdfInfo.fileName}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Workspace Display */}
        {!pdfInfo ? (
          /* Welcome/Upload screen */
          <div className="welcome-container">
            <div className="welcome-inner">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <div 
                  style={{ 
                    background: 'var(--primary-gradient)', 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
                    marginBottom: '1rem'
                  }}
                >
                  <Sparkles size={28} style={{ color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '2.25rem', color: 'white' }}>Smart Doc Q&A</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Upload a PDF document, extract text by pages instantly, and interact with Claude to get exact cited page answers in real-time.
                </p>
              </div>

              {error && (
                <div className="error-banner">
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <UploadZone 
                onUploadSuccess={handleUploadSuccess} 
                onError={setError} 
                isLoading={isUploading}
                setIsLoading={setIsUploading}
              />
            </div>
          </div>
        ) : (
          /* Chat interface screen */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {error && (
              <div className="error-banner" style={{ margin: '1rem 2rem 0 2rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            
            <ChatInterface 
              chatHistory={chatHistory} 
              isLoading={isLoadingAnswer} 
              onAsk={handleAsk} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
