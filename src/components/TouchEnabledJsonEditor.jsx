/**
 * 支持触摸手势的JSON编辑器组件
 */

import { useRef, useState, useEffect, useCallback } from 'preact/hooks';
import { Box, Paper, Snackbar, Alert, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Fab, Tooltip } from '@mui/material';
import Editor from '@monaco-editor/react';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { configureJsonLanguage, configureJsonFolding, getEditorOptions } from '../services/monacoService';
import { useJsonValidation } from '../hooks/useJsonValidation';
import { useJsonEditor } from '../hooks/useJsonEditor';
import { useJsonSchema } from '../hooks/useJsonSchema';
import { formatJson, compressJson, tryFixJson } from '../services/jsonService';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useBreakpoint, useTouchDevice } from '../hooks/useResponsive';
import { useSwipe, usePinch, useDoubleTap } from '../hooks/useGestures';
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

export function TouchEnabledJsonEditor({ 
  onSettingsClick,
  value: externalValue,
  onChange: externalOnChange,
  isLoading,
  isLargeFile = false
}) {
  // 使用主题上下文
  const { themeId, monacoTheme } = useTheme();
  // 使用响应式Hook
  const { isMobile, isTablet } = useBreakpoint();
  const isTouch = useTouchDevice();
  // Schema对话框状态
  const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
  // 性能优化状态
  const [performanceMode, setPerformanceMode] = useState(isLargeFile);
  // 编辑器字体大小
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [gestureMode, setGestureMode] = useState('scroll'); // 'scroll' 或 'zoom'
  
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
  } = useJsonEditor(externalValue !== undefined ? externalValue : '');
  
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
  
  // 这里之前有一个setContent函数，但它与setEditorContent功能重复，已删除

  // 设置编辑器内容
  const setEditorContent = useCallback((newContent) => {
    if (editorRef.current) {
      // 保存当前光标位置
      const position = editorRef.current.getPosition();
      
      // 设置新内容
      editorRef.current.setValue(newContent);
      
      // 尝试恢复光标位置（如果位置仍然有效）
      try {
        const model = editorRef.current.getModel();
        const lineCount = model.getLineCount();
        const lastLineLength = model.getLineLength(lineCount);
        
        if (position && position.lineNumber <= lineCount) {
          const maxColumn = position.lineNumber === lineCount ? lastLineLength + 1 : model.getLineLength(position.lineNumber) + 1;
          const newPosition = {
            lineNumber: position.lineNumber,
            column: Math.min(position.column, maxColumn)
          };
          editorRef.current.setPosition(newPosition);
        }
      } catch (err) {
        // 如果恢复光标位置失败，忽略错误
        console.warn('无法恢复光标位置:', err);
      }
    }
    
    // 同时更新React状态
    if (externalOnChange) {
      externalOnChange(newContent);
    } else {
      setInternalValue(newContent);
    }
  }, [externalOnChange, setInternalValue]);

  // 处理编辑器挂载
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
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
    
    // 监听内容变化，实时验证
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      validate(content);
    });
    
    // 配置错误高亮样式
    const styleElement = document.getElementById('json-error-styles');
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = 'json-error-styles';
      style.innerHTML = `
        .json-error-line {
          background-color: rgba(255, 0, 0, 0.1);
          border-left: 3px solid red;
        }
        .json-error-glyph {
          background-color: red;
          border-radius: 50%;
          margin-left: 5px;
        }
        .json-error-inline {
          text-decoration: wavy underline red;
        }
      `;
      document.head.appendChild(style);
    }
    
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
    if (!editorRef.current || !monacoRef.current) {
      showAlert('编辑器未准备就绪', 'error');
      return;
    }
    
    try {
      // 使用Monaco编辑器的内置格式化功能
      const formatAction = editorRef.current.getAction('editor.action.formatDocument');
      if (formatAction) {
        formatAction.run().then(() => {
          showAlert('JSON已格式化', 'success');
        }).catch(err => {
          showAlert(`格式化失败: ${err.message}`, 'error');
        });
      } else {
        // 如果找不到内置格式化动作，显示错误
        showAlert('无法找到格式化功能', 'error');
      }
    } catch (err) {
      showAlert(`格式化失败: ${err.message}`, 'error');
    }
  }, []);

  // 压缩JSON - 使用Monaco编辑器的内置功能
  const handleCompress = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) {
      showAlert('编辑器未准备就绪', 'error');
      return;
    }
    
    try {
      // 获取当前编辑器模型
      const model = editorRef.current.getModel();
      if (!model) {
        showAlert('无法获取编辑器模型', 'error');
        return;
      }
      
      // 获取当前文本
      const text = model.getValue();
      
      // 验证JSON是否有效
      try {
        JSON.parse(text);
      } catch (parseErr) {
        showAlert(`无法压缩无效的JSON: ${parseErr.message}`, 'error');
        return;
      }
      
      // 使用Monaco的编辑操作来压缩JSON
      // 这种方法不会改变内容，只会移除空白字符
      const edits = [];
      const lineCount = model.getLineCount();
      
      // 创建一个编辑操作，替换整个文本
      // 使用正则表达式移除不必要的空白字符
      const compressedText = text
        // 移除行注释
        .replace(/\/\/.*$/gm, '')
        // 移除块注释
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 移除行首和行尾的空白
        .replace(/^\s+|\s+$/gm, '')
        // 移除冒号后的空白
        .replace(/:\s+/g, ':')
        // 移除逗号后的空白
        .replace(/,\s+/g, ',')
        // 移除大括号和方括号周围的空白
        .replace(/\{\s+/g, '{')
        .replace(/\s+\}/g, '}')
        .replace(/\[\s+/g, '[')
        .replace(/\s+\]/g, ']');
      
      // 应用编辑操作
      editorRef.current.executeEdits('compress', [{
        range: model.getFullModelRange(),
        text: compressedText,
        forceMoveMarkers: true
      }]);
      
      showAlert('JSON已压缩', 'success');
    } catch (err) {
      showAlert(`压缩失败: ${err.message}`, 'error');
    }
  }, []);

  // 尝试修复JSON
  const handleTryFix = useCallback(() => {
    if (!editorRef.current) {
      showAlert('编辑器未准备就绪', 'error');
      return;
    }
    
    try {
      // 直接从Monaco编辑器获取当前值
      const currentValue = editorRef.current.getValue();
      
      // 如果当前值为空，不进行修复
      if (!currentValue || currentValue.trim() === '') {
        showAlert('无内容可修复', 'warning');
        return;
      }
      
      // 尝试修复JSON
      try {
        // 首先尝试解析，如果成功则不需要修复
        JSON.parse(currentValue);
        showAlert('JSON已经是有效的，无需修复', 'info');
        return;
      } catch (parseErr) {
        // 如果解析失败，尝试修复
        const model = editorRef.current.getModel();
        if (!model) {
          showAlert('无法获取编辑器模型', 'error');
          return;
        }
        
        // 使用tryFixJson函数尝试修复
        const fixed = tryFixJson(currentValue);
        
        // 检查修复是否成功且与原始内容不同
        try {
          JSON.parse(fixed);
          
          // 只有当修复后的内容与原始内容不同时才应用更改
          if (fixed !== currentValue) {
            // 应用编辑操作
            editorRef.current.executeEdits('fix', [{
              range: model.getFullModelRange(),
              text: fixed,
              forceMoveMarkers: true
            }]);
            
            showAlert('JSON已尝试修复', 'success');
          } else {
            showAlert('JSON无法自动修复，请手动检查语法错误', 'warning');
          }
        } catch (fixErr) {
          // 如果修复失败，不进行任何更改
          showAlert(`无法自动修复JSON: ${fixErr.message}`, 'warning');
        }
      }
    } catch (err) {
      showAlert(`修复失败: ${err.message}`, 'error');
    }
  }, []);
  
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
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // 关闭提示信息
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // 当错误变化时更新编辑器标记和装饰器
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      const model = editor.getModel();
      
      // 设置错误标记
      setModelMarkers(monaco, model);
      
      // 添加自定义错误行装饰器
      if (errors.length > 0) {
        // 创建错误行的装饰器
        const errorLineDecorations = errors.map(error => ({
          range: new monaco.Range(
            error.line,
            1,
            error.line,
            model.getLineLength(error.line) + 1
          ),
          options: {
            isWholeLine: true,
            className: 'json-error-line',
            glyphMarginClassName: 'json-error-glyph',
            overviewRuler: {
              color: 'red',
              position: monaco.editor.OverviewRulerLane.Right
            },
            minimap: {
              color: 'red',
              position: monaco.editor.MinimapPosition.Inline
            },
            // 添加波浪线下划线
            inlineClassName: 'json-error-inline'
          }
        }));
        
        // 应用装饰器
        editor.deltaDecorations([], errorLineDecorations);
        
        // 添加CSS样式
        const styleElement = document.getElementById('json-error-styles');
        if (!styleElement) {
          const style = document.createElement('style');
          style.id = 'json-error-styles';
          style.innerHTML = `
            .json-error-line {
              background-color: rgba(255, 0, 0, 0.1);
              border-left: 3px solid red;
            }
            .json-error-glyph {
              background-color: red;
              border-radius: 50%;
              margin-left: 5px;
            }
            .json-error-inline {
              text-decoration: wavy underline red;
            }
          `;
          document.head.appendChild(style);
        }
      } else {
        // 如果没有错误，清除所有装饰器
        editor.deltaDecorations([], []);
      }
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
        fontSize: fontSize,
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
  }, [monacoTheme, performanceMode, fontSize]);
  
  // 注册键盘快捷键
  const { showHelp, setShowHelp, toggleHelp } = useKeyboardShortcuts({
    format: handleFormat,
    compress: handleCompress,
    search: () => {
      // 触发Monaco编辑器的原生搜索功能
      if (editorRef.current) {
        editorRef.current.getAction('actions.find')?.run();
      }
    },
    save: () => window.pdxJsonEditor?.saveFile?.(),
    new: () => window.pdxJsonEditor?.newFile?.(),
    open: () => window.pdxJsonEditor?.openFile?.(),
    foldAll: handleFoldAll,
    unfoldAll: handleUnfoldAll
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
      fontSize: settings.fontSize || fontSize,
      
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
    
    // 更新字体大小
    if (settings.fontSize) {
      setFontSize(settings.fontSize);
    }
  }, [setIndentSize, fontSize]);
  
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
    // 创建一个安全的tryFixJson包装函数，确保不会修改为默认文本
    const safeTryFixJson = () => {
      // 只有当编辑器已初始化时才执行修复
      if (editorRef.current) {
        handleTryFix();
      } else {
        console.warn('编辑器未准备就绪，无法执行修复操作');
      }
    };
    
    if (window.pdxJsonEditor) {
      window.pdxJsonEditor.formatJson = handleFormat;
      window.pdxJsonEditor.compressJson = handleCompress;
      window.pdxJsonEditor.tryFixJson = safeTryFixJson;
      window.pdxJsonEditor.applySettings = applySettings;
      window.pdxJsonEditor.getCurrentContent = () => editorRef.current ? editorRef.current.getValue() : value;
      window.pdxJsonEditor.setContent = setEditorContent;
      window.pdxJsonEditor.getEditorRef = () => editorRef.current;
      window.pdxJsonEditor.getMonacoRef = () => monacoRef.current;
    } else {
      window.pdxJsonEditor = {
        formatJson: handleFormat,
        compressJson: handleCompress,
        tryFixJson: safeTryFixJson,
        applySettings: applySettings,
        getCurrentContent: () => editorRef.current ? editorRef.current.getValue() : value,
        setContent: setEditorContent,
        getEditorRef: () => editorRef.current,
        getMonacoRef: () => monacoRef.current
      };
    }
    
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
  }, [handleFormat, handleCompress, handleTryFix, applySettings, value, setEditorContent]);
  
  // 处理字体缩放
  const handleZoomIn = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 32));
    showAlert('放大字体', 'info');
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 8));
    showAlert('缩小字体', 'info');
  }, []);
  
  // 切换手势模式
  const toggleGestureMode = useCallback(() => {
    setGestureMode(prev => prev === 'scroll' ? 'zoom' : 'scroll');
    showAlert(`已切换到${gestureMode === 'scroll' ? '缩放' : '滚动'}模式`, 'info');
  }, [gestureMode]);
  
  // 双击手势 - 重置字体大小
  const { handleTouchEnd: handleDoubleTapTouchEnd } = useDoubleTap({
    onDoubleTap: () => {
      setFontSize(14); // 重置为默认字体大小
      showAlert('已重置字体大小', 'info');
    }
  });
  
  // 捏合手势 - 缩放字体
  const { 
    handleTouchStart: handlePinchTouchStart, 
    handleTouchMove: handlePinchTouchMove,
    handleTouchEnd: handlePinchTouchEnd,
    isEnabled: isPinchEnabled
  } = usePinch({
    onPinchIn: ({ distance }) => {
      if (gestureMode === 'zoom') {
        setFontSize(prev => Math.max(prev - 1, 8));
      }
    },
    onPinchOut: ({ distance }) => {
      if (gestureMode === 'zoom') {
        setFontSize(prev => Math.min(prev + 1, 32));
      }
    }
  });
  
  // 滑动手势 - 在大文件中快速导航
  const { 
    handleTouchStart: handleSwipeTouchStart, 
    handleTouchEnd: handleSwipeTouchEnd,
    isEnabled: isSwipeEnabled
  } = useSwipe({
    threshold: 100,
    onSwipeUp: ({ distance, isQuick }) => {
      if (gestureMode === 'scroll' && isQuick && editorRef.current) {
        // 快速向上滑动 - 向上翻页
        const editor = editorRef.current;
        const scrollAmount = Math.floor(editor.getVisibleRanges()[0].endLineNumber - editor.getVisibleRanges()[0].startLineNumber);
        editor.setScrollPosition({ scrollTop: editor.getScrollTop() - scrollAmount * editor.getOption(monaco.editor.EditorOption.lineHeight) });
      }
    },
    onSwipeDown: ({ distance, isQuick }) => {
      if (gestureMode === 'scroll' && isQuick && editorRef.current) {
        // 快速向下滑动 - 向下翻页
        const editor = editorRef.current;
        const scrollAmount = Math.floor(editor.getVisibleRanges()[0].endLineNumber - editor.getVisibleRanges()[0].startLineNumber);
        editor.setScrollPosition({ scrollTop: editor.getScrollTop() + scrollAmount * editor.getOption(monaco.editor.EditorOption.lineHeight) });
      }
    }
  });
  
  // 合并触摸事件处理函数
  const handleTouchStart = (e) => {
    handlePinchTouchStart(e);
    handleSwipeTouchStart(e);
  };
  
  const handleTouchMove = (e) => {
    handlePinchTouchMove(e);
  };
  
  const handleTouchEnd = (e) => {
    handlePinchTouchEnd(e);
    handleSwipeTouchEnd(e);
    handleDoubleTapTouchEnd(e);
  };

  return (
    <Box 
      sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
      ref={editorContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 桌面版工具栏 */}
      {!isMobile && (
        <EditorToolbar 
          onFoldAllClick={handleFoldAll}
          onUnfoldAllClick={handleUnfoldAll}

          onSettingsClick={onSettingsClick}
          onKeyboardShortcutsClick={toggleHelp}
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

        onSettingsClick={onSettingsClick}
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
          defaultValue={externalValue === undefined ? DEFAULT_JSON : externalValue}
          value={value || (externalValue === undefined ? DEFAULT_JSON : externalValue)}
          onChange={handleEditorChange}
          theme={monacoTheme}
          options={getEditorOptions(
            themeId === 'dark' || themeId === 'highContrast',
            false,
            performanceMode,
            fontSize
          )}
          onMount={handleEditorDidMount}
          loading={<Typography variant="body1">加载编辑器中...</Typography>}
        />
        
        {/* 触摸设备上的缩放按钮 */}
        {isTouch && (
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title="放大字体">
              <Fab 
                color="primary" 
                size="small" 
                onClick={handleZoomIn}
                aria-label="放大字体"
              >
                <ZoomInIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="缩小字体">
              <Fab 
                color="primary" 
                size="small" 
                onClick={handleZoomOut}
                aria-label="缩小字体"
              >
                <ZoomOutIcon />
              </Fab>
            </Tooltip>
          </Box>
        )}
        
        {/* 触摸设备上的手势模式切换按钮 */}
        {isTouch && (
          <Tooltip title={`切换到${gestureMode === 'scroll' ? '缩放' : '滚动'}模式`}>
            <Fab
              color="secondary"
              size="small"
              onClick={toggleGestureMode}
              aria-label="切换手势模式"
              sx={{ position: 'absolute', bottom: 16, left: 16 }}
            >
              {gestureMode === 'scroll' ? <ZoomInIcon /> : <ZoomOutIcon />}
            </Fab>
          </Tooltip>
        )}
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