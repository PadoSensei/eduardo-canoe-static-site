const React = require("react");

/**
 * SENIOR FIX: The Proxy Mock.
 * Instead of mapping 1000+ individual icon files, this Proxy intercepts
 * any property access (like 'Loader2' or 'ShieldCheck') and returns
 * a simple SVG component. This fixes all Lucide resolution errors instantly.
 */
const icon = (props) => React.createElement("svg", { ...props });

module.exports = new Proxy(
  {},
  {
    get: () => icon,
  }
);
