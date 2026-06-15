import React, { useState } from 'react';
import type { Student } from '../types/student';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Mail, Phone, BookOpen, Calendar, MoreVertical, Shield, AlertCircle } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDeleteClick: (student: Student) => void;
  loading: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDeleteClick,
  loading,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Format Date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Assign distinct gradient schemes depending on course
  const getCourseBadgeStyles = (course: string) => {
    const c = course.toLowerCase();
    if (c.includes('computer') || c.includes('software')) {
      return 'bg-blue-50/70 text-blue-700 border-blue-100/80';
    } else if (c.includes('data') || c.includes('intelligence') || c.includes('ai')) {
      return 'bg-violet-50/70 text-violet-700 border-violet-100/80';
    } else if (c.includes('cyber') || c.includes('security')) {
      return 'bg-emerald-50/70 text-emerald-700 border-emerald-100/80';
    }
    return 'bg-amber-50/70 text-amber-700 border-amber-100/80';
  };

  // Assign avatar background gradients
  const getAvatarGradient = (id: number) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-violet-500 to-purple-600',
      'from-emerald-400 to-teal-600',
      'from-rose-400 to-orange-500',
      'from-cyan-400 to-blue-600'
    ];
    return gradients[id % gradients.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-lg shadow-slate-100/20">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary-600"></div>
          <div className="absolute h-8 w-8 rounded-full bg-primary-100/50 animate-ping"></div>
        </div>
        <p className="mt-5 text-slate-500 font-semibold tracking-wide animate-pulse">Synchronizing records...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-20 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-lg shadow-slate-100/20 text-center"
      >
        <div className="bg-slate-50 p-5 rounded-2xl text-slate-400 mb-5 border border-slate-100/80">
          <AlertCircle size={40} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Registry is empty</h3>
        <p className="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed">
          No matching student profiles found. Add a new record or adjust your search filters to start.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-100/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100/80">
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Student Info</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact details</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Course</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Date</th>
              <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            <AnimatePresence initial={false}>
              {students.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="hover:bg-slate-50/30 transition-colors group relative"
                >
                  {/* Name and Avatar */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex items-center gap-4.5">
                      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(student.id)} flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-100/20 relative group-hover:scale-105 transition-transform duration-300`}>
                        {student.name.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Active Account"></div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-primary-600 transition-colors">{student.name}</div>
                        <div className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                          <Shield size={11} />
                          <span>UID-{student.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-2 hover:text-slate-800 transition-colors">
                        <Mail size={13} className="text-slate-400" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 hover:text-slate-800 transition-colors">
                        <Phone size={13} className="text-slate-400" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Course Badge */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${getCourseBadgeStyles(student.course)}`}>
                      <BookOpen size={12} />
                      {student.course}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(student.created_at)}
                    </div>
                  </td>

                  {/* Action Menu Trigger */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-right relative">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === student.id ? null : student.id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Floating Action Menu dropdown */}
                      <AnimatePresence>
                        {activeMenuId === student.id && (
                          <>
                            {/* Backdrop tap closure */}
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenuId(null)}
                            />
                            
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-14 top-1/2 -translate-y-1/2 z-20 w-36 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 p-1.5 flex flex-col gap-0.5 text-left"
                            >
                              <button
                                onClick={() => {
                                  onEdit(student);
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 w-full text-xs font-semibold text-slate-600 hover:text-primary-600 hover:bg-primary-50/70 rounded-xl transition-all"
                              >
                                <Edit2 size={13} />
                                Edit Student
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteClick(student);
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 w-full text-xs font-semibold text-rose-600 hover:bg-rose-50/70 rounded-xl transition-all"
                              >
                                <Trash2 size={13} />
                                Delete Student
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100/80 text-xs text-slate-400 font-medium flex justify-between items-center">
        <span>Displaying {students.length} active enrollments</span>
        <span>Secure Cloud Database</span>
      </div>
    </div>
  );
};
