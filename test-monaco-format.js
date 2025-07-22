// 测试Monaco编辑器的格式化功能
// 这个脚本可以在浏览器控制台中运行

console.log('=== 测试Monaco编辑器的格式化功能 ===');

// 检查全局对象是否存在
if (typeof window !== 'undefined' && window.pdxJsonEditor) {
  console.log('✅ 全局对象 window.pdxJsonEditor 存在');
  
  // 检查必要的函数是否存在
  const requiredFunctions = ['formatJson', 'compressJson', 'tryFixJson', 'getEditorRef'];
  const missingFunctions = requiredFunctions.filter(fn => typeof window.pdxJsonEditor[fn] !== 'function');
  
  if (missingFunctions.length === 0) {
    console.log('✅ 所有必要的函数都存在');
    
    // 获取编辑器实例
    const editor = window.pdxJsonEditor.getEditorRef();
    if (editor) {
      console.log('✅ 获取编辑器实例成功');
      
      // 检查编辑器是否有格式化功能
      const formatAction = editor.getAction('editor.action.formatDocument');
      if (formatAction) {
        console.log('✅ 编辑器有格式化功能');
      } else {
        console.log('❌ 编辑器没有格式化功能');
      }
    } else {
      console.log('❌ 获取编辑器实例失败');
    }
  } else {
    console.log('❌ 缺少以下函数:', missingFunctions);
  }
} else {
  console.log('❌ 全局对象 window.pdxJsonEditor 不存在');
}

console.log('=== 测试完成 ===');