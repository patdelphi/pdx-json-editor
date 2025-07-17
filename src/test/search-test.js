/**
 * 搜索功能测试脚本
 * 
 * 此脚本用于测试JSON编辑器的搜索和替换功能。
 * 测试步骤：
 * 
 * 1. 测试搜索功能
 *    - 按Ctrl+F打开搜索面板
 *    - 输入搜索关键词
 *    - 验证搜索结果是否正确高亮
 *    - 使用下一个/上一个按钮导航搜索结果
 *    - 验证循环导航是否正常工作
 * 
 * 2. 测试替换功能
 *    - 按Ctrl+H打开替换面板
 *    - 输入搜索关键词和替换文本
 *    - 执行单个替换操作
 *    - 执行全部替换操作
 *    - 验证替换结果是否正确
 * 
 * 3. 测试搜索选项
 *    - 测试区分大小写选项
 *    - 测试正则表达式选项
 *    - 测试全字匹配选项
 * 
 * 4. 测试不同大小的JSON文档
 *    - 测试小型JSON文档
 *    - 测试中型JSON文档
 *    - 测试大型JSON文档
 * 
 * 5. 测试键盘快捷键
 *    - Ctrl+F: 打开搜索面板
 *    - Ctrl+H: 打开替换面板
 *    - Enter: 查找下一个
 *    - Shift+Enter: 查找上一个
 *    - Escape: 关闭面板
 */

// 测试数据
const testData = {
  small: '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}',
  medium: '{\n  "users": [\n    {\n      "name": "John",\n      "age": 30,\n      "city": "New York"\n    },\n    {\n      "name": "Jane",\n      "age": 25,\n      "city": "Boston"\n    },\n    {\n      "name": "Bob",\n      "age": 40,\n      "city": "Chicago"\n    }\n  ]\n}',
  large: '{\n  "users": [\n    /* 此处省略大量数据 */\n  ]\n}'
};

// 测试用例
const testCases = [
  {
    name: '基本搜索功能',
    searchText: 'name',
    expectedMatches: 4, // 在medium数据中出现4次
    description: '测试基本搜索功能是否正常工作'
  },
  {
    name: '区分大小写搜索',
    searchText: 'Name',
    caseSensitive: true,
    expectedMatches: 0, // 在medium数据中不存在大写的Name
    description: '测试区分大小写搜索是否正常工作'
  },
  {
    name: '正则表达式搜索',
    searchText: 'n[a-z]+e',
    useRegex: true,
    expectedMatches: 4, // 匹配"name"和"Jane"
    description: '测试正则表达式搜索是否正常工作'
  },
  {
    name: '全字匹配搜索',
    searchText: 'age',
    wholeWord: true,
    expectedMatches: 3, // 匹配3个"age"字段
    description: '测试全字匹配搜索是否正常工作'
  },
  {
    name: '替换功能',
    searchText: 'John',
    replaceText: 'Jonathan',
    description: '测试替换功能是否正常工作'
  },
  {
    name: '全部替换功能',
    searchText: 'name',
    replaceText: 'fullName',
    description: '测试全部替换功能是否正常工作'
  }
];

// 测试执行函数
function runTests() {
  console.log('开始执行搜索功能测试...');
  
  // 此处需要手动执行测试，因为需要用户交互
  console.log('请按照以下步骤手动测试:');
  console.log('1. 按Ctrl+F打开搜索面板');
  console.log('2. 输入搜索关键词');
  console.log('3. 验证搜索结果是否正确高亮');
  console.log('4. 使用下一个/上一个按钮导航搜索结果');
  console.log('5. 验证循环导航是否正常工作');
  
  console.log('\n测试用例:');
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}: ${testCase.description}`);
    console.log(`   搜索文本: "${testCase.searchText}"`);
    if (testCase.replaceText) {
      console.log(`   替换文本: "${testCase.replaceText}"`);
    }
    if (testCase.expectedMatches !== undefined) {
      console.log(`   预期匹配数: ${testCase.expectedMatches}`);
    }
    console.log('');
  });
}

// 导出测试函数
export default runTests;