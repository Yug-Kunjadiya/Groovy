import React from 'react';
import { Student } from '../types/student';
import { Edit2, Trash2, Mail, Phone, BookOpen, Calendar } from 'lucide-react';

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
  // Format ISO Date to readable date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading student records...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4">
          <BookOpen size={36} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No students found</h3>
        <p className="text-slate-500 max-w-sm mt-1">
          Try adjusting your search terms or add a new student to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-xs text-slate-400">ID: #{student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-400" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-slate-400" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                    <BookOpen size={12} />
                    {student.course}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {formatDate(student.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                      title="Edit Student"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(student)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>Showing {students.length} students</span>
        <span>Premium Student Registry</span>
      </div>
    </div>
  );
};
