/**
 * Jest 配置文件
 */

module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "monaco-editor": "<rootDir>/src/__mocks__/monaco-editor.js",
    "^preact$": "<rootDir>/node_modules/preact/compat/dist/compat.js",
    "^preact/hooks$": "<rootDir>/node_modules/preact/hooks/dist/hooks.js",
    "^@testing-library/preact$": "<rootDir>/node_modules/@testing-library/preact/dist/cjs/index.js",
    "^@testing-library/preact-hooks$": "<rootDir>/node_modules/@testing-library/preact-hooks/dist/index.js"
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
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
  transformIgnorePatterns: [
    "node_modules/(?!(preact|@preact|@testing-library|@monaco-editor|monaco-editor)/)"
  ],
  verbose: true,
  testTimeout: 30000
};