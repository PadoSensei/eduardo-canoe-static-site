// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Update this to include .jsx
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(parse5|entities|whatwg-url|tr46|webidl-conversions)/)",
  ],

  testTimeout: 10000,
  clearMocks: true,
};
