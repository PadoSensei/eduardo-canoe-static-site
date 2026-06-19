// babel.config.js
module.exports = {
  // SENIOR FIX: "unambiguous" tells Babel to guess the file type based on
  // the presence of import/export statements. This is critical for
  // transforming ESM-only dependencies inside node_modules/.pnpm
  sourceType: "unambiguous",

  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            // SENIOR FIX: Transforms Vite's 'import.meta' into Node's 'process'
            // allowing tests to read environment variables correctly.
            path.replaceWithSourceString("process");
          },
        },
      };
    },
  ],
};
