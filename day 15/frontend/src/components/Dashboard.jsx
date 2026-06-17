import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Files, TrendingUp, AlertOctagon, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export default function Dashboard({ setActiveTab, setselectedReviewId }) {
  const [stats, setStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/analytics').then(res => res.json()),
      fetch('http://localhost:8000/api/reviews').then(res => res.json())
    ])
      .then(([analyticsData, reviewsData]) => {
        setStats(analyticsData);
        setRecentReviews(reviewsData.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  }, []);

  const openReviewDetails = (id) => {
    setselectedReviewId(id);
    setActiveTab('history');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      name: 'Total Reviews',
      value: stats?.total_reviews || 0,
      icon: Files,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20'
    },
    {
      name: 'Avg Code Score',
      value: stats?.total_reviews > 0 ? `${stats.average_score}/10` : '—',
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
    },
    {
      name: 'Critical Findings',
      value: stats?.critical_issues || 0,
      icon: AlertOctagon,
      color: 'text-red-500 bg-red-50 dark:bg-red-950/20'
    },
    {
      name: 'Passed Verdicts',
      value: recentReviews.filter(r => r.verdict === 'Approved').length,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
    }
  ];

  // Colors for Recharts severity pie/bar
  const SEVERITY_COLORS = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#F59E0B',
    Low: '#10B981'
  };

  const severityData = stats ? Object.entries(stats.severity_distribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <div className="space-y-6">
      
      {/* Top Header info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back. Here is the latest health overview of your repositories.</p>
        </div>
        <button
          onClick={() => setActiveTab('review')}
          className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-600 transition"
        >
          Review New Code
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.name}</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {stats?.total_reviews > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trend chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4">Reviews Score Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="avg_score" stroke="#14B8A6" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4">Issues Severity Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {severityData.map((entry, idx) => (
                      <Cell key={idx} fill={SEVERITY_COLORS[entry.name] || '#14B8A6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Files className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-semibold">No Review Data Yet</h3>
          <p className="mt-2 text-sm text-slate-500">Run your first AI Code Review to start collecting metrics and analytics.</p>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-500" />
            <h3 className="font-semibold">Recent Activity Feed</h3>
          </div>
          {stats?.total_reviews > 5 && (
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-teal-500 hover:text-teal-600"
            >
              View All History
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          {recentReviews.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-6 py-3">Filename</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Verdict</th>
                  <th className="px-6 py-3">Date Checked</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentReviews.map((review, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-medium">{review.filename}</td>
                    <td className="px-6 py-4">{review.score}/10</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        review.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                        review.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400' :
                        review.severity === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
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
                      <button
                        onClick={() => openReviewDetails(review.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No recent activity recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
