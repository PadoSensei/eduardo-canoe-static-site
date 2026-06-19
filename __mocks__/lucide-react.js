const React = require("react");
const icon = (_props) => React.createElement("svg", {});
const handler = { get: (_target, _key) => icon };
module.exports = new Proxy({}, handler);
