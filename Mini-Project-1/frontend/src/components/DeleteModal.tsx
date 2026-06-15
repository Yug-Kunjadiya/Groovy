import React, { useState } from 'react';
import type { Student } from '../types/student';
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

  if (!isOpen || !student) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-800">Delete Student Record?</h3>
          <p className="text-slate-500 text-sm mt-2">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{student.name}</span>'s record? This action is permanent and cannot be undone.
          </p>

          {error && (
            <p className="mt-3 text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-200 hover:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
            >
              {deleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Yes, Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
