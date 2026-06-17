import React, { useEffect, useState } from 'react';
import { Search, Filter, Calendar, ChevronDown, Eye, X, ShieldAlert } from 'lucide-react';

export default function ReviewHistory({ selectedReviewId, setselectedReviewId }) {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); // desc / asc for date
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (selectedReviewId) {
      // Open details modal directly if selectedReviewId is set from dashboard
      fetch(`http://localhost:8000/api/reviews/${selectedReviewId}`)
        .then(res => res.json())
        .then(data => {
          setSelectedReview(data);
          // clear selection id so it doesn't reopen unexpectedly
          setselectedReviewId(null);
        })
        .catch(err => console.error(err));
    }
  }, [selectedReviewId]);

  const fetchReviews = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const openReview = (review) => {
    setSelectedReview(review);
  };

  const closeReviewModal = () => {
    setSelectedReview(null);
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => r.filename.toLowerCase().includes(search.toLowerCase()))
    .filter(r => severityFilter === 'All' || r.severity.toLowerCase() === severityFilter.toLowerCase())
    .filter(r => r.score >= minScore)
    .sort((a, b) => {
      const dateA = new Date(a.review_date);
      const dateB = new Date(b.review_date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review History</h1>
        <p className="text-sm text-slate-500">Track and manage all code review logs executed on your files.</p>
      </div>

      {/* Filters and search block */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-xs focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        {/* Filter by severity */}
        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-xs focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Filter by score */}
        <div className="relative">
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-xs focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="0">Min Score: Any</option>
            <option value="5">Score: &ge; 5/10</option>
            <option value="7">Score: &ge; 7/10</option>
            <option value="9">Score: &ge; 9/10</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-xs focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="desc">Sort: Latest First</option>
            <option value="asc">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <th className="px-6 py-3.5">Filename</th>
              <th className="px-6 py-3.5">Score</th>
              <th className="px-6 py-3.5">Severity</th>
              <th className="px-6 py-3.5">Verdict</th>
              <th className="px-6 py-3.5">Checked Date</th>
              <th className="px-6 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review, idx) => (
                <tr
                  key={idx}
                  onClick={() => openReview(review)}
                  className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{review.filename}</td>
                  <td className="px-6 py-4">{review.score}/10</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      review.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                      review.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400' :
                      review.severity === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                    }`}>
                      {review.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                      review.verdict === 'Approved' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {review.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{review.review_date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="flex items-center gap-1 text-xs font-semibold text-teal-500 hover:text-teal-600">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500">
                  No records matched your search parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedReview.filename}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scanned on {selectedReview.review_date}</p>
              </div>
              <button
                onClick={closeReviewModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 mb-6">
                <div>
                  <span className="text-xs text-slate-500 block">Score</span>
                  <span className="text-2xl font-bold">{selectedReview.score}/10</span>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-xs text-slate-500 block">Severity</span>
                  <span className="text-sm font-semibold text-amber-500">{selectedReview.severity}</span>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-xs text-slate-500 block">Verdict</span>
                  <span className={`text-sm font-semibold ${selectedReview.verdict === 'Approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedReview.verdict}
                  </span>
                </div>
              </div>
              
              {/* Display full report markdown content */}
              <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-6 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                {selectedReview.report}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
