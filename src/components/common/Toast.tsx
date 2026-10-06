import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const iconMap = {
    success: <CheckCircle size={15} className="text-[#288F3D]" />,
    warning: <AlertTriangle size={15} className="text-[#F3740F]" />,
    info: <Info size={15} className="text-[#158AF4]" />,
    error: <XCircle size={15} className="text-[#B42318]" />,
  };

  return (
    <div className="fixed bottom-16 sm:bottom-5 right-3 sm:right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-start space-x-2.5 p-3.5 rounded-2xl glass-card shadow-xl"
          >
            <div className="mt-0.5 flex-shrink-0">{iconMap[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-[#111827] dark:text-white">
                {toast.title}
              </h4>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white transition-colors p-0.5"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
