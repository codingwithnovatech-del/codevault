/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, AlertOctagon } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div id="toast-container" className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 md:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="pointer-events-auto w-full bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/50 p-4 rounded-xl flex items-start gap-3 shadow-2xl"
          >
            <div className="mt-0.5">
              {toast.type === 'success' && (
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Info className="h-3.5 w-3.5" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="h-5 w-5 rounded-full bg-error-container/20 text-error flex items-center justify-center">
                  <AlertOctagon className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">{toast.text}</p>
            </div>

            <button
              id={`close-toast-${toast.id}`}
              onClick={() => onClose(toast.id)}
              className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest p-1 rounded-md transition-colors"
            >
              <span className="text-xs font-sans">&times;</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
