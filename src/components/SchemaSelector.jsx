import { useState } from 'preact/hooks';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Typography,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * Schema选择器组件
 * @param {Object} props - 组件属性
 * @param {Object[]} props.schemas - 可用的Schema列表
 * @param {string|null} props.selectedSchemaId - 当前选中的Schema ID
 * @param {Function} props.onSelectSchema - 选择Schema的回调函数
 * @param {Function} props.onAddSchema - 添加Schema的回调函数
 * @param {Function} props.onDeleteSchema - 删除Schema的回调函数
 * @param {Function} props.onUpdateSchema - 更新Schema的回调函数
 * @param {Function} props.onAutoDetect - 自动检测Schema的回调函数
 */
export function SchemaSelector({ 
  schemas, 
  selectedSchemaId, 
  onSelectSchema, 
  onAddSchema, 
  onDeleteSchema, 
  onUpdateSchema,
  onAutoDetect
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);
  const [schemaName, setSchemaName] = useState('');
  const [schemaUri, setSchemaUri] = useState('');
  const [schemaDescription, setSchemaDescription] = useState('');
  const [schemaFileMatch, setSchemaFileMatch] = useState('');
  const [schemaContent, setSchemaContent] = useState('');
  const [schemaError, setSchemaError] = useState('');
  const [schemaSource, setSchemaSource] = useState('url'); // 'url' 或 'inline'

  // 打开添加Schema对话框
  const handleOpenAddDialog = () => {
    setEditingSchema(null);
    setSchemaName('');
    setSchemaUri('');
    setSchemaDescription('');
    setSchemaFileMatch('');
    setSchemaContent('');
    setSchemaError('');
    setSchemaSource('url');
    setDialogOpen(true);
  };

  // 打开编辑Schema对话框
  const handleOpenEditDialog = (schema) => {
    setEditingSchema(schema);
    setSchemaName(schema.name);
    setSchemaUri(schema.uri || '');
    setSchemaDescription(schema.description || '');
    setSchemaFileMatch((schema.fileMatch || []).join(', '));
    setSchemaContent(schema.schema ? JSON.stringify(schema.schema, null, 2) : '');
    setSchemaSource(schema.uri ? 'url' : 'inline');
    setSchemaError('');
    setDialogOpen(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // 保存Schema
  const handleSaveSchema = () => {
    // 验证输入
    if (!schemaName.trim()) {
      setSchemaError('Schema名称不能为空');
      return;
    }

    if (schemaSource === 'url' && !schemaUri.trim()) {
      setSchemaError('Schema URI不能为空');
      return;
    }

    if (schemaSource === 'inline') {
      try {
        if (!schemaContent.trim()) {
          setSchemaError('Schema内容不能为空');
          return;
        }
        JSON.parse(schemaContent);
      } catch (error) {
        setSchemaError('无效的JSON Schema格式');
        return;
      }
    }

    // 准备Schema对象
    const fileMatchArray = schemaFileMatch
      .split(',')
      .map(pattern => pattern.trim())
      .filter(pattern => pattern);

    const newSchema = {
      name: schemaName,
      description: schemaDescription,
      fileMatch: fileMatchArray.length > 0 ? fileMatchArray : ['*']
    };

    if (schemaSource === 'url') {
      newSchema.uri = schemaUri;
    } else {
      try {
        newSchema.schema = JSON.parse(schemaContent);
      } catch (error) {
        setSchemaError('无效的JSON Schema格式');
        return;
      }
    }

    // 添加或更新Schema
    if (editingSchema) {
      onUpdateSchema(editingSchema.id, newSchema);
    } else {
      onAddSchema(newSchema);
    }

    handleCloseDialog();
  };

  // 处理Schema选择变化
  const handleSchemaChange = (event) => {
    onSelectSchema(event.target.value === 'none' ? null : event.target.value);
  };

  // 处理删除Schema
  const handleDeleteSchema = (id, event) => {
    event.stopPropagation();
    if (window.confirm('确定要删除此Schema吗？')) {
      onDeleteSchema(id);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
        <InputLabel id="schema-select-label">JSON Schema</InputLabel>
        <Select
          labelId="schema-select-label"
          id="schema-select"
          value={selectedSchemaId || 'none'}
          label="JSON Schema"
          onChange={handleSchemaChange}
        >
          <MenuItem value="none">
            <em>无</em>
          </MenuItem>
          {schemas.map((schema) => (
            <MenuItem 
              key={schema.id} 
              value={schema.id}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                '&:hover .schema-actions': {
                  visibility: 'visible'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {schema.name}
                <Tooltip title={schema.description || ''}>
                  <HelpOutlineIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              {!schema.predefined && (
                <Box 
                  className="schema-actions"
                  sx={{ 
                    visibility: 'hidden',
                    display: 'flex'
                  }}
                >
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(schema);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleDeleteSchema(schema.id, e)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Tooltip title="添加Schema">
        <IconButton onClick={handleOpenAddDialog} size="small">
          <AddIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="自动检测Schema">
        <IconButton onClick={onAutoDetect} size="small">
          <AutoFixHighIcon />
        </IconButton>
      </Tooltip>

      {/* 添加/编辑Schema对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchema ? '编辑Schema' : '添加新Schema'}
        </DialogTitle>
        <DialogContent>
          {schemaError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {schemaError}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            label="Schema名称"
            fullWidth
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            required
          />
          
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            value={schemaDescription}
            onChange={(e) => setSchemaDescription(e.target.value)}
          />
          
          <TextField
            margin="dense"
            label="文件匹配模式 (逗号分隔)"
            fullWidth
            value={schemaFileMatch}
            onChange={(e) => setSchemaFileMatch(e.target.value)}
            helperText="例如: *.json, config.json"
          />
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2">Schema来源</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button 
                variant={schemaSource === 'url' ? 'contained' : 'outlined'} 
                onClick={() => setSchemaSource('url')}
              >
                URL
              </Button>
              <Button 
                variant={schemaSource === 'inline' ? 'contained' : 'outlined'} 
                onClick={() => setSchemaSource('inline')}
              >
                内联JSON
              </Button>
            </Box>
          </Box>
          
          {schemaSource === 'url' ? (
            <TextField
              margin="dense"
              label="Schema URL"
              fullWidth
              value={schemaUri}
              onChange={(e) => setSchemaUri(e.target.value)}
              required
              helperText="例如: https://json.schemastore.org/package.json"
            />
          ) : (
            <TextField
              margin="dense"
              label="Schema内容 (JSON)"
              fullWidth
              multiline
              rows={10}
              value={schemaContent}
              onChange={(e) => setSchemaContent(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSaveSchema} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}