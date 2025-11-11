// jest.setup.js
import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { Buffer } from "buffer";
global.Buffer = Buffer;

// Attempt to polyfill URL/URLSearchParams if they aren't globally available
if (typeof URL === "undefined") {
  try {
    const { URL: URLImpl } = require("whatwg-url");
    global.URL = URLImpl;
  } catch (e) {
    console.error(
      "Failed to polyfill global.URL from 'whatwg-url'. Check transformIgnorePatterns.",
      e
    );
  }
}

if (typeof URLSearchParams === "undefined") {
  try {
    const { URLSearchParams: URLSearchParamsImpl } = require("whatwg-url");
    global.URLSearchParams = URLSearchParamsImpl;
  } catch (e) {
    console.error(
      "Failed to polyfill global.URLSearchParams from 'whatwg-url'. Check transformIgnorePatterns.",
      e
    );
  }
}
