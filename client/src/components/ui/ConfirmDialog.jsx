import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure you want to perform this action?', confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', isLoading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="flex gap-4">
        <div className={`p-2 rounded-full h-fit ${type === 'danger' ? 'bg-rose-500/10 text-rose-400' : 'bg-brand-500/10 text-brand-400'}`}>
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant={type === 'danger' ? 'danger' : 'primary'} size="sm" onClick={onConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmDialog;
