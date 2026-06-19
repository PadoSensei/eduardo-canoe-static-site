// jest.environment.js
const JSDOMEnvironment = require("jest-environment-jsdom").default;

class CustomTestEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();

    // IRON SHIELD: Absolute Global Alignment
    // Tunneling native Node 22 globals into the JSDOM sandbox.
    this.global.fetch = globalThis.fetch;
    this.global.Request = globalThis.Request;
    this.global.Response = globalThis.Response;
    this.global.Headers = globalThis.Headers;
    this.global.TextEncoder = globalThis.TextEncoder;
    this.global.TextDecoder = globalThis.TextDecoder;
    this.global.Uint8Array = globalThis.Uint8Array;

    // MSW v2 compatibility
    this.global.BroadcastChannel = globalThis.BroadcastChannel;
    this.global.MessageChannel = globalThis.MessageChannel;

    console.log("🛡️ IRON SHIELD: Bridge Active. Using native Node 22 globals.");
  }
}

module.exports = CustomTestEnvironment;
