import React, { useState, useEffect, useRef } from 'react';
import type { EditorSettings } from '../../types/editor.types';
import { ThemeSelector } from './index';
import Z_INDEX from '../../constants/zIndex';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  theme,
  onThemeChange,
}) => {
  const [localSettings, setLocalSettings] = useState<EditorSettings>(settings);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle settings changes
  const handleSettingChange = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  // Reset settings to defaults
  const handleReset = () => {
    const defaultSettings: EditorSettings = {
      indentSize: 2,
      indentType: 'spaces',
      wordWrap: false,
      lineNumbers: true,
      minimap: true,
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

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

  // Focus trap inside modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: Z_INDEX.MODAL_OVERLAY
      }}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          maxHeight: '80vh',
          overflowY: 'auto',
          width: '95%',
          maxWidth: '450px',
          position: 'relative',
          zIndex: Z_INDEX.MODAL_CONTENT
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            编辑器设置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="关闭设置"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              外观
            </h3>
            <div className="pl-4">
              <ThemeSelector
                theme={theme}
                onThemeChange={onThemeChange}
              />
            </div>
          </div>

          {/* Editor Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              编辑器
            </h3>
            <div className="space-y-4 pl-4">
              {/* Indent Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  缩进大小
                </label>
                <select
                  value={localSettings.indentSize}
                  onChange={(e) => handleSettingChange('indentSize', Number(e.target.value) as 2 | 4)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={2}>2 个空格</option>
                  <option value={4}>4 个空格</option>
                </select>
              </div>

              {/* Indent Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  缩进类型
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="indentType"
                      value="spaces"
                      checked={localSettings.indentType === 'spaces'}
                      onChange={(e) => handleSettingChange('indentType', e.target.value as 'spaces' | 'tabs')}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">空格</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="indentType"
                      value="tabs"
                      checked={localSettings.indentType === 'tabs'}
                      onChange={(e) => handleSettingChange('indentType', e.target.value as 'spaces' | 'tabs')}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">制表符</span>
                  </label>
                </div>
              </div>

              {/* Word Wrap */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.wordWrap}
                    onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
                    className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    自动换行
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  将长行自动换行以适应编辑器宽度
                </p>
              </div>

              {/* Line Numbers */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.lineNumbers}
                    onChange={(e) => handleSettingChange('lineNumbers', e.target.checked)}
                    className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    行号
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  在编辑器中显示行号
                </p>
              </div>

              {/* Minimap */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.minimap}
                    onChange={(e) => handleSettingChange('minimap', e.target.checked)}
                    className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    缩略图
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  显示文档的缩略图概览
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            重置为默认值
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;