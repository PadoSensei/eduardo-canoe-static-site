// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  // Added until-async, msw, and @mswjs to the list of things to TRANSFORMe
  transformIgnorePatterns: [
    "node_modules/(?!(msw|@mswjs|until-async|parse5|entities|whatwg-url|tr46|webidl-conversions)/)",
  ],

  // This allows MSW v2 to work correctly with JSDOM's export conditions
  testEnvironmentOptions: {
    customExportConditions: [""],
  },

  testTimeout: 10000,
  clearMocks: true,
};
