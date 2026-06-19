// jest.setup.js
require("@testing-library/jest-dom");

// IRON SHIELD: Clipboard Mock
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock Sentry & Supabase (same as before)
jest.mock("@sentry/react", () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  ErrorBoundary: ({ children }) => children,
  withScope: jest.fn((callback) =>
    callback({ setLevel: jest.fn(), setTag: jest.fn(), setExtra: jest.fn() })
  ),
}));

jest.mock("./src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

beforeEach(() => jest.clearAllMocks());
