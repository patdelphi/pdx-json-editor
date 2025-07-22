/**
 * Jest 配置文件
 */

module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "monaco-editor": "<rootDir>/src/__mocks__/monaco-editor.js"
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js"
  ],
  testMatch: [
    "<rootDir>/src/services/__tests__/configService.test.js",
    "<rootDir>/src/services/__tests__/errorService.test.js",
    "<rootDir>/src/services/__tests__/fileService.test.js",
    "<rootDir>/src/services/__tests__/jsonService.test.js",
    "<rootDir>/src/services/__tests__/performanceService.test.js",
    "<rootDir>/src/services/__tests__/persistenceService.test.js",
    "<rootDir>/src/services/__tests__/searchService.test.js",
    "<rootDir>/src/services/__tests__/stateService.test.js",
    "<rootDir>/src/services/__tests__/validationService.test.js"
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.d.ts",
    "!src/main.jsx"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(preact|@preact|preact-render-to-string|preact-compat|@monaco-editor|monaco-editor)/)"
  ]
};