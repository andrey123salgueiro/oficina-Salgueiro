import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  highlightInfo?: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  highlightInfo = [],
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative ring-1 ring-red-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            isDestructive 
              ? 'bg-red-950/80 text-red-400 border border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
              : 'bg-amber-950/80 text-amber-400 border border-amber-800/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
          }`}>
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-black text-white font-chakra uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
              {description}
            </p>

            {highlightInfo.length > 0 && (
              <div className="mt-3.5 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1.5 text-xs">
                {highlightInfo.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-zinc-300">
                    <span className="text-zinc-500 font-semibold">{item.label}:</span>
                    <span className="font-bold text-white font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-zinc-800"
          >
            {cancelText}
          </button>

          <button
            type="button"
            id="confirm-modal-action-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50 hover:shadow-red-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/50 hover:shadow-amber-500/30'
            }`}
          >
            {isDestructive ? <Trash2 className="w-4 h-4" /> : null}
            <span>{isLoading ? 'Excluindo...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
