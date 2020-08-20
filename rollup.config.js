const nrwlConfig = require("@nrwl/react/plugins/bundle-rollup");
const json = require("@rollup/plugin-json");

module.exports = (config) => {
  config = nrwlConfig(config);

  config.context = "window";
  config.plugins.push(json());
  return config;
};
