import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

export default function UploadZone({ onUploadSuccess, onError, isLoading, setIsLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isLoading) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (isLoading) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    if (isLoading) return;
    fileInputRef.current.click();
  };

  const processFile = async (file) => {
    if (file.type !== 'application/pdf') {
      onError('Invalid file format. Please upload a PDF document.');
      return;
    }

    setIsLoading(true);
    onError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload and parse PDF');
      }

      onUploadSuccess({
        fileName: file.name,
        pages: data.pages,
      });
    } catch (err) {
      console.error(err);
      onError(err.message || 'An error occurred during file upload');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`upload-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="application/pdf" 
        style={{ display: 'none' }}
      />
      
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="pulse-spinner"></div>
          <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>Reading and parsing document pages...</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This may take a moment for larger PDFs</p>
        </div>
      ) : (
        <>
          <div className="upload-zone-icon">
            <UploadCloud size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>Upload your PDF notes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Drag & drop your file here, or click to browse
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
            <FileText size={14} />
            <span>PDF format up to 10MB</span>
          </div>
        </>
      )}
    </div>
  );
}
