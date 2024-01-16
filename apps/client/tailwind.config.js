const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("../../tailwind.config.js")],
  content: [
    join(__dirname, "index.html"),
    join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("progress-unfilled", ["&::-webkit-progress-bar", "&::-moz-range-progress", "&"]);
      addVariant("progress-filled", ["&::-webkit-progress-value", "&::-moz-progress-bar", "&"]);
      addVariant("slider-track", ["&::-webkit-slider-thumb", "&::-moz-range-thumb", "&"]);
    }),
  ],
};
