'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onGrantAccess: () => void;
  onRevokeAccess: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onGrantAccess,
  onRevokeAccess,
  onClearSelection,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 sm:gap-4 rounded-xl bg-slate-900 px-4 sm:px-6 py-3 text-white shadow-2xl w-[90%] sm:w-auto max-w-2xl overflow-x-auto"
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-700 shrink-0" />
          <button
            type="button"
            onClick={onGrantAccess}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
          >
            Conceder Acesso
          </button>
          <button
            type="button"
            onClick={onRevokeAccess}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors whitespace-nowrap"
          >
            Revogar Acesso
          </button>
          <div className="w-px h-4 bg-slate-700 shrink-0" />
          <button
            type="button"
            onClick={onClearSelection}
            className="text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors whitespace-nowrap"
          >
            Limpar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
