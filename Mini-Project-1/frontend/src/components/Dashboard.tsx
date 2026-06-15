import React, { useState, useEffect } from 'react';
import { Student, StudentInput } from '../types/student';
import { studentApi } from '../services/api';
import { StudentTable } from './StudentTable';
import { StudentForm } from './StudentForm';
import { DeleteModal } from './DeleteModal';
import { Plus, Search, Users, BookOpen, GraduationCap, X, AlertCircle, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Notification states
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch all students
  const fetchStudents = async (query = '') => {
    setLoading(true);
    try {
      const response = await studentApi.getAll(query);
      setStudents(response.data);
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Failed to fetch students. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(search);
    }, 300); // Debounce search calls by 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

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
      // Edit Student
      const response = await studentApi.update(selectedStudent.id, studentData);
      if (response.success) {
        showNotification('success', response.message || 'Student updated successfully!');
        fetchStudents(search);
      }
    } else {
      // Add Student
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

  // Compute simple statistics
  const totalStudents = students.length;
  const uniqueCourses = new Set(students.map((s) => s.course.trim().toLowerCase())).size;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-600 text-white p-2 rounded-xl">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">Academix</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              v1.0.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
        
        {/* Floating Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top duration-300 max-w-sm flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={18} className="mt-0.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 text-rose-600 shrink-0" />
            )}
            <div className="flex-1 text-sm font-medium">{notification.message}</div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Hero Section / Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-primary-50 text-primary-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Total Students</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{totalStudents}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Active Courses</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{uniqueCourses}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 sm:col-span-2 md:col-span-1">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Status</div>
              <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg mt-1 inline-block">
                Connected
              </div>
            </div>
          </div>
        </section>

        {/* Search & Actions Panel */}
        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedStudent(null);
              setIsFormOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-primary-200 hover:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Student
          </button>
        </section>

        {/* Student Table Registry */}
        <section className="flex-1">
          <StudentTable
            students={students}
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
      </main>

      {/* Form Dialog Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        student={selectedStudent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        student={selectedStudent}
      />
    </div>
  );
};
