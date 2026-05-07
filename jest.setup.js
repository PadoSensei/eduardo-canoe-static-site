// jest.setup.js
// ==============================================================================
// POLYFILLS - Required for MSW v2 with JSDOM
// ==============================================================================
const util = require("util");
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require("node:stream/web");
const { BroadcastChannel } = require("worker_threads");
const { Blob, File } = require("node:buffer");

global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.WritableStream = WritableStream;
global.setImmediate = (fn) => setTimeout(fn, 0);

if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = BroadcastChannel;
}

if (typeof global.Blob === "undefined") {
  global.Blob = Blob;
  global.File = File;
}

require("@testing-library/jest-dom");
require("whatwg-fetch");

// ==============================================================================
// BROWSER API MOCKS
// ==============================================================================
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// ==============================================================================
// GLOBAL MOCKS - Prevent background network/timer leakage
// ==============================================================================

// Sentry Mock
jest.mock("@sentry/react", () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
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

// Supabase Mock - Prevents auth websocket/timer leaks
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

// ==============================================================================
// NOTE: Do NOT add global afterEach/afterAll with async operations here!
// They conflict with fake timers in individual tests and cause timeouts.
// Each test file should handle its own cleanup.
// ==============================================================================
