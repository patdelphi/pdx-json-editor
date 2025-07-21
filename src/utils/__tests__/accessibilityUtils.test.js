/**
 * 无障碍工具函数测试
 */

import {
  ariaAttributes,
  createUniqueId,
  createLabelId,
  createDescriptionId,
  createErrorId,
  createKeyboardHandler,
  createTabIndex,
  createLiveRegion,
  createProgressBar,
  createDialog,
  createMenu,
  createTabs,
  createTree,
  createList,
  createTable,
  createTooltip,
  createAlert,
  createStatus,
  createSearchbox,
  createCheckbox,
  createSwitch,
  createSlider,
  createButton,
  createLink,
  createImage,
  createSeparator,
  createRegion,
  createLandmark,
  createNavigation,
  createMain,
  createContentinfo,
  createBanner,
  createComplementary,
  createForm,
  createSearch
} from '../accessibilityUtils';

describe('accessibilityUtils', () => {
  describe('ariaAttributes', () => {
    test('应生成ARIA属性对象', () => {
      const attrs = ariaAttributes({
        id: 'test-id',
        role: 'button',
        label: 'Test Button',
        description: 'This is a test button',
        hidden: false,
        live: 'polite',
        required: true,
        expanded: false,
        checked: true,
        selected: false,
        disabled: false,
        invalid: true,
        errorMessage: 'This field is required',
        controls: 'test-panel',
        labelledBy: 'test-label',
        describedBy: 'test-desc',
        flowTo: 'test-next',
        owns: 'test-child'
      });
      
      expect(attrs).toEqual({
        id: 'test-id',
        'aria-role': 'button',
        'aria-label': 'Test Button',
        'aria-description': 'This is a test button',
        'aria-hidden': 'false',
        'aria-live': 'polite',
        'aria-required': 'true',
        'aria-expanded': 'false',
        'aria-checked': 'true',
        'aria-selected': 'false',
        'aria-disabled': 'false',
        'aria-invalid': 'true',
        'aria-errormessage': 'This field is required',
        'aria-controls': 'test-panel',
        'aria-labelledby': 'test-label',
        'aria-describedby': 'test-desc',
        'aria-flowto': 'test-next',
        'aria-owns': 'test-child'
      });
    });
    
    test('应只包含提供的属性', () => {
      const attrs = ariaAttributes({
        label: 'Test Label',
        hidden: true
      });
      
      expect(attrs).toEqual({
        'aria-label': 'Test Label',
        'aria-hidden': 'true'
      });
    });
  });
  
  describe('createUniqueId', () => {
    test('应生成唯一ID', () => {
      const id1 = createUniqueId();
      const id2 = createUniqueId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^aria-/);
    });
    
    test('应使用提供的前缀', () => {
      const id = createUniqueId('test');
      
      expect(id).toMatch(/^test-/);
    });
  });
  
  describe('createLabelId', () => {
    test('应生成标签ID', () => {
      const id = createLabelId('test');
      
      expect(id).toBe('test-label');
    });
  });
  
  describe('createDescriptionId', () => {
    test('应生成描述ID', () => {
      const id = createDescriptionId('test');
      
      expect(id).toBe('test-description');
    });
  });
  
  describe('createErrorId', () => {
    test('应生成错误ID', () => {
      const id = createErrorId('test');
      
      expect(id).toBe('test-error');
    });
  });
  
  describe('createKeyboardHandler', () => {
    test('应处理键盘事件', () => {
      const onEnter = jest.fn();
      const onSpace = jest.fn();
      const onEscape = jest.fn();
      const onArrowUp = jest.fn();
      
      const handler = createKeyboardHandler({
        onEnter,
        onSpace,
        onEscape,
        onArrowUp
      });
      
      // 模拟事件
      const preventDefault = jest.fn();
      
      // 测试Enter键
      handler({ key: 'Enter', preventDefault });
      expect(onEnter).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
      
      // 测试Space键
      handler({ key: ' ', preventDefault });
      expect(onSpace).toHaveBeenCalled();
      
      // 测试Escape键
      handler({ key: 'Escape', preventDefault });
      expect(onEscape).toHaveBeenCalled();
      
      // 测试ArrowUp键
      handler({ key: 'ArrowUp', preventDefault });
      expect(onArrowUp).toHaveBeenCalled();
      
      // 测试未处理的键
      handler({ key: 'A', preventDefault });
      expect(preventDefault.mock.calls.length).toBe(4); // 仍然是4次，没有增加
    });
    
    test('应忽略带修饰键的事件', () => {
      const onEnter = jest.fn();
      
      const handler = createKeyboardHandler({
        onEnter
      });
      
      // 模拟带修饰键的事件
      handler({
        key: 'Enter',
        altKey: true,
        preventDefault: jest.fn()
      });
      
      expect(onEnter).not.toHaveBeenCalled();
    });
  });
  
  describe('createTabIndex', () => {
    test('应返回正确的tabIndex', () => {
      expect(createTabIndex(true)).toBe(0);
      expect(createTabIndex(false)).toBe(-1);
    });
  });
  
  describe('createLiveRegion', () => {
    test('应创建实时区域属性', () => {
      const attrs = createLiveRegion('assertive');
      
      expect(attrs).toEqual({
        'aria-live': 'assertive',
        'aria-atomic': 'true'
      });
    });
    
    test('应使用默认值', () => {
      const attrs = createLiveRegion();
      
      expect(attrs).toEqual({
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
    });
  });
  
  describe('createProgressBar', () => {
    test('应创建进度条属性', () => {
      const attrs = createProgressBar(50, 0, 100, '50%');
      
      expect(attrs).toEqual({
        role: 'progressbar',
        'aria-valuenow': '50',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuetext': '50%'
      });
    });
    
    test('应使用默认值', () => {
      const attrs = createProgressBar(50);
      
      expect(attrs).toEqual({
        role: 'progressbar',
        'aria-valuenow': '50',
        'aria-valuemin': '0',
        'aria-valuemax': '100'
      });
    });
  });
  
  describe('createDialog', () => {
    test('应创建对话框属性', () => {
      const { dialog, title, description } = createDialog('Dialog Title', 'Dialog Description');
      
      expect(dialog.role).toBe('dialog');
      expect(dialog['aria-modal']).toBe('true');
      expect(dialog['aria-labelledby']).toBe(title.id);
      expect(dialog['aria-describedby']).toBe(description.id);
    });
    
    test('应处理没有描述的情况', () => {
      const { dialog, title, description } = createDialog('Dialog Title');
      
      expect(dialog['aria-labelledby']).toBe(title.id);
      expect(dialog['aria-describedby']).toBeUndefined();
      expect(description).toBeNull();
    });
  });
  
  describe('createMenu', () => {
    test('应创建菜单属性', () => {
      const { menu, item } = createMenu('Menu Label');
      
      expect(menu.role).toBe('menu');
      expect(menu['aria-label']).toBe('Menu Label');
      expect(item.role).toBe('menuitem');
      expect(item.tabIndex).toBe(-1);
    });
  });
  
  describe('createTabs', () => {
    test('应创建选项卡属性', () => {
      const { tablist, tab, tabpanel } = createTabs('Tabs Label');
      
      expect(tablist.role).toBe('tablist');
      expect(tablist['aria-label']).toBe('Tabs Label');
      
      const selectedTab = tab(true);
      expect(selectedTab.role).toBe('tab');
      expect(selectedTab['aria-selected']).toBe('true');
      expect(selectedTab.tabIndex).toBe(0);
      
      const unselectedTab = tab(false);
      expect(unselectedTab['aria-selected']).toBe('false');
      expect(unselectedTab.tabIndex).toBe(-1);
      
      const panel = tabpanel('tab-1');
      expect(panel.role).toBe('tabpanel');
      expect(panel['aria-labelledby']).toBe('tab-1');
    });
  });
  
  describe('createButton', () => {
    test('应创建按钮属性', () => {
      const attrs = createButton('Button Label', true);
      
      expect(attrs.role).toBe('button');
      expect(attrs['aria-label']).toBe('Button Label');
      expect(attrs['aria-pressed']).toBe('true');
    });
    
    test('应处理非切换按钮', () => {
      const attrs = createButton('Button Label');
      
      expect(attrs['aria-pressed']).toBeUndefined();
    });
  });
});