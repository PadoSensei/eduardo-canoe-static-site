// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
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
    "**/__tests__/**/*.test.(js|jsx|ts|tsx)",
    "**/__tests__/**/*.spec.(js|jsx|ts|tsx)",
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
