// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  // Transform ES modules in these packages
  transformIgnorePatterns: [
    "node_modules/(?!(msw|@mswjs|until-async|parse5|entities|whatwg-url|tr46|webidl-conversions)/)",
  ],
  // Required for MSW v2 to work correctly with JSDOM
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  // =============================================================================
  // EXCLUDE HELPER FILES FROM TEST RUNS
  // =============================================================================
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/.*[Hh]elper.*\\.(js|jsx)$",
  ],
  // Only match actual test files
  testMatch: [
    "**/__tests__/**/*.test.(js|jsx)",
    "**/__tests__/**/*.spec.(js|jsx)",
  ],
  // =============================================================================
  // STABILITY SETTINGS (Prevents SIGABRT crashes)
  // =============================================================================
  maxWorkers: 1,
  testTimeout: 30000,
  forceExit: true,
  clearMocks: true,
  verbose: true,
};
