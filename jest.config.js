// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Transform ESM packages from node_modules
  transformIgnorePatterns: [
    "node_modules/(?!(parse5|entities|whatwg-url|tr46|webidl-conversions)/)",
  ],

  // Use babel-jest for transformation
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // Set test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
};
