/**
 * 无障碍工具函数
 * 提供无障碍相关的辅助功能
 */

/**
 * 生成ARIA属性对象
 * @param {Object} options - 选项
 * @param {string} options.id - 元素ID
 * @param {string} options.role - ARIA角色
 * @param {string} options.label - ARIA标签
 * @param {string} options.description - ARIA描述
 * @param {boolean} options.hidden - 是否对屏幕阅读器隐藏
 * @param {string} options.live - ARIA实时区域（off, polite, assertive）
 * @param {boolean} options.required - 是否必填
 * @param {boolean} options.expanded - 是否展开
 * @param {boolean} options.checked - 是否选中
 * @param {boolean} options.selected - 是否被选择
 * @param {boolean} options.disabled - 是否禁用
 * @param {boolean} options.invalid - 是否无效
 * @param {string} options.errorMessage - 错误消息
 * @param {string} options.controls - 控制的元素ID
 * @param {string} options.labelledBy - 标签元素ID
 * @param {string} options.describedBy - 描述元素ID
 * @param {string} options.flowTo - 流向元素ID
 * @param {string} options.owns - 拥有的元素ID
 * @returns {Object} - ARIA属性对象
 */
export const ariaAttributes = ({
  id,
  role,
  label,
  description,
  hidden,
  live,
  required,
  expanded,
  checked,
  selected,
  disabled,
  invalid,
  errorMessage,
  controls,
  labelledBy,
  describedBy,
  flowTo,
  owns
} = {}) => {
  const attrs = {};
  
  // 添加ID
  if (id) attrs.id = id;
  
  // 添加ARIA角色
  if (role) attrs['aria-role'] = role;
  
  // 添加ARIA标签
  if (label) attrs['aria-label'] = label;
  
  // 添加ARIA描述
  if (description) attrs['aria-description'] = description;
  
  // 添加ARIA隐藏
  if (hidden !== undefined) attrs['aria-hidden'] = hidden.toString();
  
  // 添加ARIA实时区域
  if (live) attrs['aria-live'] = live;
  
  // 添加ARIA必填
  if (required !== undefined) attrs['aria-required'] = required.toString();
  
  // 添加ARIA展开
  if (expanded !== undefined) attrs['aria-expanded'] = expanded.toString();
  
  // 添加ARIA选中
  if (checked !== undefined) attrs['aria-checked'] = checked.toString();
  
  // 添加ARIA被选择
  if (selected !== undefined) attrs['aria-selected'] = selected.toString();
  
  // 添加ARIA禁用
  if (disabled !== undefined) attrs['aria-disabled'] = disabled.toString();
  
  // 添加ARIA无效
  if (invalid !== undefined) {
    attrs['aria-invalid'] = invalid.toString();
    
    // 如果有错误消息，添加ARIA错误消息
    if (invalid && errorMessage) {
      attrs['aria-errormessage'] = errorMessage;
    }
  }
  
  // 添加ARIA控制
  if (controls) attrs['aria-controls'] = controls;
  
  // 添加ARIA标签元素
  if (labelledBy) attrs['aria-labelledby'] = labelledBy;
  
  // 添加ARIA描述元素
  if (describedBy) attrs['aria-describedby'] = describedBy;
  
  // 添加ARIA流向元素
  if (flowTo) attrs['aria-flowto'] = flowTo;
  
  // 添加ARIA拥有元素
  if (owns) attrs['aria-owns'] = owns;
  
  return attrs;
};

/**
 * 创建唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} - 唯一ID
 */
export const createUniqueId = (prefix = 'aria') => {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * 创建ARIA标签ID
 * @param {string} id - 元素ID
 * @returns {string} - 标签ID
 */
export const createLabelId = (id) => {
  return `${id}-label`;
};

/**
 * 创建ARIA描述ID
 * @param {string} id - 元素ID
 * @returns {string} - 描述ID
 */
export const createDescriptionId = (id) => {
  return `${id}-description`;
};

/**
 * 创建ARIA错误ID
 * @param {string} id - 元素ID
 * @returns {string} - 错误ID
 */
export const createErrorId = (id) => {
  return `${id}-error`;
};

/**
 * 创建键盘导航处理函数
 * @param {Object} options - 选项
 * @param {Function} options.onEnter - 回车键处理函数
 * @param {Function} options.onSpace - 空格键处理函数
 * @param {Function} options.onEscape - ESC键处理函数
 * @param {Function} options.onArrowUp - 上箭头键处理函数
 * @param {Function} options.onArrowDown - 下箭头键处理函数
 * @param {Function} options.onArrowLeft - 左箭头键处理函数
 * @param {Function} options.onArrowRight - 右箭头键处理函数
 * @param {Function} options.onTab - Tab键处理函数
 * @param {Function} options.onShiftTab - Shift+Tab键处理函数
 * @param {Function} options.onHome - Home键处理函数
 * @param {Function} options.onEnd - End键处理函数
 * @param {Function} options.onPageUp - PageUp键处理函数
 * @param {Function} options.onPageDown - PageDown键处理函数
 * @returns {Function} - 键盘事件处理函数
 */
export const createKeyboardHandler = ({
  onEnter,
  onSpace,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onShiftTab,
  onHome,
  onEnd,
  onPageUp,
  onPageDown
} = {}) => {
  return (event) => {
    // 检查修饰键
    const hasModifier = event.altKey || event.ctrlKey || event.metaKey;
    
    // 如果有修饰键（除了Shift），不处理
    if (hasModifier && !event.shiftKey) return;
    
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace(event);
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      case 'Tab':
        if (event.shiftKey && onShiftTab) {
          event.preventDefault();
          onShiftTab(event);
        } else if (!event.shiftKey && onTab) {
          event.preventDefault();
          onTab(event);
        }
        break;
      case 'Home':
        if (onHome) {
          event.preventDefault();
          onHome(event);
        }
        break;
      case 'End':
        if (onEnd) {
          event.preventDefault();
          onEnd(event);
        }
        break;
      case 'PageUp':
        if (onPageUp) {
          event.preventDefault();
          onPageUp(event);
        }
        break;
      case 'PageDown':
        if (onPageDown) {
          event.preventDefault();
          onPageDown(event);
        }
        break;
      default:
        break;
    }
  };
};

/**
 * 创建可聚焦元素的Tab索引
 * @param {boolean} focusable - 是否可聚焦
 * @returns {number} - Tab索引
 */
export const createTabIndex = (focusable) => {
  return focusable ? 0 : -1;
};

/**
 * 创建ARIA实时区域属性
 * @param {string} level - 实时级别（off, polite, assertive）
 * @returns {Object} - ARIA实时区域属性
 */
export const createLiveRegion = (level = 'polite') => {
  return {
    'aria-live': level,
    'aria-atomic': 'true'
  };
};

/**
 * 创建ARIA进度条属性
 * @param {number} value - 当前值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {string} valueText - 值文本
 * @returns {Object} - ARIA进度条属性
 */
export const createProgressBar = (value, min = 0, max = 100, valueText = null) => {
  const attrs = {
    role: 'progressbar',
    'aria-valuenow': value.toString(),
    'aria-valuemin': min.toString(),
    'aria-valuemax': max.toString()
  };
  
  if (valueText) {
    attrs['aria-valuetext'] = valueText;
  }
  
  return attrs;
};

/**
 * 创建ARIA对话框属性
 * @param {string} title - 对话框标题
 * @param {string} description - 对话框描述
 * @returns {Object} - ARIA对话框属性
 */
export const createDialog = (title, description = null) => {
  const id = createUniqueId('dialog');
  const titleId = createLabelId(id);
  const descriptionId = description ? createDescriptionId(id) : null;
  
  const attrs = {
    id,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': titleId
  };
  
  if (descriptionId) {
    attrs['aria-describedby'] = descriptionId;
  }
  
  return {
    dialog: attrs,
    title: { id: titleId },
    description: description ? { id: descriptionId } : null
  };
};

/**
 * 创建ARIA菜单属性
 * @param {string} label - 菜单标签
 * @returns {Object} - ARIA菜单属性
 */
export const createMenu = (label) => {
  const id = createUniqueId('menu');
  
  return {
    menu: {
      id,
      role: 'menu',
      'aria-label': label
    },
    item: {
      role: 'menuitem',
      tabIndex: -1
    }
  };
};

/**
 * 创建ARIA选项卡属性
 * @param {string} label - 选项卡标签
 * @returns {Object} - ARIA选项卡属性
 */
export const createTabs = (label) => {
  const id = createUniqueId('tabs');
  
  return {
    tablist: {
      id,
      role: 'tablist',
      'aria-label': label
    },
    tab: (selected) => ({
      role: 'tab',
      tabIndex: selected ? 0 : -1,
      'aria-selected': selected.toString()
    }),
    tabpanel: (labelId) => ({
      role: 'tabpanel',
      'aria-labelledby': labelId
    })
  };
};

/**
 * 创建ARIA树属性
 * @param {string} label - 树标签
 * @returns {Object} - ARIA树属性
 */
export const createTree = (label) => {
  const id = createUniqueId('tree');
  
  return {
    tree: {
      id,
      role: 'tree',
      'aria-label': label
    },
    treeitem: (expanded, selected) => ({
      role: 'treeitem',
      'aria-expanded': expanded ? expanded.toString() : undefined,
      'aria-selected': selected ? selected.toString() : undefined
    })
  };
};

/**
 * 创建ARIA列表属性
 * @param {string} label - 列表标签
 * @returns {Object} - ARIA列表属性
 */
export const createList = (label) => {
  const id = createUniqueId('list');
  
  return {
    list: {
      id,
      role: 'list',
      'aria-label': label
    },
    listitem: {
      role: 'listitem'
    }
  };
};

/**
 * 创建ARIA表格属性
 * @param {string} caption - 表格标题
 * @returns {Object} - ARIA表格属性
 */
export const createTable = (caption) => {
  const id = createUniqueId('table');
  
  return {
    table: {
      id,
      role: 'table',
      'aria-label': caption
    },
    row: {
      role: 'row'
    },
    cell: {
      role: 'cell'
    },
    headerCell: {
      role: 'columnheader'
    }
  };
};

/**
 * 创建ARIA工具提示属性
 * @param {string} id - 元素ID
 * @param {string} tooltipId - 工具提示ID
 * @returns {Object} - ARIA工具提示属性
 */
export const createTooltip = (id, tooltipId) => {
  return {
    trigger: {
      id,
      'aria-describedby': tooltipId
    },
    tooltip: {
      id: tooltipId,
      role: 'tooltip'
    }
  };
};

/**
 * 创建ARIA警告属性
 * @param {string} message - 警告消息
 * @param {string} level - 警告级别（error, warning, info）
 * @returns {Object} - ARIA警告属性
 */
export const createAlert = (_message, level = 'info') => {
  const id = createUniqueId('alert');
  
  return {
    id,
    role: 'alert',
    'aria-live': level === 'error' ? 'assertive' : 'polite'
  };
};

/**
 * 创建ARIA状态属性
 * @param {string} message - 状态消息
 * @returns {Object} - ARIA状态属性
 */
export const createStatus = (_message) => {
  const id = createUniqueId('status');
  
  return {
    id,
    role: 'status',
    'aria-live': 'polite'
  };
};

/**
 * 创建ARIA搜索框属性
 * @param {string} label - 搜索框标签
 * @returns {Object} - ARIA搜索框属性
 */
export const createSearchbox = (label) => {
  const id = createUniqueId('searchbox');
  
  return {
    id,
    role: 'searchbox',
    'aria-label': label
  };
};

/**
 * 创建ARIA复选框属性
 * @param {boolean} checked - 是否选中
 * @param {string} label - 复选框标签
 * @returns {Object} - ARIA复选框属性
 */
export const createCheckbox = (checked, label) => {
  const id = createUniqueId('checkbox');
  
  return {
    id,
    role: 'checkbox',
    'aria-checked': checked.toString(),
    'aria-label': label
  };
};

/**
 * 创建ARIA开关属性
 * @param {boolean} checked - 是否选中
 * @param {string} label - 开关标签
 * @returns {Object} - ARIA开关属性
 */
export const createSwitch = (checked, label) => {
  const id = createUniqueId('switch');
  
  return {
    id,
    role: 'switch',
    'aria-checked': checked.toString(),
    'aria-label': label
  };
};

/**
 * 创建ARIA滑块属性
 * @param {number} value - 当前值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {string} label - 滑块标签
 * @returns {Object} - ARIA滑块属性
 */
export const createSlider = (value, min, max, label) => {
  const id = createUniqueId('slider');
  
  return {
    id,
    role: 'slider',
    'aria-valuenow': value.toString(),
    'aria-valuemin': min.toString(),
    'aria-valuemax': max.toString(),
    'aria-label': label
  };
};

/**
 * 创建ARIA按钮属性
 * @param {string} label - 按钮标签
 * @param {boolean} pressed - 是否按下（切换按钮）
 * @returns {Object} - ARIA按钮属性
 */
export const createButton = (label, pressed = null) => {
  const id = createUniqueId('button');
  
  const attrs = {
    id,
    role: 'button',
    'aria-label': label
  };
  
  if (pressed !== null) {
    attrs['aria-pressed'] = pressed.toString();
  }
  
  return attrs;
};

/**
 * 创建ARIA链接属性
 * @param {string} label - 链接标签
 * @returns {Object} - ARIA链接属性
 */
export const createLink = (label) => {
  const id = createUniqueId('link');
  
  return {
    id,
    role: 'link',
    'aria-label': label
  };
};

/**
 * 创建ARIA图像属性
 * @param {string} alt - 图像替代文本
 * @returns {Object} - ARIA图像属性
 */
export const createImage = (alt) => {
  const id = createUniqueId('img');
  
  return {
    id,
    role: 'img',
    'aria-label': alt
  };
};

/**
 * 创建ARIA分隔线属性
 * @returns {Object} - ARIA分隔线属性
 */
export const createSeparator = () => {
  const id = createUniqueId('separator');
  
  return {
    id,
    role: 'separator'
  };
};

/**
 * 创建ARIA区域属性
 * @param {string} label - 区域标签
 * @returns {Object} - ARIA区域属性
 */
export const createRegion = (label) => {
  const id = createUniqueId('region');
  
  return {
    id,
    role: 'region',
    'aria-label': label
  };
};

/**
 * 创建ARIA标记属性
 * @param {string} label - 标记标签
 * @returns {Object} - ARIA标记属性
 */
export const createLandmark = (label) => {
  const id = createUniqueId('landmark');
  
  return {
    id,
    role: 'landmark',
    'aria-label': label
  };
};

/**
 * 创建ARIA导航属性
 * @param {string} label - 导航标签
 * @returns {Object} - ARIA导航属性
 */
export const createNavigation = (label) => {
  const id = createUniqueId('nav');
  
  return {
    id,
    role: 'navigation',
    'aria-label': label
  };
};

/**
 * 创建ARIA主要内容属性
 * @returns {Object} - ARIA主要内容属性
 */
export const createMain = () => {
  const id = createUniqueId('main');
  
  return {
    id,
    role: 'main'
  };
};

/**
 * 创建ARIA页脚属性
 * @returns {Object} - ARIA页脚属性
 */
export const createContentinfo = () => {
  const id = createUniqueId('contentinfo');
  
  return {
    id,
    role: 'contentinfo'
  };
};

/**
 * 创建ARIA页眉属性
 * @returns {Object} - ARIA页眉属性
 */
export const createBanner = () => {
  const id = createUniqueId('banner');
  
  return {
    id,
    role: 'banner'
  };
};

/**
 * 创建ARIA侧边栏属性
 * @param {string} label - 侧边栏标签
 * @returns {Object} - ARIA侧边栏属性
 */
export const createComplementary = (label) => {
  const id = createUniqueId('complementary');
  
  return {
    id,
    role: 'complementary',
    'aria-label': label
  };
};

/**
 * 创建ARIA表单属性
 * @param {string} label - 表单标签
 * @returns {Object} - ARIA表单属性
 */
export const createForm = (label) => {
  const id = createUniqueId('form');
  
  return {
    id,
    role: 'form',
    'aria-label': label
  };
};

/**
 * 创建ARIA搜索属性
 * @param {string} label - 搜索标签
 * @returns {Object} - ARIA搜索属性
 */
export const createSearch = (label) => {
  const id = createUniqueId('search');
  
  return {
    id,
    role: 'search',
    'aria-label': label
  };
};