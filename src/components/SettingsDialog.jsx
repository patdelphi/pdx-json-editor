import { useState } from 'preact/hooks';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Divider,
  Box
} from '@mui/material';

/**
 * 设置对话框组件
 * 允许用户自定义编辑器设置
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 对话框是否打开
 * @param {Function} props.onClose - 关闭对话框的处理函数
 */
export function SettingsDialog({ open, onClose }) {
  // 编辑器设置状态
  const [settings, setSettings] = useState({
    // 缩略图设置
    minimapEnabled: true,
    minimapShowSlider: 'always',
    minimapRenderCharacters: true,
    minimapSide: 'right',
    
    // 编辑器设置
    wordWrap: false,
    lineNumbers: true,
    indentSize: 2,
    indentType: 'spaces',
    
    // 智能编辑设置
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    bracketPairColorization: true,
    matchBrackets: true,
    
    // 多光标和选择设置
    multiCursorModifier: 'alt',
    columnSelection: false,
    
    // 主题设置
    followSystemTheme: false
  });
  
  // 处理设置变更
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // 处理保存设置
  const handleSave = () => {
    // 保存设置到本地存储
    localStorage.setItem('pdx-json-editor-settings', JSON.stringify(settings));
    
    // 应用设置到编辑器
    if (window.pdxJsonEditor && window.pdxJsonEditor.applySettings) {
      window.pdxJsonEditor.applySettings(settings);
    }
    
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑器设置</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>缩略图设置</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.minimapEnabled}
                  onChange={(e) => handleSettingChange('minimapEnabled', e.target.checked)}
                />
              }
              label="启用缩略图"
            />
            
            {settings.minimapEnabled && (
              <>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>缩略图滑块</InputLabel>
                  <Select
                    value={settings.minimapShowSlider}
                    label="缩略图滑块"
                    onChange={(e) => handleSettingChange('minimapShowSlider', e.target.value)}
                  >
                    <MenuItem value="always">始终显示</MenuItem>
                    <MenuItem value="mouseover">鼠标悬停时显示</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.minimapRenderCharacters}
                      onChange={(e) => handleSettingChange('minimapRenderCharacters', e.target.checked)}
                    />
                  }
                  label="在缩略图中渲染字符"
                />
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>缩略图位置</InputLabel>
                  <Select
                    value={settings.minimapSide}
                    label="缩略图位置"
                    onChange={(e) => handleSettingChange('minimapSide', e.target.value)}
                  >
                    <MenuItem value="right">右侧</MenuItem>
                    <MenuItem value="left">左侧</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </FormGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>编辑器设置</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.wordWrap}
                  onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
                />
              }
              label="自动换行"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.lineNumbers}
                  onChange={(e) => handleSettingChange('lineNumbers', e.target.checked)}
                />
              }
              label="显示行号"
            />
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>缩进大小</InputLabel>
              <Select
                value={settings.indentSize}
                label="缩进大小"
                onChange={(e) => handleSettingChange('indentSize', e.target.value)}
              >
                <MenuItem value={2}>2 空格</MenuItem>
                <MenuItem value={4}>4 空格</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>缩进类型</InputLabel>
              <Select
                value={settings.indentType}
                label="缩进类型"
                onChange={(e) => handleSettingChange('indentType', e.target.value)}
              >
                <MenuItem value="spaces">空格</MenuItem>
                <MenuItem value="tabs">制表符</MenuItem>
              </Select>
            </FormControl>
          </FormGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>智能编辑设置</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoClosingBrackets}
                  onChange={(e) => handleSettingChange('autoClosingBrackets', e.target.checked)}
                />
              }
              label="自动闭合括号"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoClosingQuotes}
                  onChange={(e) => handleSettingChange('autoClosingQuotes', e.target.checked)}
                />
              }
              label="自动闭合引号"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.bracketPairColorization}
                  onChange={(e) => handleSettingChange('bracketPairColorization', e.target.checked)}
                />
              }
              label="括号对着色"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.matchBrackets}
                  onChange={(e) => handleSettingChange('matchBrackets', e.target.checked)}
                />
              }
              label="括号匹配高亮"
            />
          </FormGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>多光标和选择设置</Typography>
          <FormGroup>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>多光标修饰键</InputLabel>
              <Select
                value={settings.multiCursorModifier}
                label="多光标修饰键"
                onChange={(e) => handleSettingChange('multiCursorModifier', e.target.value)}
              >
                <MenuItem value="alt">Alt</MenuItem>
                <MenuItem value="ctrlCmd">Ctrl (Cmd)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.columnSelection}
                  onChange={(e) => handleSettingChange('columnSelection', e.target.checked)}
                />
              }
              label="启用列选择模式"
            />
          </FormGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>主题设置</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.followSystemTheme}
                  onChange={(e) => handleSettingChange('followSystemTheme', e.target.checked)}
                />
              }
              label="跟随系统主题"
            />
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
}