const nrwlConfig = require("@nrwl/react/plugins/bundle-rollup");
const json = require("@rollup/plugin-json");
const svgr = require("@svgr/rollup");

module.exports = (config) => {
  config = nrwlConfig(config);

  config.context = "window";
  config.plugins.push(json());
  config.plugins.push(svgr.default());
  return config;
};
