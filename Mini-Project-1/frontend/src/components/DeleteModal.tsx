import React, { useState } from 'react';
import type { Student } from '../types/student';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  student: Student | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!student) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete student. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
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
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transform"
          >
            {/* Header Close button */}
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 pb-6 text-center">
              <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-100/55 animate-bounce">
                <AlertTriangle size={22} />
              </div>
              
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Delete Enrollment Record?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-2.5">
                Are you sure you want to permanently delete <span className="font-bold text-slate-800">{student.name}</span>'s profile? This operation is permanent and cannot be undone.
              </p>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3.5 text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100/60"
                >
                  {error}
                </motion.p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100 hover:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
