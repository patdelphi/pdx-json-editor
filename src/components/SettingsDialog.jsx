import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Divider,
  Box
} from '@mui/material';

export function SettingsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑器设置</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            外观
          </Typography>
          
          <FormControl component="fieldset" margin="dense" size="small" fullWidth>
            <FormLabel component="legend">主题</FormLabel>
            <RadioGroup row defaultValue="system">
              <FormControlLabel value="light" control={<Radio size="small" />} label="浅色" />
              <FormControlLabel value="dark" control={<Radio size="small" />} label="深色" />
              <FormControlLabel value="system" control={<Radio size="small" />} label="跟随系统" />
            </RadioGroup>
          </FormControl>
          
          <FormControlLabel
            control={<Switch size="small" />}
            label="显示行号"
            sx={{ display: 'block', mt: 1 }}
          />
          
          <FormControlLabel
            control={<Switch size="small" defaultChecked />}
            label="显示缩略图"
            sx={{ display: 'block' }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            编辑器
          </Typography>
          
          <FormControl margin="dense" size="small" fullWidth>
            <InputLabel id="indent-size-label">缩进大小</InputLabel>
            <Select
              labelId="indent-size-label"
              defaultValue={2}
              label="缩进大小"
            >
              <MenuItem value={2}>2 空格</MenuItem>
              <MenuItem value={4}>4 空格</MenuItem>
              <MenuItem value={8}>8 空格</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl component="fieldset" margin="dense" size="small" fullWidth>
            <FormLabel component="legend">缩进类型</FormLabel>
            <RadioGroup row defaultValue="spaces">
              <FormControlLabel value="spaces" control={<Radio size="small" />} label="空格" />
              <FormControlLabel value="tabs" control={<Radio size="small" />} label="制表符" />
            </RadioGroup>
          </FormControl>
          
          <FormControlLabel
            control={<Switch size="small" />}
            label="自动换行"
            sx={{ display: 'block', mt: 1 }}
          />
          
          <FormControlLabel
            control={<Switch size="small" defaultChecked />}
            label="自动保存"
            sx={{ display: 'block' }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            JSON 验证
          </Typography>
          
          <FormControlLabel
            control={<Switch size="small" defaultChecked />}
            label="实时验证"
            sx={{ display: 'block', mt: 1 }}
          />
          
          <FormControlLabel
            control={<Switch size="small" defaultChecked />}
            label="使用 JSON Schema 验证"
            sx={{ display: 'block' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onClose} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
}