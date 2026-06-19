const util = require("util");
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require("node:stream/web");
const {
  BroadcastChannel,
  MessagePort,
  MessageChannel,
} = require("worker_threads");
const { Blob, File } = require("node:buffer");

global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.WritableStream = WritableStream;
global.setImmediate = (fn) => setTimeout(fn, 0);

if (typeof global.BroadcastChannel === "undefined")
  global.BroadcastChannel = BroadcastChannel;
if (typeof global.MessagePort === "undefined") global.MessagePort = MessagePort;
if (typeof global.MessageChannel === "undefined")
  global.MessageChannel = MessageChannel;
if (typeof global.Blob === "undefined") global.Blob = Blob;
if (typeof global.File === "undefined") global.File = File;

// Node 22 native fetch -- must exist before MSW imports Request at module load
global.fetch = globalThis.fetch;
global.Request = globalThis.Request;
global.Response = globalThis.Response;
global.Headers = globalThis.Headers;
