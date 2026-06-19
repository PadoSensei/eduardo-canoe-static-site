const React = require("react");
const icon = ({ size, color, ...props }) => React.createElement("svg", props);
const handler = { get: (_, key) => icon };
module.exports = new Proxy({}, handler);
