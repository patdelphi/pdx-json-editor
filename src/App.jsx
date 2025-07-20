import { useState } from 'preact/hooks';
import { CssBaseline } from '@mui/material';
import { MainLayout } from './layouts/MainLayout';
import { SearchPanel } from './components/SearchPanel';
import { SettingsDialog } from './components/SettingsDialog';
import { FileDropZone } from './components/FileDropZone';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LargeFileWarning } from './components/LargeFileWarning';
import { DiffViewer } from './components/DiffViewer';

export function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [largeFileWarningOpen, setLargeFileWarningOpen] = useState(false);
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);
  const [errors, setErrors] = useState([
    { line: 8, column: 12, message: '示例错误：无效的值', severity: 'error' },
    { line: 9, column: 18, message: '示例警告：不推荐的属性', severity: 'warning' }
  ]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const toggleLargeFileWarning = () => {
    setLargeFileWarningOpen(!largeFileWarningOpen);
  };

  const toggleDiffViewer = () => {
    setDiffViewerOpen(!diffViewerOpen);
  };

  const handleFileDrop = (files) => {
    // 模拟大文件警告
    if (files && files.length > 0 && files[0].size > 1000000) {
      setLargeFileWarningOpen(true);
    }
  };

  return (
    <>
      <CssBaseline />
      <MainLayout 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onSearchClick={toggleSearch}
        onSettingsClick={toggleSettings}
        onDiffViewerClick={toggleDiffViewer}
      />
      
      <SearchPanel open={searchOpen} onClose={toggleSearch} />
      <SettingsDialog open={settingsOpen} onClose={toggleSettings} />
      <FileDropZone onFileDrop={handleFileDrop} />
      <ErrorDisplay errors={errors} />
      <LargeFileWarning 
        open={largeFileWarningOpen} 
        fileSize={5242880} 
        onContinue={() => setLargeFileWarningOpen(false)} 
        onCancel={() => setLargeFileWarningOpen(false)} 
      />
      
      {diffViewerOpen && (
        <DiffViewer 
          original={'{\n  "example": "original content"\n}'}
          modified={'{\n  "example": "modified content"\n}'}
          onClose={toggleDiffViewer}
        />
      )}
    </>
  );
}