import React, { useState, useEffect } from 'react';
import type { Student, StudentInput } from '../types/student';
import { X, User, Mail, Phone, BookOpen, AlertCircle } from 'lucide-react';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: StudentInput) => Promise<void>;
  student?: Student | null; // If present, we are editing
}

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Load student data if editing
  useEffect(() => {
    if (student) {
      setName(student.name);
      setEmail(student.email);
      setPhone(student.phone);
      setCourse(student.course);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCourse('');
    }
    setErrors({});
    setApiError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number (min 7 digits).';
    }

    if (!course.trim()) newErrors.course = 'Please select or enter a course.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setApiError('');

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        course: course.trim(),
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {student ? 'Edit Student Details' : 'Add New Student'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {apiError && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-100 flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Aarav Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${
                  errors.name ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-200 focus:border-primary-500 focus:bg-white'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="aarav.mehta@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${
                  errors.email ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-200 focus:border-primary-500 focus:bg-white'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
          </div>

          {/* Phone Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${
                  errors.phone ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-200 focus:border-primary-500 focus:bg-white'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>}
          </div>

          {/* Course Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Course</label>
            <div className="relative">
              <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${
                  errors.course ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-200 focus:border-primary-500 focus:bg-white'
                }`}
              />
            </div>
            {errors.course && <p className="text-xs text-rose-500 font-medium">{errors.course}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-200 hover:shadow-none transition-all flex items-center justify-center min-w-[80px] disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : student ? (
                'Save Changes'
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
