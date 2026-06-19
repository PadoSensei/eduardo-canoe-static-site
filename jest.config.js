module.exports = {
  testEnvironment: "<rootDir>/jest.environment.js",
  setupFiles: ["<rootDir>/jest.globals.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/", "/dist/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^lucide-react(/.*)?$": "<rootDir>/__mocks__/lucide-react.js",
    "^until-async$": "<rootDir>/__mocks__/until-async.js",
  },
  transformIgnorePatterns: [
    "/node_modules/.pnpm/(?!(msw@|@mswjs\\+interceptors@|@open-draft\\+deferred-promise@|@open-draft\\+logger@|@open-draft\\+until@|until-async@|rettime@))",
    "/node_modules/(?!(msw|@mswjs|@open-draft|until-async|rettime|lucide-react|@sentry)/)",
  ],
  testEnvironmentOptions: {
    customExportConditions: ["node", "require", "default"],
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "mjs", "json"],
  maxWorkers: 1,
  forceExit: true,
};
