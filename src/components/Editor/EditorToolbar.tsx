import React from 'react';

interface EditorToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onSearch: () => void;
  onSettings: () => void;
  onSave: () => void;
  onOpen: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isValid: boolean;
  theme: 'light' | 'dark';
  disabled?: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onMinify,
  onValidate,
  onSearch,
  onSettings,
  onSave,
  onOpen,
  onCopy,
  onCut,
  onPaste,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isValid,
  theme,
  disabled = false
}) => {
  const buttonBaseClass = `
    px-3 py-1.5 text-sm rounded-md transition-colors duration-200 flex items-center justify-center
    ${theme === 'dark' 
      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const disabledButtonClass = `
    px-3 py-1.5 text-sm rounded-md flex items-center justify-center opacity-50 cursor-not-allowed
    ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
  `;

  const ToolbarButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }> = ({ onClick, children, title, disabled: buttonDisabled = false, variant = 'default' }) => {
    const isDisabled = disabled || buttonDisabled;
    
    let variantClass = '';
    if (!isDisabled && variant !== 'default') {
      switch (variant) {
        case 'success':
          variantClass = theme === 'dark' 
            ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
            : 'text-green-600 hover:text-green-700 hover:bg-green-50';
          break;
        case 'warning':
          variantClass = theme === 'dark' 
            ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20' 
            : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50';
          break;
        case 'danger':
          variantClass = theme === 'dark' 
            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
            : 'text-red-600 hover:text-red-700 hover:bg-red-50';
          break;
      }
    }

    return (
      <button
        onClick={isDisabled ? undefined : onClick}
        className={isDisabled ? disabledButtonClass : `${buttonBaseClass} ${variantClass}`}
        title={title}
        disabled={isDisabled}
      >
        {children}
      </button>
    );
  };

  const Separator = () => (
    <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
  );

  return (
    <div className={`
      flex items-center space-x-1 px-3 py-2 border-b
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      {/* File operations */}
      <ToolbarButton
        onClick={onOpen}
        title="Open file (Ctrl+O)"
      >
        Open
      </ToolbarButton>
      <ToolbarButton
        onClick={onSave}
        title="Save file (Ctrl+S)"
      >
        Save
      </ToolbarButton>

      <Separator />

      {/* Edit operations */}
      <ToolbarButton
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
      >
        Undo
      </ToolbarButton>
      <ToolbarButton
        onClick={onRedo}
        title="Redo (Ctrl+Y)"
        disabled={!canRedo}
      >
        Redo
      </ToolbarButton>

      <Separator />

      {/* Clipboard operations */}
      <ToolbarButton
        onClick={onCut}
        title="Cut (Ctrl+X)"
      >
        Cut
      </ToolbarButton>
      <ToolbarButton
        onClick={onCopy}
        title="Copy (Ctrl+C)"
      >
        Copy
      </ToolbarButton>
      <ToolbarButton
        onClick={onPaste}
        title="Paste (Ctrl+V)"
      >
        Paste
      </ToolbarButton>

      <Separator />

      {/* JSON operations */}
      <ToolbarButton
        onClick={onFormat}
        title="Format JSON (Alt+Shift+F)"
        variant={isValid ? 'default' : 'warning'}
      >
        Format
      </ToolbarButton>
      <ToolbarButton
        onClick={onMinify}
        title="Minify JSON"
        variant={isValid ? 'default' : 'warning'}
      >
        Minify
      </ToolbarButton>
      <ToolbarButton
        onClick={onValidate}
        title="Validate JSON"
        variant={isValid ? 'success' : 'danger'}
      >
        <div className="flex items-center">
          Validate
          {!isValid && (
            <div className="ml-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </ToolbarButton>

      <Separator />

      {/* Utility operations */}
      <ToolbarButton
        onClick={onSearch}
        title="Find and Replace (Ctrl+F)"
      >
        Search
      </ToolbarButton>
      <ToolbarButton
        onClick={onSettings}
        title="Settings"
      >
        Settings
      </ToolbarButton>
    </div>
  );
};

export default EditorToolbar;