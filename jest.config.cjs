/**
 * Jest 配置文件
 */

module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ".(css|less|scss|sass)$": "identity-obj-proxy",
    "monaco-editor": "<rootDir>/src/__mocks__/monaco-editor.js",
    "^preact$": "preact/compat",
    "^preact/hooks$": "preact/hooks",
    "^preact/compat$": "preact/compat",
    "^@testing-library/preact$": "@testing-library/preact",
    "^@testing-library/preact-hooks$": "@testing-library/preact-hooks",
    "^preact/test-utils$": "preact/test-utils"
  },
  transform: {
    "^.+\.(js|jsx|mjs)$": "babel-jest"
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js"
  ],
  testMatch: [
    "<rootDir>/src/integration.test.js",
    "<rootDir>/src/performance.test.js"
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.d.ts",
    "!src/main.jsx",
    "!src/__mocks__/**"
  ],
  
  verbose: true,
  testTimeout: 30000
};