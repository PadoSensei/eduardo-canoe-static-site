const { TestEnvironment } = require("jest-environment-jsdom");

class CustomEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    this.global.fetch    = globalThis.fetch;
    this.global.Request  = globalThis.Request;
    this.global.Response = globalThis.Response;
    this.global.Headers  = globalThis.Headers;
    this.global.MessageEvent = globalThis.MessageEvent ?? this.global.MessageEvent;
  }
}

module.exports = CustomEnvironment;
