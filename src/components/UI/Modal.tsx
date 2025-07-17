import React, { useEffect, useState, useRef } from 'react';
import Z_INDEX from '../../constants/zIndex';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  actions
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      // Ensure DOM is updated before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Focus trap inside modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 overflow-y-auto" 
      style={{ 
        zIndex: Z_INDEX.MODAL_OVERLAY,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      {/* 背景遮罩 */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out'
        }} 
        aria-hidden="true"
        onClick={onClose}
      ></div>
      
      {/* 模态框面板 */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: '500px',
          margin: '0 1rem',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
          zIndex: Z_INDEX.MODAL_CONTENT,
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()} // 防止点击事件冒泡到背景层
      >
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {getIconByType()}
            <div style={{ marginLeft: '1rem', width: '100%' }}>
              <h3 
                style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  marginTop: 0,
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}
                id="modal-title"
              >
                {title}
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#4B5563' }}>
                {children}
              </div>
            </div>
          </div>
        </div>
        <div 
          style={{ 
            backgroundColor: '#F9FAFB', 
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #E5E7EB'
          }}
        >
          {actions || (
            <button
              type="button"
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={onClose}
            >
              确定
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;