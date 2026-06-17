import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShieldAlert, BarChart3, HelpCircle, CheckSquare } from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-20 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Reviews', value: analytics?.total_reviews || 0, icon: BarChart3, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { name: 'Avg Score', value: analytics?.average_score ? `${analytics.average_score}/10` : '—', icon: CheckSquare, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { name: 'Critical Issues', value: analytics?.critical_issues || 0, icon: ShieldAlert, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' }
  ];

  const severityColors = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#F59E0B',
    Low: '#10B981'
  };

  const sevData = analytics ? Object.entries(analytics.severity_distribution).map(([name, count]) => ({
    name,
    count
  })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500">View code health metrics, quality trends, and issues breakdown across historical scans.</p>
      </div>

      {/* KPI counters */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((card, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.name}</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {analytics?.total_reviews > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Trends over time (LineChart) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4">Review Activity & Score Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#14B8A6" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="avg_score" name="Average Score" stroke="#F59E0B" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="reviews_count" name="Reviews Run" stroke="#14B8A6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Breakdown BarChart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4">Issues Breakdown by Severity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sevData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                    {sevData.map((entry, idx) => (
                      <Cell key={idx} fill={severityColors[entry.name] || '#14B8A6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score distribution BarChart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Score Distribution Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.score_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="score" stroke="#94A3B8" fontSize={12} name="Score" label={{ value: 'Review Score', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#94A3B8" fontSize={12} label={{ value: 'Files Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-semibold">No Analytics Available</h3>
          <p className="mt-2 text-sm text-slate-500">Run code reviews to generate scores and analytics.</p>
        </div>
      )}
    </div>
  );
}
