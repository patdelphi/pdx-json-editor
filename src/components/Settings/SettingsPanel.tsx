// Placeholder for SettingsPanel component
import React from 'react';

interface SettingsPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen = false,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Indent Size
            </label>
            <select className="w-full px-3 py-2 border rounded">
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Word Wrap
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
