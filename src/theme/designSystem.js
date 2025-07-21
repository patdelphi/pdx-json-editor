/**
 * 设计系统
 * 定义应用程序的设计系统，包括颜色、排版、间距等
 */

// 颜色系统
export const colors = {
  // 主色系
  primary: {
    main: '#3B82F6', // 蓝色
    light: '#93C5FD',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF'
  },
  
  // 辅助色系
  secondary: {
    main: '#10B981', // 绿色
    light: '#6EE7B7',
    dark: '#059669',
    contrastText: '#FFFFFF'
  },
  
  // 功能色系
  success: {
    main: '#10B981', // 绿色
    light: '#6EE7B7',
    dark: '#059669',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#F59E0B', // 橙色
    light: '#FCD34D',
    dark: '#D97706',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#EF4444', // 红色
    light: '#FCA5A5',
    dark: '#B91C1C',
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#3B82F6', // 蓝色
    light: '#93C5FD',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF'
  },
  
  // 中性色系 - 浅色模式
  light: {
    background: {
      default: '#FFFFFF',
      paper: '#F9FAFB',
      secondary: '#F3F4F6'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF'
    },
    divider: '#E5E7EB',
    border: '#D1D5DB'
  },
  
  // 中性色系 - 深色模式
  dark: {
    background: {
      default: '#1F2937',
      paper: '#111827',
      secondary: '#374151'
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
      disabled: '#6B7280'
    },
    divider: '#374151',
    border: '#4B5563'
  },
  
  // 中性色系 - 高对比度模式
  highContrast: {
    background: {
      default: '#000000',
      paper: '#121212',
      secondary: '#1E1E1E'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      disabled: '#999999'
    },
    divider: '#444444',
    border: '#666666'
  }
};

// 排版系统
export const typography = {
  // 字体家族
  fontFamily: [
    'Inter',
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(','),
  
  // 字号层级
  fontSize: 16, // 基准字号
  
  // 标题
  h1: {
    fontSize: '2.5rem', // 40px
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontSize: '2rem', // 32px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em'
  },
  h4: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em'
  },
  h5: {
    fontSize: '1.125rem', // 18px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '-0.01em'
  },
  h6: {
    fontSize: '1rem', // 16px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '-0.01em'
  },
  
  // 正文
  body1: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em'
  },
  body2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em'
  },
  
  // 辅助文字
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em'
  },
  
  // 按钮文字
  button: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.02857em',
    textTransform: 'none'
  },
  
  // 字重
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700
};

// 间距系统（基于8px网格系统）
export const spacing = (factor) => `${8 * factor}px`;

// 圆角系统
export const shape = {
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    circle: '50%'
  }
};

// 阴影系统
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// 过渡系统
export const transitions = {
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  }
};

// 断点系统
export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  }
};

// Z轴系统
export const zIndex = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
  fab: 1600
};

// 组件变体
export const components = {
  // 按钮变体
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.medium,
        padding: '8px 16px',
        textTransform: 'none',
        fontWeight: typography.fontWeightMedium,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: shadows.sm
        }
      },
      sizeSmall: {
        padding: '6px 12px',
        fontSize: '0.8125rem'
      },
      sizeLarge: {
        padding: '10px 20px',
        fontSize: '0.9375rem'
      },
      contained: {
        '&:hover': {
          boxShadow: shadows.md
        }
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px'
        }
      },
      text: {
        padding: '8px 12px'
      }
    }
  },
  
  // 卡片变体
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.medium,
        boxShadow: shadows.md,
        overflow: 'hidden'
      }
    }
  },
  
  // 纸张变体
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.medium
      },
      elevation1: {
        boxShadow: shadows.sm
      },
      elevation2: {
        boxShadow: shadows.md
      },
      elevation3: {
        boxShadow: shadows.lg
      },
      elevation4: {
        boxShadow: shadows.xl
      },
      elevation5: {
        boxShadow: shadows['2xl']
      }
    }
  },
  
  // 输入框变体
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: shape.borderRadius.medium
        }
      }
    }
  },
  
  // 对话框变体
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: shape.borderRadius.large
      }
    }
  },
  
  // 抽屉变体
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0
      }
    }
  },
  
  // 应用栏变体
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: shadows.sm
      }
    }
  },
  
  // 图标按钮变体
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.medium
      }
    }
  },
  
  // 徽章变体
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: typography.fontWeightMedium,
        fontSize: '0.65rem'
      }
    }
  },
  
  // 提示变体
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: shape.borderRadius.small,
        fontSize: '0.75rem',
        padding: '6px 12px'
      }
    }
  },
  
  // 标签变体
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.medium
      }
    }
  },
  
  // 列表项变体
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.small
      }
    }
  },
  
  // 菜单项变体
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.small
      }
    }
  },
  
  // 表格变体
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '12px 16px'
      },
      head: {
        fontWeight: typography.fontWeightMedium
      }
    }
  },
  
  // 分割线变体
  MuiDivider: {
    styleOverrides: {
      root: {
        margin: '16px 0'
      }
    }
  },
  
  // 开关变体
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: 8
      },
      thumb: {
        boxShadow: shadows.sm
      }
    }
  },
  
  // 复选框变体
  MuiCheckbox: {
    styleOverrides: {
      root: {
        padding: 8
      }
    }
  },
  
  // 单选框变体
  MuiRadio: {
    styleOverrides: {
      root: {
        padding: 8
      }
    }
  },
  
  // 标签页变体
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: typography.fontWeightMedium,
        minWidth: 'auto',
        padding: '12px 16px'
      }
    }
  },
  
  // 警告提示变体
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.medium
      },
      standardSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: colors.success.dark
      },
      standardWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: colors.warning.dark
      },
      standardError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: colors.error.dark
      },
      standardInfo: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: colors.info.dark
      }
    }
  },
  
  // 进度条变体
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius.small,
        height: 6
      }
    }
  },
  
  // 圆形进度条变体
  MuiCircularProgress: {
    styleOverrides: {
      circle: {
        strokeLinecap: 'round'
      }
    }
  },
  
  // 浮动按钮变体
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: shadows.md,
        '&:hover': {
          boxShadow: shadows.lg
        }
      }
    }
  },
  
  // 滑块变体
  MuiSlider: {
    styleOverrides: {
      thumb: {
        boxShadow: shadows.sm
      }
    }
  }
};

// 创建设计系统
export const designSystem = {
  colors,
  typography,
  spacing,
  shape,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components
};