import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'danger';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  theme = 'light',
  variant = 'default'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const confirmButtonClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  const cancelButtonClass = theme === 'dark'
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          max-w-md w-full mx-4 p-6 rounded-lg shadow-xl
          ${theme === 'dark' 
            ? 'bg-gray-800 text-gray-100' 
            : 'bg-white text-gray-900'
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        {/* Header */}
        <div className="mb-4">
          <h3
            id="dialog-title"
            className="text-lg font-semibold"
          >
            {title}
          </h3>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p
            id="dialog-message"
            className={`
              text-sm
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            `}
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className={`
              px-4 py-2 text-sm font-medium rounded-md border transition-colors
              ${cancelButtonClass}
            `}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${confirmButtonClass}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;