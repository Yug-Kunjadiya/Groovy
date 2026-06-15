import React, { useState, useEffect } from 'react';
import type { Student, StudentInput } from '../types/student';
import api, { studentApi } from '../services/api';
import { StudentTable } from './StudentTable';
import { StudentForm } from './StudentForm';
import { DeleteModal } from './DeleteModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Users, BookOpen, GraduationCap, X, AlertCircle, CheckCircle, 
  Calendar, LayoutDashboard, Settings, BarChart3, Activity, ArrowUpRight,
  Network, Cpu, Clock, TrendingUp, Award
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'name', 'newest', 'oldest'
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');

  // Latency & Settings checking states
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const [dbUserVal, setDbUserVal] = useState('postgres');
  const [dbHostVal, setDbHostVal] = useState('localhost');
  const [dbPortVal, setDbPortVal] = useState('5432');
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Time & Date State for Header
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all students
  const fetchStudents = async (query = '') => {
    setLoading(true);
    try {
      const response = await studentApi.getAll(query);
      setStudents(response.data);
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Database connection offline. Verify PostgreSQL service status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const delayDebounceFn = setTimeout(() => {
        fetchStudents(search);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      fetchStudents();
    }
  }, [search, activeTab]);

  // Show status notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add / Edit submission handler
  const handleFormSubmit = async (studentData: StudentInput) => {
    if (selectedStudent) {
      const response = await studentApi.update(selectedStudent.id, studentData);
      if (response.success) {
        showNotification('success', response.message || 'Student updated successfully!');
        fetchStudents(search);
      }
    } else {
      const response = await studentApi.create(studentData);
      if (response.success) {
        showNotification('success', response.message || 'Student added successfully!');
        fetchStudents(search);
      }
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (selectedStudent) {
      const response = await studentApi.delete(selectedStudent.id);
      if (response.success) {
        showNotification('success', response.message || 'Student deleted successfully!');
        fetchStudents(search);
      }
    }
  };

  // Run dynamic api health and ping check
  const runPingCheck = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      await api.get('/health');
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      showNotification('success', 'API round-trip latency calculated successfully.');
    } catch (err) {
      console.error(err);
      setPingLatency(null);
      showNotification('error', 'Database server ping failed. Check network log.');
    } finally {
      setPinging(false);
    }
  };

  // Extract unique courses for filtering pills
  const coursesList = ['All', ...Array.from(new Set(students.map(s => s.course)))];

  // Local filtering & sorting logic
  const filteredStudents = students
    .filter((student) => {
      if (courseFilter === 'All') return true;
      return student.course === courseFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Calculate dynamic stats
  const totalStudentsCount = students.length;
  const uniqueCoursesCount = new Set(students.map((s) => s.course.trim().toLowerCase())).size;

  // Aggregate course distributions
  const courseCounts = students.reduce((acc: Record<string, number>, curr) => {
    const key = curr.course;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden w-full">
      
      {/* 1. Left Navigation Sidebar */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 p-6 hidden md:flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary-500 to-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
            <GraduationCap size={20} />
          </div>
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            ACADEMIX
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <LayoutDashboard size={16} className={activeTab === 'dashboard' ? 'text-primary-400' : ''} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <BarChart3 size={16} className={activeTab === 'analytics' ? 'text-primary-400' : ''} />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Settings size={16} className={activeTab === 'settings' ? 'text-primary-400' : ''} />
            Settings
          </button>
        </nav>

        <div className="mt-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 p-4 rounded-2xl flex flex-col gap-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Database</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300">PostgreSQL Online</span>
          </div>
          <div className="text-[10px] font-medium text-slate-500">Host: {dbHostVal}:{dbPortVal}</div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        
        {/* Floating Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 p-4.5 rounded-2xl shadow-2xl border backdrop-blur-md max-w-sm flex items-start gap-3.5 ${
                notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-900/80 text-emerald-300' : 'bg-rose-950/80 border-rose-900/80 text-rose-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle size={18} className="mt-0.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 text-rose-400 shrink-0" />
              )}
              <div className="flex-1 text-xs font-bold leading-relaxed">{notification.message}</div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white shrink-0">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Top Header Section */}
        <header className="border-b border-slate-900 px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {activeTab === 'dashboard' && 'Student Workspace'}
              {activeTab === 'analytics' && 'Analytics Insights'}
              {activeTab === 'settings' && 'System Settings'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs font-semibold">
              <Calendar size={13} />
              <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="text-slate-700">•</span>
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === 'dashboard' && (
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setIsFormOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/15 hover:shadow-none hover:translate-y-px transition-all flex items-center gap-2"
              >
                <Plus size={15} />
                Add Student
              </button>
            )}
            
            <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-slate-200">
              YK
            </div>
          </div>
        </header>

        {/* Workspace Panels */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col lg:flex-row gap-8 w-full flex-1"
              >
                {/* Column 1: Main Stats and Students table */}
                <div className="flex-1 flex flex-col gap-8">
                  {/* Stats Grid */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-6 rounded-3xl flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled Students</span>
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                          <Users size={16} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-white tracking-tight">{totalStudentsCount}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                          <ArrowUpRight size={10} /> +12%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Growth rate versus previous month</div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-6 rounded-3xl flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Courses</span>
                        <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl">
                          <BookOpen size={16} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-white tracking-tight">{uniqueCoursesCount}</span>
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-lg">
                          Stable
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Distinct learning tracks in database</div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-6 rounded-3xl flex flex-col gap-3 relative overflow-hidden sm:col-span-2 md:col-span-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Database Uptime</span>
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                          <Activity size={16} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-white tracking-tight">99.9%</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                          Live
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Real-time health of local Postgres server</div>
                    </motion.div>
                  </section>

                  {/* Filter, Search & Sorting Panel */}
                  <section className="flex flex-col gap-5 bg-slate-900/20 border border-slate-900 p-5 rounded-3xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full md:w-80">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search by student details..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-primary-500 focus:bg-slate-950 rounded-2xl text-xs font-semibold text-slate-200 outline-none transition-all"
                        />
                        {search && (
                          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          Sort By:
                        </span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="name">Alphabetical (A-Z)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center mr-1">
                        Courses:
                      </span>
                      {coursesList.map((course) => (
                        <button
                          key={course}
                          onClick={() => setCourseFilter(course)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            courseFilter === course 
                              ? 'bg-white text-slate-950 border-white font-extrabold' 
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {course}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Student List Table */}
                  <section className="flex-1">
                    <StudentTable
                      students={filteredStudents}
                      onEdit={(student) => {
                        setSelectedStudent(student);
                        setIsFormOpen(true);
                      }}
                      onDeleteClick={(student) => {
                        setSelectedStudent(student);
                        setIsDeleteOpen(true);
                      }}
                      loading={loading}
                    />
                  </section>
                </div>

                {/* Column 2: Dashboard Distribution Charts and Log details (Right panel) */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-8">
                  {/* Course Distribution */}
                  <section className="bg-slate-900/30 border border-slate-900 p-6 rounded-3xl flex flex-col gap-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Share</h3>
                    <div className="flex flex-col gap-4">
                      {Object.entries(courseCounts).map(([courseName, count]) => {
                        const percentage = totalStudentsCount > 0 ? Math.round((count / totalStudentsCount) * 100) : 0;
                        return (
                          <div key={courseName} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                              <span className="truncate max-w-[180px]">{courseName}</span>
                              <span>{count} ({percentage})</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {totalStudentsCount === 0 && (
                        <div className="text-xs font-semibold text-slate-500 italic py-2">No active distributions</div>
                      )}
                    </div>
                  </section>

                  {/* Recent activity log */}
                  <section className="bg-slate-900/30 border border-slate-900 p-6 rounded-3xl flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                      <Activity size={14} className="text-slate-500" />
                    </div>
                    <div className="flex flex-col gap-4">
                      {students.slice(0, 4).map((s) => (
                        <div key={s.id} className="flex items-start gap-3 text-xs font-medium text-slate-400">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                          <div>
                            <span className="font-bold text-slate-200">{s.name}</span> registered for the course <span className="text-primary-400 font-semibold">{s.course}</span>.
                          </div>
                        </div>
                      ))}
                      {totalStudentsCount === 0 && (
                        <div className="text-xs font-semibold text-slate-500 italic py-2">No recent system records</div>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* TAB 2: ANALYTICS VIEW */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8 w-full flex-1"
              >
                {/* Analytics summary rows */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl flex flex-col gap-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Course Size</div>
                    <div className="text-2xl font-extrabold text-white">
                      {uniqueCoursesCount > 0 ? (totalStudentsCount / uniqueCoursesCount).toFixed(1) : '0'}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Students per active learning track</p>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl flex flex-col gap-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Course Growth Index</div>
                    <div className="text-2xl font-extrabold text-indigo-400 flex items-center gap-1.5">
                      <TrendingUp size={22} /> High
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Interest index based on recent creations</p>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl flex flex-col gap-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Top Learning Path</div>
                    <div className="text-lg font-bold text-white flex items-center gap-2 truncate">
                      <Award size={18} className="text-amber-400 shrink-0" />
                      {Object.keys(courseCounts).length > 0 
                        ? Object.entries(courseCounts).sort((a,b) => b[1] - a[1])[0][0] 
                        : 'None'}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Track containing highest enrollments</p>
                  </div>
                </div>

                {/* Enrollment Bar Charts */}
                <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-3xl flex flex-col gap-6 flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Active Enrollment Densities</h3>
                    <p className="text-xs text-slate-400 mt-1">Interactive bar representation of active users across academic databases.</p>
                  </div>

                  <div className="flex flex-col gap-5 flex-1 justify-center max-w-2xl">
                    {Object.entries(courseCounts).map(([course, count]) => {
                      const maxVal = Math.max(...Object.values(courseCounts) as number[]);
                      const barPercentage = maxVal > 0 ? (count / maxVal) * 100 : 0;
                      return (
                        <div key={course} className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-400 w-32 truncate">{course}</span>
                          <div className="flex-1 h-5 bg-slate-950 rounded-xl overflow-hidden relative border border-slate-900">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${barPercentage}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-violet-600 rounded-xl"
                            />
                          </div>
                          <span className="text-xs font-extrabold text-white w-10 text-right">{count}</span>
                        </div>
                      );
                    })}
                    {Object.keys(courseCounts).length === 0 && (
                      <p className="text-xs font-semibold text-slate-500 italic">No enrollment metrics available</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8 w-full max-w-2xl"
              >
                {/* Database Settings Info card */}
                <div className="bg-slate-900/30 border border-slate-900 p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">PostgreSQL Database Connection</h3>
                    <p className="text-xs text-slate-400 mt-1">Local database configuration reading from environment variables.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB User</label>
                      <input 
                        type="text" 
                        value={dbUserVal}
                        onChange={(e) => setDbUserVal(e.target.value)}
                        className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-bold focus:border-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB Host</label>
                      <input 
                        type="text" 
                        value={dbHostVal}
                        onChange={(e) => setDbHostVal(e.target.value)}
                        className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-bold focus:border-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB Port</label>
                      <input 
                        type="text" 
                        value={dbPortVal}
                        onChange={(e) => setDbPortVal(e.target.value)}
                        className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-bold focus:border-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB Name</label>
                      <input 
                        type="text" 
                        value="student_db" 
                        disabled
                        className="bg-slate-950/50 border border-slate-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-bold outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* API Health Connection Ping check */}
                <div className="bg-slate-900/30 border border-slate-900 p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">API Service Health</h3>
                    <p className="text-xs text-slate-400 mt-1">Verify round-trip latency checks to the Express backend service.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={runPingCheck}
                      disabled={pinging}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
                    >
                      {pinging ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Network size={14} />
                      )}
                      Test Api Latency
                    </button>

                    <div className="flex items-center gap-3">
                      {pingLatency !== null ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
                          <Cpu size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">{pingLatency} ms</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-900/50 px-3.5 py-1.5 rounded-xl border border-slate-900">
                          <Clock size={14} className="text-slate-500" />
                          <span className="text-xs font-bold text-slate-500">Not Tested</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Register / Modify student Modal popup */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        student={selectedStudent}
      />

      {/* Delete Confirmation popup dialog */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        student={selectedStudent}
      />
    </div>
  );
};
