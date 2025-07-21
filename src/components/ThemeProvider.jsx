import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeContextProvider, useTheme } from '../theme/ThemeContext.jsx';

/**
 * 主题提供者组件
 * 提供主题状态和MUI主题提供者
 */
export function ThemeProvider({ children }) {
  return (
    <ThemeContextProvider>
      <ThemedContent>
        {children}
      </ThemedContent>
    </ThemeContextProvider>
  );
}

/**
 * 主题内容组件
 * 使用主题上下文提供MUI主题
 */
function ThemedContent({ children }) {
  const { theme } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
}