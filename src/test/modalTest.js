/**
 * 模态窗口测试脚本
 * 
 * 这个脚本提供了一些测试函数，用于测试模态窗口的显示和关闭功能。
 * 可以在浏览器控制台中运行这些函数来测试模态窗口。
 */

// 测试格式化模态窗口
function testFormatModal() {
  console.log('测试格式化模态窗口...');
  document.querySelector('button:nth-of-type(3)').click();
}

// 测试压缩模态窗口
function testMinifyModal() {
  console.log('测试压缩模态窗口...');
  document.querySelector('button:nth-of-type(4)').click();
}

// 测试验证模态窗口
function testValidateModal() {
  console.log('测试验证模态窗口...');
  document.querySelector('button:nth-of-type(5)').click();
}

// 测试搜索面板
function testSearchPanel() {
  console.log('测试搜索面板...');
  document.querySelector('button:nth-of-type(7)').click();
}

// 测试设置面板
function testSettingsPanel() {
  console.log('测试设置面板...');
  document.querySelector('button:nth-of-type(8)').click();
}

// 测试ESC键关闭
function testEscKey() {
  console.log('测试ESC键关闭...');
  console.log('请按ESC键关闭当前打开的模态窗口');
  
  // 创建一个事件监听器，监听ESC键按下事件
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      console.log('ESC键被按下，模态窗口应该关闭');
    }
  }, { once: true });
}

// 测试点击外部关闭
function testClickOutside() {
  console.log('测试点击外部关闭...');
  console.log('请点击模态窗口外部区域关闭当前打开的模态窗口');
}

// 运行所有测试
function runAllTests() {
  console.log('开始测试模态窗口...');
  console.log('请按照提示进行测试');
  
  console.log('1. 测试格式化模态窗口');
  console.log('2. 测试压缩模态窗口');
  console.log('3. 测试验证模态窗口');
  console.log('4. 测试搜索面板');
  console.log('5. 测试设置面板');
  console.log('6. 测试ESC键关闭');
  console.log('7. 测试点击外部关闭');
  
  console.log('请在浏览器控制台中运行相应的测试函数');
  console.log('例如：testFormatModal()');
}

// 导出测试函数
window.testFormatModal = testFormatModal;
window.testMinifyModal = testMinifyModal;
window.testValidateModal = testValidateModal;
window.testSearchPanel = testSearchPanel;
window.testSettingsPanel = testSettingsPanel;
window.testEscKey = testEscKey;
window.testClickOutside = testClickOutside;
window.runAllTests = runAllTests;

console.log('模态窗口测试脚本已加载');
console.log('请在浏览器控制台中运行 runAllTests() 开始测试');