/**
 * Jest设置文件
 */

// 导入jest-dom扩展
import '@testing-library/jest-dom';

// 模拟matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 模拟IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 模拟requestAnimationFrame
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};

// 模拟cancelAnimationFrame
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// 模拟localStorage


// 模拟URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'blob:test');
URL.revokeObjectURL = jest.fn();