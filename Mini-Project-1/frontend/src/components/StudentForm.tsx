import React, { useState, useEffect } from 'react';
import type { Student, StudentInput } from '../types/student';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: StudentInput) => Promise<void>;
  student?: Student | null;
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
  }, [student, isOpen]);

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
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transform"
          >
            {success ? (
              /* Success Animation Screen */
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-100"
                >
                  <Sparkles size={32} />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Success!</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  {student ? 'Student profile updated successfully.' : 'New student profile created successfully.'}
                </p>
              </div>
            ) : (
              /* Standard Input Form */
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">
                    {student ? 'Edit Student Details' : 'Register New Student'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4.5">
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 flex items-start gap-2.5 text-xs font-semibold"
                    >
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}

                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Aarav Mehta"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                          errors.name ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-100 focus:border-primary-500 focus:bg-white'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-rose-500 font-bold tracking-tight">{errors.name}</p>}
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        placeholder="aarav.mehta@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                          errors.email ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-100 focus:border-primary-500 focus:bg-white'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 font-bold tracking-tight">{errors.email}</p>}
                  </div>

                  {/* Phone Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <div className="relative group">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                          errors.phone ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-100 focus:border-primary-500 focus:bg-white'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-500 font-bold tracking-tight">{errors.phone}</p>}
                  </div>

                  {/* Course Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled Course</label>
                    <div className="relative group">
                      <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                          errors.course ? 'border-rose-300 focus:border-rose-500 focus:bg-white' : 'border-slate-100 focus:border-primary-500 focus:bg-white'
                        }`}
                      />
                    </div>
                    {errors.course && <p className="text-xs text-rose-500 font-bold tracking-tight">{errors.course}</p>}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-5 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting}
                      className="px-4.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-100 hover:shadow-none transition-all flex items-center justify-center min-w-[100px] disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : student ? (
                        'Save'
                      ) : (
                        'Register'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
