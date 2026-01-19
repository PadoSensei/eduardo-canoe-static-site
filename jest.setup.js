// jest.setup.js
import "@testing-library/jest-dom";
import "whatwg-fetch";

const util = require("util");
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require("node:stream/web");
const { BroadcastChannel } = require("worker_threads"); // NEW: Required for MSW v2
const { Blob, File } = require("node:buffer"); // NEW: Defensive polyfill

// 1. Polyfill Encoding API
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

// 2. Polyfill Web Streams API
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.WritableStream = WritableStream;

// 3. Polyfill BroadcastChannel (The fix for your current error)
if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = BroadcastChannel;
}

// 4. Polyfill Blob/File
if (typeof global.Blob === "undefined") {
  global.Blob = Blob;
  global.File = File;
}

// 5. Polyfill Fetch API Globals
global.Headers = global.Headers || fetch.Headers;
global.Request = global.Request || fetch.Request;
global.Response = global.Response || fetch.Response;

// 6. Polyfill Buffer
if (typeof global.Buffer === "undefined") {
  global.Buffer = require("buffer").Buffer;
}

// 7. Polyfill setImmediate (FIX for your current error)
if (typeof global.setImmediate === "undefined") {
  global.setImmediate = (fn) => setTimeout(fn, 0);
}

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});
