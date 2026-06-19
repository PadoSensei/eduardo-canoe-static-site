require("@testing-library/jest-dom");

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

jest.mock("@sentry/react", () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  ErrorBoundary: ({ children }) => children,
  withScope: jest.fn((callback) =>
    callback({
      setLevel: jest.fn(),
      setTag: jest.fn(),
      setExtra: jest.fn(),
    })
  ),
  makeFetchTransport: jest.fn(() => ({
    send: () => Promise.resolve({ status: "success" }),
    flush: () => Promise.resolve(true),
  })),
}));

jest.mock("./src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// NOTE: No global afterEach/afterAll with async here — conflicts with fake timers.
// Each test file handles its own MSW server lifecycle.
