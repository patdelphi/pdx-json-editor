import { useState, useCallback } from 'react';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

export interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({
    title: '',
    message: '',
    type: 'info',
    confirmText: '确定',
    cancelText: '取消',
    showCancel: false
  });

  const openModal = useCallback((newOptions: ModalOptions) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      ...newOptions
    }));
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    openModal({
      title,
      message,
      type: 'success',
      onConfirm,
      showCancel: false
    });
  }, [openModal]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    openModal({
      title,
      message,
      type: 'error',
      onConfirm,
      showCancel: false
    });
  }, [openModal]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    openModal({
      title,
      message,
      type: 'warning',
      onConfirm,
      onCancel,
      showCancel: true
    });
  }, [openModal]);

  const showConfirm = useCallback((title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    openModal({
      title,
      message,
      type: 'info',
      onConfirm,
      onCancel,
      showCancel: true
    });
  }, [openModal]);

  return {
    isOpen,
    options,
    openModal,
    closeModal,
    showSuccess,
    showError,
    showWarning,
    showConfirm
  };
};

export default useModal;