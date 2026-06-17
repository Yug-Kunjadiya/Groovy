import React from 'react';
import { Shield, LayoutDashboard, SearchCode, History, BarChart3, Sun, Moon } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 text-white shadow-md shadow-teal-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Groovy AI</span>
            <span className="ml-1 text-xs font-semibold text-teal-500">CodeReview</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-teal-600 dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-slate-100 text-teal-600 dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <SearchCode className="h-4 w-4" />
            Code Review
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-slate-100 text-teal-600 dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            Review History
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-100 text-teal-600 dark:bg-slate-800 dark:text-teal-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
