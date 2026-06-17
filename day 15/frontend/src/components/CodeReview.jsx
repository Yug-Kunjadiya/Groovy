import React, { useState, useRef } from 'react';
import MonacoEditor, { DiffEditor } from '@monaco-editor/react';
import { Upload, Trash2, Send, Copy, FileCode, CheckCircle, ChevronDown, ChevronRight, Check } from 'lucide-react';

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('sample.py');
  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeDiff, setActiveDiff] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState('');
  
  // Section collapse states
  const [openSections, setOpenSections] = useState({
    summary: true,
    bugs: true,
    security: true,
    performance: true,
    bestPractices: true,
    recommended: true
  });

  const fileInputRef = useRef(null);

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      loadFileData(file);
    }
  };

  const loadFileData = (file) => {
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
    };
    reader.readAsText(file);
  };

  const triggerReview = () => {
    if (!code.trim()) return;
    setLoading(true);
    setReviewResult(null);
    setActiveDiff(false);

    const formData = new FormData();
    formData.append('code', code);
    formData.append('filename', filename);

    fetch('http://localhost:8000/api/review', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setReviewResult(data);
          // Extract suggested code from the markdown recommended section
          extractSuggestedCode(data.report);
        } else {
          alert("Error: " + (data.detail || "Could not review code."));
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        alert("Server connection failed. Make sure FastAPI server is running on port 8000.");
      });
  };

  const extractSuggestedCode = (markdownText) => {
    // Look for code blocks inside the markdown output
    const codeBlockRegex = /```(?:[a-zA-Z0-9]+)?\s*([\s\S]*?)```/g;
    const matches = [...markdownText.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
      // Use the last code block or the longest one as the recommendation
      const longestBlock = matches.reduce((prev, current) => {
        return (prev[1].length > current[1].length) ? prev : current;
      });
      setSuggestedCode(longestBlock[1].strip ? longestBlock[1].strip() : longestBlock[1]);
    } else {
      setSuggestedCode(code); // Fallback to original
    }
  };

  const clearEditor = () => {
    setCode('');
    setReviewResult(null);
    setActiveDiff(false);
    setSuggestedCode('');
  };

  const copyToClipboard = () => {
    if (!reviewResult) return;
    navigator.clipboard.writeText(reviewResult.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseBulletPoints = (text, sectionHeader) => {
    const regex = new RegExp(`## ${sectionHeader}\\s*[\\r\\n]+([\\s\\S]*?)(##|$)`, 'i');
    const match = text.match(regex);
    if (!match) return [];
    
    return match[1]
      .split('\n')
      .map(line => line.replace(/^-\s+/, '').trim())
      .filter(line => line.length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Code Review</h1>
          <p className="text-sm text-slate-500">Scan source code files or paste snippets directly for security, bugs, and performance reviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Code inputs */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Filename:</span>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
            
            {reviewResult && (
              <button
                onClick={() => setActiveDiff(!activeDiff)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeDiff ? 'bg-teal-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800'
                }`}
              >
                {activeDiff ? 'Show Code Editor' : 'Compare Original vs Fixes'}
              </button>
            )}
          </div>

          {activeDiff ? (
            /* Monaco Side-by-Side Diff Editor */
            <div className="h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
              <DiffEditor
                original={code}
                modified={suggestedCode}
                language={filename.endsWith('.py') ? 'python' : 'javascript'}
                theme="vs-dark"
                options={{ readOnly: true }}
              />
            </div>
          ) : (
            /* Standard Monaco Editor */
            <div className="relative h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 bg-slate-900">
              {!code && (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xs p-6"
                >
                  <Upload className="h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-sm font-semibold">Drag & Drop code file here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports .py, .js, .ts, .jsx, .tsx, .java</p>
                  <span className="my-2 text-xs font-semibold text-slate-400">or</span>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  >
                    Select File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => loadFileData(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}
              <MonacoEditor
                height="100%"
                value={code}
                language={filename.endsWith('.py') ? 'python' : 'javascript'}
                theme="vs-dark"
                onChange={setCode}
                options={{ minimap: { enabled: false }, fontSize: 13 }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={clearEditor}
              disabled={!code}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
            <button
              onClick={triggerReview}
              disabled={!code || loading}
              className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-600 transition"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Review Code'}
            </button>
          </div>
        </div>

        {/* Right Side: Review reports */}
        <div className="lg:col-span-5 flex flex-col">
          {loading ? (
            /* Loading Skeleton */
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4 h-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : reviewResult ? (
            /* Full Review Panel */
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[580px] overflow-y-auto">
              
              {/* Report Header Card */}
              <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Score Indicator */}
                    <div className="relative flex h-14 w-14 items-center justify-center font-bold text-base">
                      <svg className="absolute transform -rotate-90" width="56" height="56">
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          stroke="rgba(20, 184, 166, 0.15)"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          stroke="#14B8A6"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 22}
                          strokeDashoffset={2 * Math.PI * 22 * (1 - (reviewResult.score || 0) / 10)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="z-10 text-slate-900 dark:text-white">{reviewResult.score}<span className="text-[10px] text-slate-400">/10</span></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Review Summary</h3>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${
                        reviewResult.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                        reviewResult.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400' :
                        reviewResult.severity === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}>
                        {reviewResult.severity} Severity
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sections list */}
              <div className="p-6 space-y-4">
                
                {/* 1. Summary Card */}
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('summary')}>
                    <h4 className="text-sm font-semibold">Overall Summary</h4>
                    {openSections.summary ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {openSections.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {reviewResult.report.match(/## Summary\s*[\r\n]+([\s\S]*?)(##|$)/i)?.[1].trim() || 'No summary available.'}
                    </p>
                  )}
                </div>

                {/* 2. Bugs Found Card */}
                <div className="rounded-lg border border-red-100 bg-red-50/20 p-4 dark:border-red-950/10">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('bugs')}>
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Bugs Detected</h4>
                    {openSections.bugs ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {openSections.bugs && (
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                      {parseBulletPoints(reviewResult.report, 'Bugs Found').map((bug, i) => (
                        <li key={i}>{bug}</li>
                      )) || <li>No bugs detected.</li>}
                    </ul>
                  )}
                </div>

                {/* 3. Security Concerns Card */}
                <div className="rounded-lg border border-orange-100 bg-orange-50/20 p-4 dark:border-orange-950/10">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('security')}>
                    <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400">Security Concerns</h4>
                    {openSections.security ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {openSections.security && (
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                      {parseBulletPoints(reviewResult.report, 'Security Concerns').map((sec, i) => (
                        <li key={i}>{sec}</li>
                      )) || <li>No security concerns found.</li>}
                    </ul>
                  )}
                </div>

                {/* 4. Performance Card */}
                <div className="rounded-lg border border-amber-100 bg-amber-50/20 p-4 dark:border-amber-950/10">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('performance')}>
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">Performance Improvements</h4>
                    {openSections.performance ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {openSections.performance && (
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                      {parseBulletPoints(reviewResult.report, 'Performance Improvements').map((perf, i) => (
                        <li key={i}>{perf}</li>
                      )) || <li>No performance issues found.</li>}
                    </ul>
                  )}
                </div>

                {/* 5. Code Quality Card */}
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/10 p-4 dark:border-emerald-950/10">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('bestPractices')}>
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Code Quality & Best Practices</h4>
                    {openSections.bestPractices ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  {openSections.bestPractices && (
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                      {parseBulletPoints(reviewResult.report, 'Code Quality Suggestions').map((qa, i) => (
                        <li key={i}>{qa}</li>
                      )) || <li>No quality issues detected.</li>}
                    </ul>
                  )}
                </div>

              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-center items-center h-full min-h-[400px]">
              <FileCode className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 text-lg font-semibold">Analysis Ready</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs">Upload code or paste a snippet, then click "Review Code" to generate your report scorecard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
