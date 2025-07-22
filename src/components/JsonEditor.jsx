import { useRef, useState, useEffect, useCallback } from 'preact/hooks';
import { Box, Paper, Snackbar, Alert, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Editor from '@monaco-editor/react';
import { configureJsonLanguage, configureJsonFolding, getEditorOptions } from '../services/monacoService';
import { useJsonValidation } from '../hooks/useJsonValidation';
import { useJsonEditor } from '../hooks/useJsonEditor';
import { useJsonSchema } from '../hooks/useJsonSchema';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useBreakpoint } from '../hooks/useResponsive';
import { useTheme } from '../theme/ThemeContext';
import { EditorToolbar } from './EditorToolbar';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { StatusBar } from './StatusBar';

const DEFAULT_JSON = `{
  "name": "PDX JSON Editor",
  "version": "1.0.0",
  "description": "A lightweight JSON editor with Monaco Editor",
  "features": [
    "Syntax highlighting",
    "Error validation",
    "Formatting",
    "Search and replace",
    "File operations"
  ],
  "settings": {
    "theme": "light",
    "indentation": 2,
    "wordWrap": true
  }
}`;

export function JsonEditor({ 
  onSearchClick,
  onSettingsClick,
  onDiffViewerClick,
  value: externalValue,
  onChange: externalOnChange,
  isLoading,
  isLargeFile = false
}) {
  // 使用主题上下文
  const { themeId, monacoTheme } = useTheme();
  // 使用响应式Hook
  const { isMobile, isTablet } = useBreakpoint();
  // Schema对话框状态
  const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
  // 性能优化状态
  const [performanceMode, setPerformanceMode] = useState(isLargeFile);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  // 编辑器字体大小
  const [fontSize, setFontSize] = useState(14);
  
  // 显示提示信息
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // 增大字体大小
  const increaseFontSize = useCallback(() => {
    if (editorRef.current && monacoRef.current) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      editorRef.current.updateOptions({ fontSize: newSize });
      showAlert(`字体大小已增加到 ${newSize}px`, 'info');
    }
  }, [fontSize]);
  
  // 减小字体大小
  const decreaseFontSize = useCallback(() => {
    if (editorRef.current && monacoRef.current) {
      const newSize = Math.max(8, fontSize - 2); // 最小不低于8px
      setFontSize(newSize);
      editorRef.current.updateOptions({ fontSize: newSize });
      showAlert(`字体大小已减小到 ${newSize}px`, 'info');
    }
  }, [fontSize]);
  
  // 使用自定义Hooks
  const { 
    value: internalValue, 
    setValue: setInternalValue, 
    formatJson, 
    compressJson, 
    tryFixJson, 
    indentSize, 
    setIndentSize, 
    error: jsonError 
  } = useJsonEditor(externalValue || DEFAULT_JSON);
  
  // 使用外部值或内部值
  const value = externalValue !== undefined ? externalValue : internalValue;
  
  const { errors, validate, isValid, setModelMarkers } = useJsonValidation();
  
  // 使用JSON Schema Hook
  const {
    schemas,
    selectedSchemaId,
    setSelectedSchemaId,
    addSchema,
    deleteSchema,
    updateSchema,
    autoDetectSchema
  } = useJsonSchema(monacoRef.current, value);

  // 处理编辑器内容变化
  const handleEditorChange = (newValue) => {
    if (externalValue === undefined) {
      setInternalValue(newValue);
    }
    
    if (externalOnChange) {
      externalOnChange(newValue);
    }
    
    validate(newValue);
  };

  // 处理编辑器挂载
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // 设置初始字体大小
    editor.updateOptions({ fontSize });
    
    // 配置JSON语言支持
    configureJsonLanguage(monaco);
    
    // 配置JSON折叠（如果不是大文件）
    if (!performanceMode) {
      configureJsonFolding(monaco);
    }
    
    // 初始验证（如果不是大文件）
    if (!performanceMode) {
      const initialErrors = validate(editor.getValue());
      setModelMarkers(monaco, editor.getModel());
    }
    
    // 监听光标位置变化
    editor.onDidChangeCursorPosition(e => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });
    
    // 保存原始内容，用于差异对比
    const initialContent = editor.getValue();
    if (window.pdxJsonEditor?.saveOriginalContent) {
      window.pdxJsonEditor.saveOriginalContent(initialContent);
    }
    
    // 直接设置格式化、压缩和修复功能
    window.pdxJsonEditor = window.pdxJsonEditor || {};
    
    // 格式化JSON
    window.pdxJsonEditor.formatJson = () => {
      try {
        const value = editor.getValue();
        const formatted = formatJson(value, indentSize);
        editor.setValue(formatted);
        showAlert('JSON已格式化', 'success');
        return true;
      } catch (error) {
        showAlert(`格式化失败: ${error.message}`, 'error');
        return false;
      }
    };
    
    // 压缩JSON
    window.pdxJsonEditor.compressJson = () => {
      try {
        const value = editor.getValue();
        const compressed = compressJson(value);
        editor.setValue(compressed);
        showAlert('JSON已压缩', 'success');
        return true;
      } catch (error) {
        showAlert(`压缩失败: ${error.message}`, 'error');
        return false;
      }
    };
    
    // 尝试修复JSON
    window.pdxJsonEditor.tryFixJson = () => {
      try {
        const value = editor.getValue();
        const fixed = tryFixJson(value);
        editor.setValue(fixed);
        showAlert('JSON已尝试修复', 'success');
        return true;
      } catch (error) {
        showAlert(`修复失败: ${error.message}`, 'error');
        return false;
      }
    };
    
    // 添加编辑器命令
    editor.addAction({
      id: 'format-json',
      label: '格式化JSON',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
      ],
      run: window.pdxJsonEditor.formatJson
    });
    
    editor.addAction({
      id: 'compress-json',
      label: '压缩JSON',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM
      ],
      run: window.pdxJsonEditor.compressJson
    });
    
    // 尝试自动检测Schema（如果不是大文件）
    if (!performanceMode) {
      setTimeout(() => {
        const detectedSchema = autoDetectSchema();
        if (detectedSchema) {
          showAlert(`已自动检测并应用Schema: ${detectedSchema}`, 'info');
        }
      }, 500);
    }
    
    // 如果是大文件，显示性能模式提示
    if (performanceMode) {
      showAlert('已启用性能模式，部分功能已禁用以提高性能', 'info');
    }
  };
  
  // 折叠所有代码
  const handleFoldAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.foldAll')?.run();
    }
  }, []);
  
  // 展开所有代码
  const handleUnfoldAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.unfoldAll')?.run();
    }
  }, []);

  // 格式化JSON
  const handleFormat = useCallback(() => {
    try {
      const formatted = formatJson();
      if (externalOnChange) {
        externalOnChange(formatted);
      }
      showAlert('JSON已格式化', 'success');
    } catch (err) {
      showAlert(`格式化失败: ${err.message}`, 'error');
    }
  }, [formatJson, externalOnChange]);

  // 压缩JSON
  const handleCompress = useCallback(() => {
    try {
      const compressed = compressJson();
      if (externalOnChange) {
        externalOnChange(compressed);
      }
      showAlert('JSON已压缩', 'success');
    } catch (err) {
      showAlert(`压缩失败: ${err.message}`, 'error');
    }
  }, [compressJson, externalOnChange]);

  // 尝试修复JSON
  const handleTryFix = useCallback(() => {
    const fixed = tryFixJson();
    if (externalOnChange) {
      externalOnChange(fixed);
    }
    
    if (jsonError) {
      showAlert(`修复尝试: ${jsonError.message}`, 'warning');
    } else {
      showAlert('JSON已尝试修复', 'success');
    }
  }, [tryFixJson, jsonError, externalOnChange]);
  
  // 处理自动检测Schema
  const handleAutoDetectSchema = useCallback(() => {
    const detectedSchema = autoDetectSchema();
    if (detectedSchema) {
      const schema = schemas.find(s => s.id === detectedSchema);
      showAlert(`已检测并应用Schema: ${schema?.name || detectedSchema}`, 'success');
    } else {
      showAlert('未能检测到匹配的Schema', 'info');
    }
  }, [autoDetectSchema, schemas]);
  
  // 处理Schema对话框打开
  const handleSchemaDialogOpen = useCallback(() => {
    setSchemaDialogOpen(true);
  }, []);
  
  // 处理Schema对话框关闭
  const handleSchemaDialogClose = useCallback(() => {
    setSchemaDialogOpen(false);
  }, []);

  // 显示提示信息
  const showAlert = (message, severity) => {
    console.log(`显示提示: ${message} (${severity})`);
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // 关闭提示信息
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // 当错误变化时更新编辑器标记
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      setModelMarkers(monacoRef.current, editorRef.current.getModel());
    }
  }, [errors, setModelMarkers]);

  // 当主题或性能模式改变时更新编辑器选项
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      
      // 更新主题
      editor.updateOptions({ 
        theme: monacoTheme,
        // 根据性能模式更新其他选项
        ...(performanceMode ? {
          folding: false,
          minimap: { enabled: false },
          bracketPairColorization: { enabled: false },
          renderWhitespace: 'none',
          renderControlCharacters: false,
          renderIndentGuides: false,
          occurrencesHighlight: false,
          renderLineHighlight: 'none'
        } : {})
      });
    }
  }, [monacoTheme, performanceMode]);
  
  // 在组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (editorRef.current && performanceMode) {
        // 清理大文件相关资源
        const model = editorRef.current.getModel();
        if (model) {
          // 确保在组件卸载时释放模型资源
          setTimeout(() => {
            try {
              model.dispose();
            } catch (e) {
              console.error('清理编辑器模型资源失败:', e);
            }
          }, 0);
        }
      }
    };
  }, [performanceMode]);
  
  // 处理撤销操作
  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  }, []);
  
  // 处理重做操作
  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  }, []);

  // 注册键盘快捷键
  const { showHelp, setShowHelp, toggleHelp } = useKeyboardShortcuts({
    format: handleFormat,
    compress: handleCompress,
    search: onSearchClick,
    save: () => window.pdxJsonEditor?.saveFile?.(),
    new: () => window.pdxJsonEditor?.newFile?.(),
    open: () => window.pdxJsonEditor?.openFile?.(),
    diff: onDiffViewerClick,
    foldAll: handleFoldAll,
    unfoldAll: handleUnfoldAll,
    undo: handleUndo,
    redo: handleRedo
  });

  // 应用编辑器设置
  const applySettings = useCallback((settings) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    
    // 应用编辑器设置
    editor.updateOptions({
      // 缩略图设置
      minimap: {
        enabled: settings.minimapEnabled,
        showSlider: settings.minimapShowSlider,
        renderCharacters: settings.minimapRenderCharacters,
        side: settings.minimapSide
      },
      
      // 基本编辑器设置
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      tabSize: settings.indentSize,
      insertSpaces: settings.indentType === 'spaces',
      
      // 智能编辑设置
      autoClosingBrackets: settings.autoClosingBrackets ? 'always' : 'never',
      autoClosingQuotes: settings.autoClosingQuotes ? 'always' : 'never',
      matchBrackets: settings.matchBrackets ? 'always' : 'never',
      bracketPairColorization: {
        enabled: settings.bracketPairColorization
      },
      
      // 多光标和选择设置
      multiCursorModifier: settings.multiCursorModifier,
      columnSelection: settings.columnSelection
    });
    
    // 应用缩进设置
    setIndentSize(settings.indentSize);
  }, [setIndentSize]);
  
  // 加载保存的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('pdx-json-editor-settings');
    if (savedSettings && editorRef.current) {
      try {
        const settings = JSON.parse(savedSettings);
        applySettings(settings);
      } catch (err) {
        console.error('加载设置失败:', err);
      }
    }
  }, [applySettings]);
  
  // 暴露方法给父组件
  useEffect(() => {
    if (window.pdxJsonEditor) {
      // 保留可能已经在handleEditorDidMount中设置的格式化、压缩和修复功能
      const existingFormatJson = window.pdxJsonEditor.formatJson;
      const existingCompressJson = window.pdxJsonEditor.compressJson;
      const existingTryFixJson = window.pdxJsonEditor.tryFixJson;
      
      window.pdxJsonEditor.formatJson = existingFormatJson || handleFormat;
      window.pdxJsonEditor.compressJson = existingCompressJson || handleCompress;
      window.pdxJsonEditor.tryFixJson = existingTryFixJson || handleTryFix;
      window.pdxJsonEditor.applySettings = applySettings;
      window.pdxJsonEditor.getCurrentContent = () => value;
      window.pdxJsonEditor.setContent = handleEditorChange;
      window.pdxJsonEditor.getEditorRef = () => editorRef.current;
      window.pdxJsonEditor.getMonacoRef = () => monacoRef.current;
    } else {
      window.pdxJsonEditor = {
        formatJson: handleFormat,
        compressJson: handleCompress,
        tryFixJson: handleTryFix,
        applySettings: applySettings,
        getCurrentContent: () => value,
        setContent: handleEditorChange,
        getEditorRef: () => editorRef.current,
        getMonacoRef: () => monacoRef.current
      };
    }
    
    // 添加调试日志
    console.log('已设置全局编辑器功能:', {
      formatJson: !!window.pdxJsonEditor.formatJson,
      compressJson: !!window.pdxJsonEditor.compressJson,
      tryFixJson: !!window.pdxJsonEditor.tryFixJson
    });
    
    return () => {
      if (window.pdxJsonEditor) {
        delete window.pdxJsonEditor.formatJson;
        delete window.pdxJsonEditor.compressJson;
        delete window.pdxJsonEditor.tryFixJson;
        delete window.pdxJsonEditor.applySettings;
        delete window.pdxJsonEditor.getCurrentContent;
        delete window.pdxJsonEditor.setContent;
        delete window.pdxJsonEditor.getEditorRef;
        delete window.pdxJsonEditor.getMonacoRef;
      }
    };
  }, [handleFormat, handleCompress, handleTryFix, applySettings, value, handleEditorChange]);

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* 桌面版工具栏 */}
      {!isMobile && (
        <EditorToolbar 
          onFoldAllClick={handleFoldAll}
          onUnfoldAllClick={handleUnfoldAll}
          onSearchClick={onSearchClick}
          onSettingsClick={onSettingsClick}
          onDiffViewerClick={onDiffViewerClick}
          onKeyboardShortcutsClick={toggleHelp}
          onIncreaseFontSize={increaseFontSize}
          onDecreaseFontSize={decreaseFontSize}
          schemas={schemas}
          selectedSchemaId={selectedSchemaId}
          onSelectSchema={setSelectedSchemaId}
          onAddSchema={addSchema}
          onDeleteSchema={deleteSchema}
          onUpdateSchema={updateSchema}
          onAutoDetectSchema={handleAutoDetectSchema}
        />
      )}
      
      {/* 移动版工具栏 */}
      <MobileEditorToolbar
        onFoldAllClick={handleFoldAll}
        onUnfoldAllClick={handleUnfoldAll}
        onSearchClick={onSearchClick}
        onSettingsClick={onSettingsClick}
        onDiffViewerClick={onDiffViewerClick}
        onSchemaClick={handleSchemaDialogOpen}
        onKeyboardShortcutsClick={toggleHelp}
      />
      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 10
            }}
          >
            <Typography variant="h6" color="white">
              加载中...
            </Typography>
          </Box>
        )}
        <Editor
          height="100%"
          defaultLanguage="json"
          defaultValue={DEFAULT_JSON}
          value={value}
          onChange={handleEditorChange}
          theme={monacoTheme}
          options={getEditorOptions(
            themeId === 'dark' || themeId === 'highContrast',
            false,
            performanceMode
          )}
          onMount={handleEditorDidMount}
          loading={<Typography variant="body1">加载编辑器中...</Typography>}
        />
      </Paper>
      <StatusBar 
        isValid={isValid}
        errors={errors}
        cursorPosition={cursorPosition}
        fileSize={value ? new Blob([value]).size : 0}
      />
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Schema对话框（移动端） */}
      <Dialog
        open={schemaDialogOpen}
        onClose={handleSchemaDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>JSON Schema</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            {/* 简化版Schema选择器 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                当前Schema: {selectedSchemaId ? schemas.find(s => s.id === selectedSchemaId)?.name || selectedSchemaId : '无'}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleAutoDetectSchema}
                sx={{ mr: 1 }}
              >
                自动检测
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setSelectedSchemaId(null)}
                disabled={!selectedSchemaId}
              >
                清除
              </Button>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              可用Schema:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {schemas.map(schema => (
                <Button
                  key={schema.id}
                  variant={selectedSchemaId === schema.id ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSelectedSchemaId(schema.id)}
                >
                  {schema.name}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSchemaDialogClose}>关闭</Button>
        </DialogActions>
      </Dialog>
      
      {/* 键盘快捷键帮助对话框 */}
      <KeyboardShortcutsDialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </Box>
  );
}