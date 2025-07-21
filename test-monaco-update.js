// 测试Monaco编辑器更新功能
// 这个脚本可以在浏览器控制台中运行

console.log('=== 测试Monaco编辑器更新功能 ===');

// 检查全局对象是否存在
if (typeof window !== 'undefined' && window.pdxJsonEditor) {
  console.log('✅ 全局对象 window.pdxJsonEditor 存在');
  
  // 检查必要的函数是否存在
  const requiredFunctions = ['formatJson', 'compressJson', 'tryFixJson', 'getCurrentContent', 'setContent', 'getEditorRef'];
  const missingFunctions = requiredFunctions.filter(fn => typeof window.pdxJsonEditor[fn] !== 'function');
  
  if (missingFunctions.length === 0) {
    console.log('✅ 所有必要的函数都存在');
    
    // 测试获取当前内容
    try {
      const currentContent = window.pdxJsonEditor.getCurrentContent();
      console.log('✅ 获取当前内容成功:', currentContent.substring(0, 50) + '...');
      
      // 测试设置内容
      const testJson = '{"test": "content", "number": 123}';
      window.pdxJsonEditor.setContent(testJson);
      console.log('✅ 设置内容成功');
      
      // 验证内容是否更新
      const updatedContent = window.pdxJsonEditor.getCurrentContent();
      if (updatedContent === testJson) {
        console.log('✅ 内容更新验证成功');
      } else {
        console.log('❌ 内容更新验证失败');
        console.log('期望:', testJson);
        console.log('实际:', updatedContent);
      }
      
    } catch (err) {
      console.log('❌ 测试过程中出现错误:', err.message);
    }
    
  } else {
    console.log('❌ 缺少以下函数:', missingFunctions);
  }
  
} else {
  console.log('❌ 全局对象 window.pdxJsonEditor 不存在');
  console.log('请确保编辑器组件已经加载');
}

console.log('=== 测试完成 ===');