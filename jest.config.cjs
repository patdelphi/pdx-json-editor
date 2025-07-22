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
    "<rootDir>/src/services/__tests__/**/*.{js,jsx}"
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