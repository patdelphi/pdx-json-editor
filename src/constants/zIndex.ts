/**
 * Z-Index常量
 *
 * 这个文件定义了应用程序中使用的所有z-index值，
 * 以确保组件之间的层叠顺序一致。
 */

const Z_INDEX = {
  // 基础层级
  BASE: 1,

  // 下拉菜单和工具提示
  DROPDOWN: 10,
  TOOLTIP: 20,

  // 编辑器组件
  EDITOR_GUTTER: 30,
  EDITOR_CONTENT: 40,

  // 面板组件
  SEARCH_PANEL: 100,

  // 模态窗口组件
  MODAL_OVERLAY: 9000,
  MODAL_CONTENT: 9100,

  // 顶层组件（通知、警告等）
  TOAST: 9500,
};

export default Z_INDEX;
