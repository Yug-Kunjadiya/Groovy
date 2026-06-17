import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CodeReview from './components/CodeReview';
import ReviewHistory from './components/ReviewHistory';
import Analytics from './components/Analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReviewId, setselectedReviewId] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Default to Dark Mode

  // Sync dark mode class on HTML document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            setselectedReviewId={setselectedReviewId}
          />
        )}
        {activeTab === 'review' && (
          <CodeReview />
        )}
        {activeTab === 'history' && (
          <ReviewHistory
            selectedReviewId={selectedReviewId}
            setselectedReviewId={setselectedReviewId}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics />
        )}
      </main>
    </div>
  );
}
