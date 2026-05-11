// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^lucide-react/dist/esm/icons/(.*)$": "lucide-react/dist/esm/icons/$1",
  },
  // Transform ES modules in these packages
  transformIgnorePatterns: [
    "node_modules/(?!(msw|@mswjs|@open-draft|rettime|until-async|parse5|entities|whatwg-url|tr46|webidl-conversions|lucide-react)/)",
  ],
  // Required for MSW v2 to work correctly with JSDOM
  testEnvironmentOptions: { customExportConditions: [""] },
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/.*[Hh]elper.*\\.(js|jsx)$"],
  testMatch: ["**/__tests__/**/*.test.(js|jsx|ts|tsx)", "**/__tests__/**/*.spec.(js|jsx|ts|tsx)"],
  maxWorkers: 1,
  testTimeout: 30000,
  forceExit: true,
  clearMocks: true,
  verbose: true,
};
